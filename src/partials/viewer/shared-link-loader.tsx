import api from '@/lib/api-client'
import {useEffect} from 'react'

interface SharedLinkLoaderProps {
  fileOverride: string | undefined
  pid: string | undefined
  onFileLoad: (data: Uint8Array) => void
  onError: (e: Error) => void
}

export function SharedLinkLoader({fileOverride, pid, onFileLoad, onError}: SharedLinkLoaderProps) {
  useEffect(() => {
    const loadFile = async () => {
      try {
        if (fileOverride) {
          const response = await fetch(fileOverride)
          const arrayBuffer = await response.arrayBuffer()
          const binary = new Uint8Array(arrayBuffer)
          onFileLoad(binary)
        } else if (pid) {
          const resp = await api.shares[':pid'].$get({param: {pid: pid}})
          if (resp.ok) {
            const file = await resp.arrayBuffer()
            const binary = new Uint8Array(file)
            onFileLoad(binary)
          } else {
            const json = await resp.json()
          }
        }
      } catch (err) {
        onError(err)
      }
    }
    loadFile()
  }, [fileOverride, onError, onFileLoad, pid])

  return (
    <div className='fixed inset-0 z-10 overflow-y-auto'>
      <div className='align-items-center flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0'>
        <span
          className='hidden sm:inline-block sm:h-screen sm:align-middle'
          aria-hidden='true'
        >
          &#8203;
        </span>
        <div
          className='inline-block flex-1 transform overflow-hidden rounded-sm px-4 pb-4 pt-5 text-left align-bottom transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6 sm:align-middle'
          role='dialog'
          aria-modal='true'
          aria-labelledby='modal-headline'
        >
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full'>
            <svg
              className='h-15 w-15 text-black animate-spin'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              width='24'
              height='24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              ></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
