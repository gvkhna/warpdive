import React, {memo, type MouseEvent} from 'react'
import {FixedSizeList as List, areEqual} from 'react-window'
import {useWarpImage} from './warp-dive-image-provider'
import {WarpDiveImage_FileNode_FileType} from '@/generated/warpdive_pb'
import {ArrowRight, FileIcon, FolderIcon, FolderOpenIcon} from 'lucide-react'
import {formatBytesString} from './format-byte-size'
import {formatFilePermissionsMode} from './format-permissions'
import {TreeNodeItem, DEFAULT_OPEN_OR_COLLAPSE, DefaultOpenOrCollapse} from './file-system-viewer'

export interface RowProps {
  index: number
  style: any // css position abs, w, h, l, r, etc...
  data: {
    flattenedData: TreeNodeItem[]
    onOpen: (node: TreeNodeItem) => void
    onSelect: (e: MouseEvent<HTMLDivElement, globalThis.MouseEvent> | undefined, node: TreeNodeItem) => void
  }
}

function fileTypeToChar(type: WarpDiveImage_FileNode_FileType): string {
  switch (type) {
    case WarpDiveImage_FileNode_FileType.DIRECTORY:
      return 'd'
    case WarpDiveImage_FileNode_FileType.SYMLINK:
      return 'l'
    case WarpDiveImage_FileNode_FileType.CHARACTER_DEVICE:
      return 'c'
    case WarpDiveImage_FileNode_FileType.BLOCK_DEVICE:
      return 'b'
    case WarpDiveImage_FileNode_FileType.FIFO:
      return 'p'
    case WarpDiveImage_FileNode_FileType.REGULAR:
    case WarpDiveImage_FileNode_FileType.HARD_LINK:
    case WarpDiveImage_FileNode_FileType.CONTIGUOUS_FILE:
    case WarpDiveImage_FileNode_FileType.EXTENDED_HEADER:
    case WarpDiveImage_FileNode_FileType.GLOBAL_EXTENDED_HEADER:
    case WarpDiveImage_FileNode_FileType.GNU_SPARSE_FILE:
    case WarpDiveImage_FileNode_FileType.GNU_LONG_FILENAME:
    case WarpDiveImage_FileNode_FileType.GNU_LONG_LINKNAME:
      return '-'
    case WarpDiveImage_FileNode_FileType.UNKNOWN:
    default:
      return '?'
  }
}

function readPermissionString(mode: number, type: WarpDiveImage_FileNode_FileType) {
  const typeChar = fileTypeToChar(type)
  const permissions = formatFilePermissionsMode(mode)
  return typeChar + permissions
}

export const Row = memo(({data, index, style}: RowProps) => {
  // console.log('row - ', data, index, style)
  const {flattenedData, onOpen, onSelect} = data
  const node = flattenedData[index]
  const left = node.depth * 20

  const {wpImage, setWpImage} = useWarpImage()
  const wpImageNodes = wpImage?.nodes

  if (!wpImageNodes) {
    return <>No Data Found</>
  }

  const currentNode = wpImageNodes[node.gid]

  const name =
    currentNode.data.oneofKind === 'fileNode'
      ? currentNode.data.fileNode.name || '<N/A>'
      : currentNode.data.oneofKind === 'fileTree'
        ? currentNode.data.fileTree.name
        : currentNode.data.oneofKind === 'layer'
          ? `Layer #${currentNode.data.layer.index}`
          : '<N/A>'

  const isFolder =
    (currentNode.data.oneofKind === 'fileNode' &&
      (currentNode.data.fileNode.nodeData?.fileInfo?.typeFlag === WarpDiveImage_FileNode_FileType.DIRECTORY ||
        currentNode.data.fileNode.childrenRefs.length > 0)) ||
    currentNode.data.oneofKind === 'fileTree' ||
    currentNode.data.oneofKind === 'layer'

  const fsPerm =
    currentNode.data.oneofKind === 'fileNode'
      ? currentNode.data.fileNode.nodeData?.fileInfo?.mode !== undefined
        ? readPermissionString(
            currentNode.data.fileNode.nodeData?.fileInfo?.mode,
            currentNode.data.fileNode.nodeData?.fileInfo?.typeFlag
          )
        : ''
      : ''

  const fsUid = currentNode.data.oneofKind === 'fileNode' ? currentNode.data.fileNode.nodeData?.fileInfo?.uid + '' : ''
  const fsGid = currentNode.data.oneofKind === 'fileNode' ? currentNode.data.fileNode.nodeData?.fileInfo?.gid + '' : ''
  const fsSize =
    currentNode.data.oneofKind === 'fileNode'
      ? currentNode.data.fileNode.size
      : currentNode.data.oneofKind === 'fileTree'
        ? currentNode.data.fileTree.fileSize
        : ''

  const fsLinkname = currentNode.data.oneofKind === 'fileNode' && currentNode.data.fileNode.nodeData?.fileInfo?.linkname

  const folderOpenClosedIcon = () => {
    if (DEFAULT_OPEN_OR_COLLAPSE === DefaultOpenOrCollapse.DefaultOpen) {
      if (node.open) {
        return <FolderOpenIcon className='mr-1 h-4 w-4' />
      } else {
        return <FolderIcon className='mr-1 h-4 w-4' />
      }
    } else if (DEFAULT_OPEN_OR_COLLAPSE === DefaultOpenOrCollapse.DefaultCollapse) {
      if (node.collapsed) {
        return <FolderIcon className='mr-1 h-4 w-4' />
      } else {
        return <FolderOpenIcon className='mr-1 h-4 w-4' />
      }
    }
  }

  return (
    <div
      className=' flex cursor-default font-mono text-sm hover:bg-slate-100'
      style={style}
      onClick={() => onOpen(node)}
    >
      <div
        className={`flex items-center`}
        onClick={(e) => onSelect(e, node)}
      >
        <div
          className='grid text-nowrap pl-1 font-mono'
          style={{
            gridTemplateColumns: 'minmax(6rem, 6rem) minmax(4rem, auto) minmax(4rem, auto) 1fr'
          }}
        >
          <div className='col-span-1 text-left '>{fsPerm}</div>
          <div className='col-span-1 text-center'>{(fsUid && fsGid && `${fsUid}:${fsGid}`) || ''}</div>
          <div className='col-span-1 text-center'>{formatBytesString(fsSize)}</div>
          <div className='col-span-1 flex items-center text-left'>
            {'\xa0'.repeat(node.depth)}
            {isFolder ? (
              <>
                {folderOpenClosedIcon()}
                <span className='font-semibold'>{name}</span>
              </>
            ) : (
              <>
                <FileIcon className='mr-1 h-4 w-4' />
                <span className='font-normal'>{name}</span>
              </>
            )}
            {fsLinkname && (
              <span>
                <ArrowRight className='mx-2 inline-block h-3 w-3' />
                {fsLinkname}
              </span>
            )}
            {/* {fsLinkname && <span>&nbsp;-&gt;&nbsp;{fsLinkname}</span>} */}
          </div>
        </div>
      </div>
    </div>
  )
}, areEqual)
Row.displayName = 'Row'
