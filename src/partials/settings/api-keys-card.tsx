import {MoreHorizontal} from 'lucide-react'

import {Badge} from '@/components/ui/badge'
import {PlusIcon} from '@radix-ui/react-icons'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table'
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

export function NewApiKeyForm() {
  const navigate = useNavigate()

  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKey, setApiKey] = useState('')

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
        setApiKey(json.apiKey.token)
        setShowApiKey(true)
      } else {
        const json = await res.json()
        if (json.message) {
          setErrorText(json.message)
          setShowError(true)
        }
      }
    } catch (e) {
      console.log('api error: ', e)
      setErrorText('Unable to communicate with server, please try again.')
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
      <Dialog>
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

export default function ApiKeysCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>Manage your api keys for the command line client</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {/* <TableHead className='hidden w-[100px] sm:table-cell'>
                <span className='sr-only'>Image</span>
              </TableHead> */}
              <TableHead>Description</TableHead>
              {/* <TableHead>Status</TableHead> */}
              {/* <TableHead className='hidden md:table-cell'>Price</TableHead> */}
              {/* <TableHead className='hidden md:table-cell'>Total Sales</TableHead> */}
              <TableHead className='hidden md:table-cell'>Last used</TableHead>
              <TableHead>
                <span className='sr-only'>Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className='font-medium'>Laser Lemonade Machin </TableCell>
              <TableCell className='hidden md:table-cell'>2023-07-12 10:42 AM</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-haspopup='true'
                      size='icon'
                      variant='ghost'
                      className=''
                    >
                      <MoreHorizontal className='h-4 w-4' />
                      <span className='sr-only'>Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>Revoke</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <NewApiKeyForm />
      </CardFooter>
    </Card>
  )
}
