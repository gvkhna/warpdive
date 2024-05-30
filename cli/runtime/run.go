package runtime

import (
	"archive/tar"
	"bytes"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"net/url"
	"os/exec"
	"os/user"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"os"
	"sync"

	"github.com/gvkhna/warpdive/dive"
	"github.com/gvkhna/warpdive/dive/filetree"
	"github.com/gvkhna/warpdive/dive/image"
	"github.com/gvkhna/warpdive/utils"
	"github.com/sirupsen/logrus"
	"github.com/spf13/afero"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/anypb"
	"google.golang.org/protobuf/types/known/timestamppb"
	"gopkg.in/yaml.v2"

	warpdive "github.com/gvkhna/warpdive/generated"
)

// Global logger instance
var warpDiveLogger *WarpDiveLogger

// WarpDiveLogger represents a custom logger
type WarpDiveLogger struct {
	enabled bool
	logger  *log.Logger
}

// NewWarpDiveLogger creates a new WarpDiveLogger instance
func NewWarpDiveLogger() *WarpDiveLogger {
	enabled := os.Getenv("WARPDIVE_DEBUG") != ""
	return &WarpDiveLogger{
		enabled: enabled,
		logger:  log.New(os.Stdout, "WarpDive: ", log.LstdFlags),
	}
}

// Println logs a message with a newline if debugging is enabled
func (l *WarpDiveLogger) Println(v ...interface{}) {
	if l.enabled {
		l.logger.Println(v...)
	}
}

// Printf logs a formatted message if debugging is enabled
func (l *WarpDiveLogger) Printf(format string, v ...interface{}) {
	if l.enabled {
		l.logger.Printf(format, v...)
	}
}

// Print logs a message if debugging is enabled
func (l *WarpDiveLogger) Print(v ...interface{}) {
	if l.enabled {
		l.logger.Print(v...)
	}
}

var (
	idMutex sync.Mutex
	nextID  uint64 = 1
	nodeIDs        = make(map[interface{}]uint64)
	nodes          = make(map[uint64]*warpdive.WarpDiveImage_Node) // Changed from slice to map
	tree    *warpdive.WarpDiveImage_TreeNode
)

// getNodeID assigns a unique ID to a node if it doesn't already have one and returns the ID.
func getNodeID(node interface{}) uint64 {
	idMutex.Lock()
	defer idMutex.Unlock()
	if id, exists := nodeIDs[node]; exists {
		return id
	}
	id := nextID
	nextID++
	nodeIDs[node] = id
	return id
}

// Helper function to convert the tar TypeFlag to a human-readable string
func fileTypeFlagToString(flag byte) string {
	switch flag {
	case tar.TypeRegA:
		return "Deprecated File Type"
	case tar.TypeReg:
		return "Regular File"
	case tar.TypeLink:
		return "Hard Link"
	case tar.TypeSymlink:
		return "Symbolic Link"
	case tar.TypeChar:
		return "Character Device"
	case tar.TypeBlock:
		return "Block Device"
	case tar.TypeDir:
		return "Directory"
	case tar.TypeFifo:
		return "FIFO"
	case tar.TypeCont:
		return "Reserved for contiguous files"
	case tar.TypeXHeader:
		return "Extended Header with PAX records"
	case tar.TypeXGlobalHeader:
		return "Global Extended Header with PAX records"
	case tar.TypeGNUSparse:
		return "GNU Sparse File"
	case tar.TypeGNULongName:
		return "GNU Long Filename Entry"
	case tar.TypeGNULongLink:
		return "GNU Long Linkname Entry"
	default:
		warpDiveLogger.Printf("Unknown Type (%x)", flag)
		return "Unknown Bytes"
	}
}

// maps the Go DiffType enum to the Protobuf DiffType enum
func convertDiffTypeToProto(diffType filetree.DiffType) warpdive.WarpDiveImage_FileNode_DiffType {
	switch diffType {
	case filetree.Unmodified:
		return warpdive.WarpDiveImage_FileNode_DIFF_TYPE_UNMODIFIED
	case filetree.Modified:
		return warpdive.WarpDiveImage_FileNode_DIFF_TYPE_MODIFIED
	case filetree.Added:
		return warpdive.WarpDiveImage_FileNode_DIFF_TYPE_ADDED
	case filetree.Removed:
		return warpdive.WarpDiveImage_FileNode_DIFF_TYPE_REMOVED
	default:
		return warpdive.WarpDiveImage_FileNode_DIFF_TYPE_UNMODIFIED // Default case can be handled as per your logic, here assuming UNMODIFIED
	}
}

