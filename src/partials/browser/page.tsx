import {WarpDiveImageProvider} from './WarpDiveImageProvider'
import LayerBrowser from './ContainerBrowser'

export interface PageProps {
  binaryPath?: string
}

export default function Page(props: PageProps) {
  return (
    <WarpDiveImageProvider>
      <LayerBrowser binaryPath={props.binaryPath} />
    </WarpDiveImageProvider>
  )
}
