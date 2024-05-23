import {WarpDiveImageProvider} from './WarpDiveImageProvider'
import RemoteLoader from './RemoteLoader'
import AppHeader from '@partials/header/AppHeader'
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