// maps the archive/tar filetype enum to the Protobuf FileType enum
func tarTypeToProtoEnum(flag byte) warpdive.WarpDiveImage_FileNode_FileType {
	switch flag {
	case tar.TypeRegA:
		return warpdive.WarpDiveImage_FileNode_FILE_TYPE_REGULAR
	case tar.TypeReg:
		return warpdive.WarpDiveImage_FileNode_FILE_TYPE_REGULAR
	case tar.TypeLink:
		return warpdive.WarpDiveImage_FileNode_FILE_TYPE_HARD_LINK
	case tar.TypeSymlink:
		return warpdive.WarpDiveImage_FileNode_FILE_TYPE_SYMLINK
	case tar.TypeChar:
		return warpdive.WarpDiveImage_FileNode_FILE_TYPE_CHARACTER_DEVICE
	case tar.TypeBlock:
		return warpdive.WarpDiveImage_FileNode_FILE_TYPE_BLOCK_DEVICE
	case tar.TypeDir:
		return warpdive.WarpDiveImage_FileNode_FILE_TYPE_DIRECTORY
	case tar.TypeFifo:
		return warpdive.WarpDiveImage_FileNode_FILE_TYPE_FIFO
	case tar.TypeCont:
		return warpdive.WarpDiveImage_FileNode_FILE_TYPE_CONTIGUOUS_FILE
	case tar.TypeXHeader:
		return warpdive.WarpDiveImage_FileNode_FILE_TYPE_EXTENDED_HEADER
	case tar.TypeXGlobalHeader:
		return warpdive.WarpDiveImage_FileNode_FILE_TYPE_GLOBAL_EXTENDED_HEADER
	case tar.TypeGNUSparse:
		return warpdive.WarpDiveImage_FileNode_FILE_TYPE_GNU_SPARSE_FILE
	case tar.TypeGNULongName:
		return warpdive.WarpDiveImage_FileNode_FILE_TYPE_GNU_LONG_FILENAME
	case tar.TypeGNULongLink:
		return warpdive.WarpDiveImage_FileNode_FILE_TYPE_GNU_LONG_LINKNAME
	default:
		return warpdive.WarpDiveImage_FileNode_FILE_TYPE_UNKNOWN
	}
}

// by default size is stored as -1
// negative numbers are large in protobuf varint encoding
// change to zero to reduce size when packing
func getSizeForProto(size int64) uint64 {
	if size < 0 {
		return 0 // Store 0 if the size is negative
	}
	return uint64(size) // Otherwise, convert and store the actual size
}

// Structure to hold child information for sorting
type childInfo struct {
	Name string
	GID  uint64
}

