import {WarpDiveImageProvider} from './WarpDiveImageProvider'
import RemoteLoader from './RemoteLoader'
import ViewerHeader from './ViewerHeader'
export interface PageProps {
  binaryPath?: string
}

export default function RemoteViewerPage(props: PageProps) {
  return (
    <WarpDiveImageProvider>
      <ViewerHeader />
      <RemoteLoader binaryPath={props.binaryPath} />
    </WarpDiveImageProvider>
  )
}
