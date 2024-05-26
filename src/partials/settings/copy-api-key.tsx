import {CopyButton} from './copy-api-key-btn'

export interface CopyApiKeyProps {
  apiKey: string
}

export default function CopyApiKey(props: CopyApiKeyProps) {
  return (
    <div className='relative'>
      <pre className='mb-4 mt-6 max-h-[650px] overflow-x-auto rounded-lg border py-4'>
        <code className='relative grid min-w-full break-words bg-transparent font-mono text-sm'>
          <span className='inline-block min-h-4 w-5/6 truncate px-4 py-[0.125rem]'>
            <span className='  break-all font-bold'>{props.apiKey}</span>
          </span>
        </code>
      </pre>
      <CopyButton
        value={props.apiKey}
        className='absolute right-4 top-4'
      />
    </div>
  )
}