// Traverse a FileNode
func traverseFileNode(node *filetree.FileNode, prefix string, parentNodeTree *warpdive.WarpDiveImage_TreeNode) {

	if node == nil {
		return
	}
	// get unique id for node
	id := getNodeID(node)
	var parentID uint64
	if node.Parent != nil {
		parentID = getNodeID(node.Parent)
	}

	fileType := tarTypeToProtoEnum(node.Data.FileInfo.TypeFlag)

	node.GetSize()
	// Create the protobuf FileNode message
	pbFileNode := &warpdive.WarpDiveImage_FileNode{
		TreeRef:   &warpdive.WarpDiveImage_TreeNode_Ref{Gid: id},
		ParentRef: &warpdive.WarpDiveImage_TreeNode_Ref{Gid: parentID},
		Size:      getSizeForProto(node.Size),
		Name:      node.Name,
		NodeData: &warpdive.WarpDiveImage_FileNode_NodeData{
			FileInfo: &warpdive.WarpDiveImage_FileNode_FileInfo{
				Path:     node.Data.FileInfo.Path,
				TypeFlag: fileType,
				Mode:     uint32(node.Data.FileInfo.Mode),
				Uid:      int32(node.Data.FileInfo.Uid),
				Gid:      int32(node.Data.FileInfo.Gid),
				Hash:     node.Data.FileInfo.GetHash(),
				Linkname: node.Data.FileInfo.Linkname,
			},
			DiffType: convertDiffTypeToProto(node.Data.DiffType),
		},
	}

	// Collect children for sorting
	// sort ascending order by name by default
	children := make([]childInfo, 0, len(node.Children))
	for name, child := range node.Children {
		children = append(children, childInfo{Name: name, GID: getNodeID(child)})
	}
	sort.Slice(children, func(i, j int) bool {
		return children[i].Name < children[j].Name
	})

	// Append sorted children GIDs to pbFileNode
	for _, child := range children {
		pbFileNode.ChildrenRefs = append(pbFileNode.ChildrenRefs, &warpdive.WarpDiveImage_TreeNode_Ref{Gid: child.GID})
	}

	// Create the protobuf Node message and append to nodes array
	pbNode := &warpdive.WarpDiveImage_Node{
		Gid:  id,
		Data: &warpdive.WarpDiveImage_Node_FileNode{FileNode: pbFileNode},
	}
	nodes[id] = pbNode

	// Add the protobuf NodeRef to the tree
	currentNodeTree := &warpdive.WarpDiveImage_TreeNode{
		Ref:      &warpdive.WarpDiveImage_TreeNode_Ref{Gid: id},
		Children: []*warpdive.WarpDiveImage_TreeNode{},
	}
	parentNodeTree.Children = append(parentNodeTree.Children, currentNodeTree)

	// Log the current node with its path (accessed via the FileInfo structure)
	warpDiveLogger.Printf("%sNode GID: %d, Name: %s, Size: %d\n", prefix, id, node.Name, node.Size)
	warpDiveLogger.Printf("%sPath: %s\n", prefix, node.Data.FileInfo.Path)
	warpDiveLogger.Printf("%sType: %s\n", prefix, fileTypeFlagToString(node.Data.FileInfo.TypeFlag))
	warpDiveLogger.Printf("%sMode: %s (%d)\n", prefix, node.Data.FileInfo.Mode.String(), uint32(node.Data.FileInfo.Mode))
	warpDiveLogger.Printf("%sOwner UID: %d, GID: %d\n", prefix, node.Data.FileInfo.Uid, node.Data.FileInfo.Gid)
	warpDiveLogger.Printf("%sLinkname: %s\n", prefix, node.Data.FileInfo.Linkname)
	warpDiveLogger.Printf("%sHash: %x\n", prefix, node.Data.FileInfo.GetHash())
	warpDiveLogger.Printf("%sIs Directory: %t\n", prefix, node.Data.FileInfo.IsDir)
	warpDiveLogger.Printf("%sDiff Type: %s\n", prefix, node.Data.DiffType.String()) // Assuming DiffType has a String method
	// warpDiveLogger.Printf("%sCollapsed: %t, Hidden: %t\n", prefix, node.Data.ViewInfo.Collapsed, node.Data.ViewInfo.Hidden)

	// Log protobuf data
	warpDiveLogger.Printf("%sPB: TreeRef GID: %d\n", prefix, pbFileNode.TreeRef.Gid)
	warpDiveLogger.Printf("%sPB: ParentRef GID: %d\n", prefix, pbFileNode.ParentRef.Gid)
	warpDiveLogger.Printf("%sPB: Size: %d\n", prefix, pbFileNode.Size)
	warpDiveLogger.Printf("%sPB: Name: %s\n", prefix, pbFileNode.Name)
	warpDiveLogger.Printf("%sPB: Path: %s\n", prefix, pbFileNode.NodeData.FileInfo.Path)
	warpDiveLogger.Printf("%sPB: Type: %s\n", prefix, pbFileNode.NodeData.FileInfo.TypeFlag.String())
	warpDiveLogger.Printf("%sPB: Mode: %d\n", prefix, pbFileNode.NodeData.FileInfo.Mode)
	warpDiveLogger.Printf("%sPB: UID: %d, GID: %d\n", prefix, pbFileNode.NodeData.FileInfo.Uid, pbFileNode.NodeData.FileInfo.Gid)
	warpDiveLogger.Printf("%sPB: Hash: %x\n", prefix, pbFileNode.NodeData.FileInfo.Hash)
	warpDiveLogger.Printf("%sPB: Linkname: %s\n", prefix, pbFileNode.NodeData.FileInfo.Linkname)
	warpDiveLogger.Printf("%sPB: DiffType: %s\n", prefix, pbFileNode.NodeData.DiffType.String())

	// Log the GIDs of the children references
	var childrenGids strings.Builder
	childrenGids.WriteString(fmt.Sprintf("%sChildren NodeRefs GIDs: [", prefix))
	for i, ref := range pbFileNode.ChildrenRefs {
		if i > 0 {
			childrenGids.WriteString(", ")
		}
		childrenGids.WriteString(fmt.Sprintf("%d", ref.Gid))
	}
	childrenGids.WriteString("]")

	warpDiveLogger.Println(childrenGids.String())

	// Recursively traverse each child
	for name, child := range node.Children {
		warpDiveLogger.Printf("%s  Child: %s\n", prefix, name)
		traverseFileNode(child, prefix+"|  ", currentNodeTree) // Increase indentation for children
	}
}

