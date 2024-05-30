import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion'
import {type Dispatch, type SetStateAction} from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'

import {CopyApiKey} from './copy-api-key'

export interface ShowApiKeyDialogProps {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  apiKey: string
}

export function ShowApiKeyDialog({apiKey, onOpenChange, open}: ShowApiKeyDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='sm:max-w-[425px]'>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onOpenChange(false)
          }}
        >
          <DialogHeader>
            <DialogTitle>API Key</DialogTitle>
            <DialogDescription>Copy and save the api key, it cannot be shown again.</DialogDescription>
          </DialogHeader>
          <CopyApiKey apiKey={apiKey} />
          <Accordion
            type='single'
            collapsible
            className='w-full'
          >
            <AccordionItem
              value='item-1'
              className='border-none'
            >
              <AccordionTrigger className='py-2 text-sm'>Show full api key</AccordionTrigger>
              <AccordionContent className='break-all font-mono'>{apiKey}</AccordionContent>
            </AccordionItem>
          </Accordion>
          <DialogFooter className='pt-4'>
            <Button type='submit'>Continue</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
