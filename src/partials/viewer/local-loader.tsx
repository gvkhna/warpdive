import {Input} from '@/components/ui/input'
import {UploadIcon} from 'lucide-react'

interface LocalLoaderProps {
  onFileLoad: (data: Uint8Array) => void
  onError: (e: Error) => void
}

export function LocalLoader({onFileLoad, onError}: LocalLoaderProps) {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processFile(file, onFileLoad)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const file = event.dataTransfer.files?.[0]
    if (file) {
      processFile(file, onFileLoad)
    }
  }

  const processFile = (file: File, onFileProcessed: (data: Uint8Array) => void) => {
    const reader = new FileReader()
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer
      const data = new Uint8Array(arrayBuffer)
      onFileProcessed(data)
    }
    reader.onerror = (error) => {
      console.error('Error reading file', error)
      onError(new Error('Unable to read file. Please try again.'))
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <div
      className='bg-gray-100 dark:bg-gray-950 flex h-[calc(100vh_-_theme(spacing.16))] w-full items-center justify-center'
      onDrop={handleDrop}
      onDragOver={(event) => event.preventDefault()}
    >
      <div className='border-gray-200 dark:border-gray-800 dark:bg-gray-900 mx-4 flex w-full max-w-md flex-col items-center space-y-4 rounded-sm border bg-white p-6 shadow-sm'>
        <div className='border-gray-300 dark:border-gray-700 flex h-64 w-full flex-col items-center justify-center rounded-sm border-2 border-dashed p-4'>
          <UploadIcon className='text-gray-400 dark:text-gray-500 h-12 w-12' />
          <p className='text-gray-500 dark:text-gray-400 mt-4 px-4 text-center'>
            Drag and drop a `.warpdive` file here, or select a file below
          </p>
        </div>
        <div className='flex w-full flex-col items-center space-y-2'>
          <Input
            className='w-full'
            type='file'
            onChange={handleFileChange}
          />
          <p className='text-gray-500 dark:text-gray-400'>
            This file will only be opened in your local browser and is not uploaded or sent anywhere.
          </p>
        </div>
      </div>
    </div>
  )
}