// Traverse a FileTree
func traverseFileTree(tree *filetree.FileTree, prefix string, parentNodeTree *warpdive.WarpDiveImage_TreeNode) {
	if tree == nil {
		return
	}
	// get unique id for tree
	treeGID := getNodeID(tree)
	warpDiveLogger.Printf("%sTree GID: %d, Name: %s, ID: %s, Size: %d bytes, FileSize: %d bytes\n",
		prefix, treeGID, tree.Name, tree.Id, tree.Size, tree.FileSize)

	// Create the protobuf Node message for the file tree
	pbFileTree := &warpdive.WarpDiveImage_FileTree{
		RootRef:  &warpdive.WarpDiveImage_TreeNode_Ref{Gid: getNodeID(tree.Root)},
		Size:     uint64(tree.Size),
		FileSize: tree.FileSize,
		Name:     tree.Name,
	}
	pbNode := &warpdive.WarpDiveImage_Node{
		Gid:  treeGID,
		Data: &warpdive.WarpDiveImage_Node_FileTree{FileTree: pbFileTree},
	}
	nodes[treeGID] = pbNode

	// Create a NodeTree for this FileTree and link it as a child of the parent NodeTree
	currentNodeTree := &warpdive.WarpDiveImage_TreeNode{
		Ref:      &warpdive.WarpDiveImage_TreeNode_Ref{Gid: treeGID},
		Children: []*warpdive.WarpDiveImage_TreeNode{}, // Initialize empty slice for children
	}
	parentNodeTree.Children = append(parentNodeTree.Children, currentNodeTree)

	// Log the protobuf data and verify correctness
	warpDiveLogger.Printf("%sPB: Tree GID: %d, Name: %s, File Size: %d bytes, Size: %d\n",
		prefix, pbNode.Gid, pbFileTree.Name, pbFileTree.FileSize, pbFileTree.Size)
	if pbFileTree.RootRef != nil {
		warpDiveLogger.Printf("%sPB: Root Node Ref GID: %d\n", prefix, pbFileTree.RootRef.Gid)
	} else {
		warpDiveLogger.Println(prefix + "PB: Root Node Ref: nil")
	}

	if tree.Root != nil {
		traverseFileNode(tree.Root, prefix+"|  ", currentNodeTree)
	} else {
		warpDiveLogger.Println(prefix + "|  Root: nil")
	}
}

//nolint:unused
func traverseImageTrees(trees []*filetree.FileTree, rootNodeTree *warpdive.WarpDiveImage_TreeNode) {
	for i, tree := range trees {
		if tree == nil {
			warpDiveLogger.Printf("Tree %d is nil\n", i)
			continue
		}
		warpDiveLogger.Printf("Tree %d:\n", i)
		traverseFileTree(tree, "|  ", rootNodeTree)
	}
}

func traverseLayerAttributes(img *image.Image) {

	// Create a root node for the tree structure
	rootNodeRef := uint64(0) // Consider a fixed GID or generate one if dynamic is needed
	tree = &warpdive.WarpDiveImage_TreeNode{
		Ref:      &warpdive.WarpDiveImage_TreeNode_Ref{Gid: rootNodeRef},
		Children: []*warpdive.WarpDiveImage_TreeNode{},
	}

	warpDiveLogger.Println("Logging Layer Attributes...")
	for i, layer := range img.Layers {
		if layer == nil {
			warpDiveLogger.Printf("Layer %d is nil\n", i)
			continue
		}
		// get unique id for layer
		gid := getNodeID(layer)
		warpDiveLogger.Printf("Layer %d:\n", i)
		warpDiveLogger.Printf("  GID: %d\n", gid)
		warpDiveLogger.Printf("  ID: %s\n", layer.Id)
		warpDiveLogger.Printf("  Index: %d\n", layer.Index)
		warpDiveLogger.Printf("  Command: %s\n", layer.Command)
		warpDiveLogger.Printf("  Size: %d bytes\n", layer.Size)
		warpDiveLogger.Printf("  Names: %v\n", layer.Names)
		warpDiveLogger.Printf("  Digest: %s\n", layer.Digest)

		// Create the protobuf Node for the layer
		pbLayer := &warpdive.WarpDiveImage_Layer{
			Id:      layer.Id,
			Index:   int32(layer.Index),
			Command: layer.Command,
			Size:    layer.Size,
			TreeRef: &warpdive.WarpDiveImage_TreeNode_Ref{Gid: getNodeID(layer.Tree)}, // Convert Tree to GID
			Names:   layer.Names,
			Digest:  layer.Digest,
		}

		pbNode := &warpdive.WarpDiveImage_Node{
			Gid:  gid,
			Data: &warpdive.WarpDiveImage_Node_Layer{Layer: pbLayer},
		}

		nodes[gid] = pbNode // Store the Node in the map

		// Add the current layer as a child to the root node
		layerNodeTree := &warpdive.WarpDiveImage_TreeNode{
			Ref:      &warpdive.WarpDiveImage_TreeNode_Ref{Gid: gid},
			Children: []*warpdive.WarpDiveImage_TreeNode{},
		}
		tree.Children = append(tree.Children, layerNodeTree)

		// Log the Protobuf layer
		warpDiveLogger.Printf("PB: Layer GID: %d, ID: %s, Index: %d, Command: %s, Size: %d bytes, Names: %v, Digest: %s\n",
			gid, pbLayer.Id, pbLayer.Index, pbLayer.Command, pbLayer.Size, pbLayer.Names, pbLayer.Digest)
		if pbLayer.TreeRef != nil {
			warpDiveLogger.Printf("PB: TreeRef GID: %d\n", pbLayer.TreeRef.Gid)
		}

		if layer.Tree != nil {
			warpDiveLogger.Printf("  Tree ID: %s\n", layer.Tree.Id)
			traverseFileTree(layer.Tree, "    ", layerNodeTree)
		} else {
			warpDiveLogger.Println("  Tree: nil")
		}
	}

	// Optionally log the structure of the root node and its children
	warpDiveLogger.Printf("Root Node GID: %d, Number of Children: %d\n", rootNodeRef, len(tree.Children))

	// optionally log the entire node tree
	logNodeTree(tree, 0)
}

