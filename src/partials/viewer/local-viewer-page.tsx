import {WarpDiveImageProvider} from './warp-dive-image-provider'
import LocalLoader from './local-loader'
import {ReactNode, useState} from 'react'
import LayerBrowser from './layer-browser'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

export interface LocalViewerPageProps {
  fullPage: boolean
}

export default function LocalViewerPage(props: LocalViewerPageProps) {
  const onError = (error: Error) => {
    setViewer(
      <>
        <AlertDialog open={true}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Loading file failed</AlertDialogTitle>
              <AlertDialogDescription>{error.message}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                onClick={() => {
                  setViewer(initialView())
                }}
              >
                Try Again
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <LocalLoader
          onFileLoad={() => {}}
          onError={() => {}}
        />
      </>
    )
  }

  const onFileLoad = (data: Uint8Array) => {
    setViewer(
      <LayerBrowser
        binary={data}
        onError={onError}
        fullPage={props.fullPage}
      />
    )
  }

  const initialView = () => {
    return (
      <LocalLoader
        onFileLoad={onFileLoad}
        onError={onError}
      />
    )
  }

  const [viewer, setViewer] = useState<ReactNode>(initialView())

  return <WarpDiveImageProvider>{viewer}</WarpDiveImageProvider>
}
