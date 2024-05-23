import {Suspense, useMemo} from 'react'
import LayerBrowser from './LayerBrowser'

const useBinaryData = (binaryPath: string) => {
  const promise = useMemo(async () => {
    return fetchBinaryData(binaryPath).catch((err) => {
      throw new Error(`Failed to fetch binary data: ${err.message}`)
    })
  }, [binaryPath])

  // This will suspend the component until the promise resolves
  throw promise
}

const fetchBinaryData = async (binaryPath: string) => {
  const response = await fetch(binaryPath)
  const arrayBuffer = await response.arrayBuffer()
  const binary = new Uint8Array(arrayBuffer)
  return binary
}

interface BinaryDataLoaderProps {
  binaryPath: string
}

const BinaryDataLoader = (props: BinaryDataLoaderProps) => {
  const binary = useBinaryData(props.binaryPath)
  return (
    <LayerBrowser
      binary={binary}
      onError={() => {}}
    />
  )
}

const RemoteLoader = ({binaryPath}) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BinaryDataLoader binaryPath={binaryPath} />
    </Suspense>
  )
}

export default RemoteLoader