// Recursive function to log the NodeTree structure
func logNodeTree(nodeTree *warpdive.WarpDiveImage_TreeNode, indent int) {
	if nodeTree == nil {
		return
	}

	prefix := strings.Repeat("| ", indent) // Create indentation based on depth
	if len(nodeTree.Children) > 0 {
		childGIDs := make([]uint64, len(nodeTree.Children))
		for i, child := range nodeTree.Children {
			childGIDs[i] = child.Ref.Gid
		}
		warpDiveLogger.Printf("%sNodeTree GID: %d, Children: %v\n", prefix, nodeTree.Ref.Gid, childGIDs)
		// Recursively log children
		for _, child := range nodeTree.Children {
			logNodeTree(child, indent+1)
		}
	} else {
		warpDiveLogger.Printf("%sNodeTree GID: %d, Children: []\n", prefix, nodeTree.Ref.Gid)
	}
}

// verifyTree checks the structure of the tree and logs information about the first few levels of nodes.
func verifyTree(root *warpdive.WarpDiveImage_TreeNode) {
	if root == nil {
		warpDiveLogger.Println("Root of the tree is nil.")
		return
	}

	// Log the GID of the root node and the count of its children
	warpDiveLogger.Printf("Root Node GID: %d, Number of Children: %d\n", root.Ref.Gid, len(root.Children))

	// Traverse the first few levels of the tree
	for i, child := range root.Children {
		warpDiveLogger.Printf("Child %d GID: %d, Number of Grandchildren: %d\n", i, child.Ref.Gid, len(child.Children))
		// Optionally, dive deeper if needed, here we just log grandchildren
		for j, grandchild := range child.Children {
			warpDiveLogger.Printf("Grandchild %d of Child %d GID: %d, Number of Great-Grandchildren: %d\n", j, i, grandchild.Ref.Gid, len(grandchild.Children))
		}
	}
}

func readAPIKeyFromConfig(configPath, endpoint string) (string, error) {
	fileData, err := os.ReadFile(configPath)
	if err != nil {
		return "", err // File could not be read
	}

	var config map[string]interface{}
	err = yaml.Unmarshal(fileData, &config)
	if err != nil {
		return "", err // YAML could not be parsed
	}

	// Attempt to get the API key for the given endpoint
	if apiInfo, ok := config[endpoint].(map[interface{}]interface{}); ok {
		if apiKey, ok := apiInfo["api_key"].(map[interface{}]interface{}); ok {
			if value, ok := apiKey["value"].(string); ok {
				return value, nil
			}
		}
	}

	return "", fmt.Errorf("no API key found for endpoint %s", endpoint)
}

