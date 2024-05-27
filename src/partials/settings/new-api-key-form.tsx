import {PlusIcon} from '@radix-ui/react-icons'
import {Button} from '@/components/ui/button'
import {ErrorAlert} from './error-alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {Input} from '@/components/ui/input'
import {Label} from '@/components/ui/label'
import {useState} from 'react'
import api from '@/lib/api-client'
import {useNavigate} from 'react-router-dom'
import {ShowApiKeyDialog} from './show-api-key-dialog'
import {mutate} from 'swr'

export function NewApiKeyForm() {
  const navigate = useNavigate()

  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey, setApiKey] = useState('')

  const [open, setOpen] = useState(false)

  const [showError, setShowError] = useState(false)
  const [errorText, setErrorText] = useState('')

  const [description, setDescription] = useState('')
  const [showDescriptionRequired, setShowDescriptionRequired] = useState(false)

  const formSubmit = async () => {
    setErrorText('')
    setApiKey('')
    if (!description) {
      setShowDescriptionRequired(true)
      return
    }
    try {
      const res = await api.users['api-key'].new.$post({
        json: {
          description
        }
      })
      if (res.ok) {
        const json = await res.json()
        mutate(api.users.settings.$url().pathname)
        setApiKey(json.apiKey.token)
        setDescription('')
        setOpen(false)
        setShowApiKey(true)
      } else {
        const json = await res.json()
        if (json.message) {
          setDescription('')
          setErrorText(json.message)
          setOpen(false)
          setShowError(true)
        }
      }
    } catch (e) {
      console.log('api error: ', e)
      setDescription('')
      setErrorText('Unable to communicate with server, please try again.')
      setOpen(false)
      setShowError(true)
    }
  }

  return (
    <>
      <ShowApiKeyDialog
        open={showApiKey}
        onOpenChange={setShowApiKey}
        apiKey={apiKey}
      />
      <ErrorAlert
        open={showError}
        onOpenChange={setShowError}
        error={errorText}
      />
      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogTrigger asChild>
          <Button
            className='h-8 gap-1'
            size='sm'
          >
            <PlusIcon className='h-3.5 w-3.5' />
            <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>New API Key</span>
          </Button>
        </DialogTrigger>
        <DialogContent className='sm:max-w-[425px]'>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              formSubmit()
            }}
          >
            <DialogHeader>
              <DialogTitle>New API Key</DialogTitle>
              <DialogDescription>API Keys can only be named upon creation</DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label
                  htmlFor='description'
                  className='text-right'
                >
                  Description
                </Label>
                <Input
                  id='description'
                  placeholder='production ci'
                  className='col-span-3'
                  value={description}
                  onChange={(e) => {
                    setDescription(e.currentTarget.value)
                  }}
                  onPaste={(e) => {
                    setDescription(e.currentTarget.value)
                  }}
                />
              </div>
              {showDescriptionRequired && (
                <p className='text-sm font-medium text-destructive'>A description is required</p>
              )}
            </div>
            <DialogFooter>
              <Button type='submit'>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
