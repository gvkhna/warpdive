import {useState, useEffect, useCallback} from 'react'
import {CheckIcon, ClipboardIcon} from 'lucide-react'
import {cn} from '@/lib/utils'
import {Button, ButtonProps} from '@/components/ui/button'
interface CopyButtonProps extends ButtonProps {
  value: string
  src?: string
}

export async function copyToClipboardWithMeta(value: string) {
  navigator.clipboard.writeText(value)
}

export function CopyButton({value, className, src, variant = 'ghost', ...props}: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setHasCopied(false)
    }, 2000)
  }, [hasCopied])

  return (
    <Button
      size='icon'
      variant={variant}
      className={cn('relative z-10 h-6 w-6 bg-zinc-900 text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50', className)}
      onClick={(event) => {
        event.preventDefault()
        copyToClipboardWithMeta(value)
        setHasCopied(true)
      }}
      {...props}
    >
      <span className='sr-only'>Copy</span>
      {hasCopied ? <CheckIcon className='h-3 w-3' /> : <ClipboardIcon className='h-3 w-3' />}
    </Button>
  )
}