func run(enableUi bool, options Options, imageResolver image.Resolver, events eventChannel, filesystem afero.Fs) {
	warpDiveLogger.Printf("Options Received: %+v\n", options)

	var img *image.Image
	var err error
	defer close(events)

	// events.message(utils.TitleFormat("Analyzing image..."))

	// doExport := options.ExportFile != ""
	doBuild := len(options.BuildArgs) > 0

	// events.message(utils.TitleFormat("Analyzing image..."))
	// fmt.Printf("Test log %s", options.ExportFile)
	// fmt.Printf("Exporting image %s to file %s\n", imageID, outputFilePath)
	// imageID := options.BuildArgs[0]
	// var outputFilePath string
	// if options.ExportFile == "" {
	// 	outputFilePath = filepath.Join(".", fmt.Sprintf("%s.warpdive", imageID))
	// } else {
	// 	// Check if the provided path is a directory
	// 	info, err := os.Stat(options.ExportFile)
	// 	if err == nil && info.IsDir() {
	// 		outputFilePath = filepath.Join(options.ExportFile, fmt.Sprintf("%s.warpdive", imageID))
	// 	} // else the outputFilePath is treated as the exact path including filename
	// }

	// fmt.Printf("Exporting to... %s\n", outputFilePath)

	if doBuild {
		events.message(utils.TitleFormat("Building image..."))
		warpDiveLogger.Printf("Options Build Received: %+v\n", options.BuildArgs)
		img, err = imageResolver.Build(options.BuildArgs)
		if err != nil {
			events.exitWithErrorMessage("cannot build image", err)
			return
		}
	} else {
		events.message(utils.TitleFormat("Image Source: ") + options.Source.String() + "://" + options.Image)
		events.message(utils.TitleFormat("Fetching image...") + " (this can take a while for large images)")
		img, err = imageResolver.Fetch(options.Image)
		if err != nil {
			events.exitWithErrorMessage("cannot fetch image", err)
			return
		}
	}

	// events.message(utils.TitleFormat("Analyzing image..."))
	// analysis, err := img.Analyze()
	// if err != nil {
	// 	events.exitWithErrorMessage("cannot analyze image", err)
	// 	return
	// }

	// imageID := args[0]

	// Simulated function call that handles exporting
	// fmt.Printf("Exporting image %s to file %s\n", imageID, outputFilePath)
	// Here would go the logic to actually perform the export

	// fmt.Printf("Exporting image to file %s\n", options.ExportFile)

	// return
	// if doExport {
	// 	events.message(utils.TitleFormat(fmt.Sprintf("Exporting image to '%s'...", options.ExportFile)))
	// 	bytes, err := export.NewExport(analysis).Marshal()
	// 	if err != nil {
	// 		events.exitWithErrorMessage("cannot marshal export payload", err)
	// 		return
	// 	}

	// 	file, err := filesystem.OpenFile(options.ExportFile, os.O_RDWR|os.O_CREATE, 0644)
	// 	if err != nil {
	// 		events.exitWithErrorMessage("cannot open export file", err)
	// 		return
	// 	}
	// 	defer file.Close()

	// 	_, err = file.Write(bytes)
	// 	if err != nil {
	// 		events.exitWithErrorMessage("cannot write to export file", err)
	// 	}
	// 	return
	// }

	// if options.Ci {
	// 	events.message(fmt.Sprintf("  efficiency: %2.4f %%", analysis.Efficiency*100))
	// 	events.message(fmt.Sprintf("  wastedBytes: %d bytes (%s)", analysis.WastedBytes, humanize.Bytes(analysis.WastedBytes)))
	// 	events.message(fmt.Sprintf("  userWastedPercent: %2.4f %%", analysis.WastedUserPercent*100))

	// 	evaluator := ci.NewCiEvaluator(options.CiConfig)
	// 	pass := evaluator.Evaluate(analysis)
	// 	events.message(evaluator.Report())

	// 	if !pass {
	// 		events.exitWithError(nil)
	// 	}

	// 	return
	// } else {
	// 	events.message(utils.TitleFormat("Building cache..."))
	// 	treeStack := filetree.NewComparer(analysis.RefTrees)
	// 	errors := treeStack.BuildCache()
	// 	if errors != nil {
	// 		for _, err := range errors {
	// 			events.message("  " + err.Error())
	// 		}
	// 		if !options.IgnoreErrors {
	// 			events.exitWithError(fmt.Errorf("file tree has path errors (use '--ignore-errors' to attempt to continue)"))
	// 			return
	// 		}
	// 	}

	// 	if enableUi {
	// 		// it appears there is a race condition where termbox.Init() will
	// 		// block nearly indefinitely when running as the first process in
	// 		// a Docker container when started within ~25ms of container startup.
	// 		// I can't seem to determine the exact root cause, however, a large
	// 		// enough sleep will prevent this behavior (todo: remove this hack)
	// 		time.Sleep(100 * time.Millisecond)

	// 		err = ui.Run(options.Image, analysis, treeStack)
	// 		if err != nil {
	// 			events.exitWithError(err)
	// 			return
	// 		}
	// 	}

	// }

	// events.message(utils.TitleFormat("Not opening ui..."))

	traverseLayerAttributes(img)

	verifyTree(tree)

	metadata := &warpdive.WarpDiveImage_Metadata{
		ContainerTag:   "latest",
		BuiltWith:      "Docker 20.10",
		CommitSha:      "abc123",
		ImageSha:       "sha256:abcd1234",
		Ts:             timestamppb.New(time.Now()), // Use timestamppb.New to convert time.Time to *timestamp.Timestamp
		Platform:       "linux/amd64",
		CiPipelineId:   "pipeline-12345",
		ProjectName:    "MyProject",
		CiBuildUrl:     "https://ci.example.com/build/123",
		ReleaseVersion: "1.0.0",
		BuildNumber:    "100",
		BuilderImage:   "golang:1.16",
	}

	// Assuming you have the WarpDiveImage struct filled out as needed
	warpdiveImage := &warpdive.WarpDiveImage{
		// Fill in your nodes and tree structure here
		Nodes:    nodes,
		Tree:     tree,
		Metadata: metadata,
	}

	// Convert WarpDiveImage to an Any type using the new API
	anyMessage, err := anypb.New(warpdiveImage)
	if err != nil {
		log.Fatalf("Failed to create Any from WarpDiveImage: %v", err)
	}

	// Serialize the Any message to binary
	binaryData, err := proto.Marshal(anyMessage)
	if err != nil {
		log.Fatalf("Failed to serialize Any message: %v", err)
	}

	if options.ExportFile != "" {

		if strings.Contains(options.ExportFile, "/") || strings.Contains(options.ExportFile, "\\") {
			log.Fatalf("file name should not contain directory separators ('/' or '\\')")
		}

		// Check for other invalid characters as per your OS requirements, e.g., on Windows
		if strings.ContainsAny(options.ExportFile, "<>:\"|?*") {
			log.Fatalf("file name contains invalid characters")
		}

		// Ensure the file name ends with .warpdive if not already
		if !strings.HasSuffix(options.ExportFile, ".warpdive") {
			options.ExportFile += ".warpdive"
		}

		// Resolve the absolute path to ensure the path is valid
		absPath, err := filepath.Abs(options.ExportFile)
		if err != nil {
			log.Fatalf("Failed to resolve absolute path: %v", err)
		}

		// Write the binary data to the resolved file path
		err = os.WriteFile(absPath, binaryData, 0644)
		if err != nil {
			log.Fatalf("Failed to write binary data to file: %v", err)
		} else {
			log.Printf("Successfully output %s", absPath)
		}

	} else {
		// Make warpdive.xyz api call

		// Retrieve environment variables
		warpDiveEndpoint := os.Getenv("WARPDIVE_ENDPOINT")
		warpDiveAPIKey := os.Getenv("WARPDIVE_API_KEY")

		// Use default endpoint if not specified
		if warpDiveEndpoint == "" {
			warpDiveEndpoint = "https://www.warpdive.xyz"
			warpDiveLogger.Printf("WARPDIVE_ENDPOINT not set. Using default: %s", warpDiveEndpoint)
		} else {
			log.Printf("Using WARPDIVE_ENDPOINT: %s", warpDiveEndpoint)
		}

		// Check if API key is set; it's critical for operations
		if warpDiveAPIKey == "" {
			// Attempt to read from config file
			usr, err := user.Current()
			if err != nil {
				log.Fatalf("Error retrieving user directory: %v", err)
			}
			configPath := filepath.Join(usr.HomeDir, ".warpdiverc")
			if apiKey, err := readAPIKeyFromConfig(configPath, warpDiveEndpoint); err != nil {
				log.Println("Error: WARPDIVE_API_KEY environment variable is not set and not found in config file")
				fmt.Println("Please set the WARPDIVE_API_KEY environment variable or run 'warpdive login'.")
				os.Exit(1)
			} else {
				warpDiveAPIKey = apiKey
			}
		}

		warpDiveLogger.Printf("Successfully loaded configuration: Endpoint %s, API Key %s\n", warpDiveEndpoint, warpDiveAPIKey)
		// Parse the endpoint URL
		parsedUrl, err := url.Parse(warpDiveEndpoint)
		if err != nil {
			log.Fatalf("Invalid URL: %v", err)
		}

		// Resolve the new path relative to the parsed URL
		// This method ensures that the path is correctly appended, whether or not the base URL has a trailing slash
		apiEndpoint := parsedUrl.ResolveReference(&url.URL{Path: "/api/builds/new"}).String()

		// Log that environment variables are successfully loaded
		warpDiveLogger.Println("Environment variables loaded successfully")

		// Create a buffer to write our multipart data
		var requestBody bytes.Buffer
		writer := multipart.NewWriter(&requestBody)

		// Add the file part
		filePart, err := writer.CreateFormFile("file", "image.warpdive")
		if err != nil {
			log.Fatalf("error creating file part: %v", err)
		}
		// Create an io.Reader from the []byte slice
		binaryReader := bytes.NewReader(binaryData)

		_, err = io.Copy(filePart, binaryReader)
		if err != nil {
			log.Fatalf("error writing file part: %v", err)
		}

		// options.Project

		// Add string fields
		fields := map[string]string{
			"api-key": warpDiveAPIKey,
		}

		// Conditionally add the project-name if options.Project is set
		if options.Project != "" {
			fields["project-name"] = options.Project
		} else {
			// Optionally handle the case where no project is specified
			// e.g., you can leave it out or set a default project name as needed
			fmt.Println("No project specified, uploading <untagged> image.")
		}

		for key, val := range fields {
			err := writer.WriteField(key, val)
			if err != nil {
				log.Fatalf("error writing string field: %v", err)
			}
		}

		// Close the multipart writer to set the terminating boundary
		err = writer.Close()
		if err != nil {
			log.Fatalf("error closing writer: %v", err)
		}

		// Create a request with your URL and the multipart form data
		req, err := http.NewRequest("POST", apiEndpoint, &requestBody)
		if err != nil {
			log.Fatalf("error creating request: %v", err)
		}
		req.Header.Set("Content-Type", writer.FormDataContentType())

		// Send the request
		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			log.Fatalf("error sending request: %v", err)
		}
		defer resp.Body.Close()

		// Log the HTTP response status
		// Read the response body
		responseBody, err := io.ReadAll(resp.Body)
		if err != nil {
			log.Fatalf("Error reading response body: %v", err)
		}

		// Log the HTTP response status and body
		warpDiveLogger.Printf("Response status: %s", resp.Status)
		warpDiveLogger.Printf("Response body: %s", responseBody)

	}

	// warpDiveLogger.Println("-----------RUNNING VERIFICATION -----------")
	// var newAnyMessage anypb.Any
	// err = proto.Unmarshal(binaryData, &newAnyMessage)
	// if err != nil {
	// 	log.Fatalf("Failed to deserialize Any message: %v", err)
	// }

	// // Extract WarpDiveImage from the Any message
	// var newWarpdiveImage warpdive.WarpDiveImage
	// if err := anyMessage.UnmarshalTo(&newWarpdiveImage); err != nil {
	// 	log.Fatalf("Failed to extract WarpDiveImage from Any message: %v", err)
	// }

	// // Verify the tree structure before initially marshalling and after re-reading the encoded format
	// if newWarpdiveImage.Tree != nil {
	// 	warpDiveLogger.Println("Tree verification:")
	// 	verifyTree(newWarpdiveImage.Tree)
	// } else {
	// 	log.Println("No tree found in the WarpDiveImage.")
	// }

}

