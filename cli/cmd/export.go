package cmd

import (
	"fmt"
	"os"

	"github.com/gvkhna/warpdive/dive"
	"github.com/gvkhna/warpdive/runtime"
	"github.com/spf13/cobra"
)

var exportCmd = &cobra.Command{
	Use:   "export [IMAGE ID]",
	Short: "Exports a container image to a .warpdive file. For use with warpdive.xyz/viewer",
	Args:  cobra.ExactArgs(1), // Expect exactly one argument: the docker image/tag id
	Run:   doExportCmd,
}

// var outputFilePath string

func init() {
	rootCmd.AddCommand(exportCmd)
}

// doExportCmd implements the steps taken for the export command
func doExportCmd(cmd *cobra.Command, args []string) {

	userImage := args[0]
	if userImage == "" {
		fmt.Println("No image argument given")
		os.Exit(1)
	}

	var sourceType dive.ImageSource
	var imageStr string

	sourceType, imageStr = dive.DeriveImageSource(userImage)

	if sourceType == dive.SourceUnknown {
		sourceType = dive.ParseImageSource(defaultSource)
		if sourceType == dive.SourceUnknown {
			fmt.Printf("unable to determine image source: %v\n", defaultSource)
			os.Exit(1)
		}

		imageStr = userImage
	}

	// ignoreErrors, err := cmd.PersistentFlags().GetBool("ignore-errors")
	// if err != nil {
	// 	logrus.Error("unable to get 'ignore-errors' option:", err)
	// }

	runtime.Run(runtime.Options{
		// Ci:         isCi,
		Image:  imageStr,
		Engine: defaultSource,
		Source: dive.ParseImageSource(defaultSource),
		// Source:     dive.ParseImageSource(engine),
		PushArgs:   args,
		ExportFile: exportFile,
		// CiConfig:   ciConfig,
	})
}
