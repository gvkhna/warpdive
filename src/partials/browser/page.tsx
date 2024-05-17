import {WarpImageProvider} from './WarpImageProvider'
import LayerBrowser from './LayerBrowser'

export interface PageProps {
  binaryPath?: string
}

export default function Page(props: PageProps) {
  return (
    <WarpImageProvider>
      <LayerBrowser binaryPath={props.binaryPath} />
    </WarpImageProvider>
  )
}