func IsCommandAvailable(name string) bool {
	cmd := exec.Command("which", name)
	if err := cmd.Run(); err != nil {
		return false
	}
	return true
}

func GetDefaultEngine() string {
	var source string
	source = "docker"

	if !IsCommandAvailable(source) && IsCommandAvailable("podman") {
		source = "podman"
	}

	return source
}

func GetPreferredEngine(sourceInput string) string {
	dockerAvailable := IsCommandAvailable("docker")
	podmanAvailable := IsCommandAvailable("podman")

	switch sourceInput {
	case "docker":
		return "docker"
	case "podman":
		return "podman"
	case "docker-archive":
		return "docker-archive"
	}

	// Auto-detect available engine
	if dockerAvailable {
		return "docker"
	}
	if podmanAvailable {
		return "podman"
	}
	return ""
}

func Run(options Options) {
	var exitCode int
	var events = make(eventChannel)

	warpDiveLogger = NewWarpDiveLogger()

	warpDiveLogger.Printf("Run Options Received: %+v\n", options)

	imageResolver, err := dive.GetImageResolver(options.Source)
	if err != nil {
		message := "cannot determine image provider"
		logrus.Error(message)
		logrus.Error(err)
		fmt.Fprintf(os.Stderr, "%s: %+v\n", message, err)
		os.Exit(1)
	}

	go run(true, options, imageResolver, events, afero.NewOsFs())

	for event := range events {
		if event.stdout != "" {
			warpDiveLogger.Println(event.stdout)
		}

		if event.stderr != "" {
			_, err := fmt.Fprintln(os.Stderr, event.stderr)
			if err != nil {
				warpDiveLogger.Println("error: could not write to buffer:", err)
			}
		}

		if event.err != nil {
			logrus.Error(event.err)
			_, err := fmt.Fprintln(os.Stderr, event.err.Error())
			if err != nil {
				warpDiveLogger.Println("error: could not write to buffer:", err)
			}
		}

		if event.errorOnExit {
			exitCode = 1
		}
	}
	os.Exit(exitCode)
}
