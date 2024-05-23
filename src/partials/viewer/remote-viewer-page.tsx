import {WarpDiveImageProvider} from './warp-dive-image-provider'
import RemoteLoader from './remote-loader'
import AppHeader from '@/partials/header/viewer-header'
export interface PageProps {
  binaryPath?: string
}

export default function RemoteViewerPage(props: PageProps) {
  return (
    <WarpDiveImageProvider>
      <AppHeader />
      <RemoteLoader binaryPath={props.binaryPath} />
    </WarpDiveImageProvider>
  )
}
