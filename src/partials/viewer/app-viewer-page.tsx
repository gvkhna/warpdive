import {WarpDiveImageProvider} from './warp-dive-image-provider'
import AppLoader from './app-loader'
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
import {useParams} from 'react-router-dom'

interface AppViewerPageProps {
  fileOverride?: string
}

export default function AppViewerPage({fileOverride}: AppViewerPageProps) {
  const {pid} = useParams()

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
                  setViewer(initialView(fileOverride, pid))
                }}
              >
                Try Again
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AppLoader
          fileOverride={''}
          pid={''}
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
      />
    )
  }

  const initialView = (fileOverride_: string | undefined, pid_: string | undefined) => {
    return (
      <AppLoader
        fileOverride={fileOverride_}
        pid={pid_}
        onFileLoad={onFileLoad}
        onError={onError}
      />
    )
  }

  const [viewer, setViewer] = useState<ReactNode>(initialView(fileOverride, pid))

  return <WarpDiveImageProvider>{viewer}</WarpDiveImageProvider>
}
