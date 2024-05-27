import {MoreHorizontal} from 'lucide-react'
import {Button, buttonVariants} from '@/components/ui/button'
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table'
import * as schema from '@/db/schema'
import {NewApiKeyForm} from './new-api-key-form'
import {formatRelativeTimeFromUTC, formatTimeFromUTC} from '@/lib/format-dates'
import {useState} from 'react'
import {ErrorAlert} from './error-alert'
import api from '@/lib/api-client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import {useNavigate} from 'react-router-dom'
import {mutate} from 'swr'

export interface ApiKeysCardProps {
  apiKeys?: Omit<typeof schema.apiKeys.$inferSelect, 'id' | 'userId'>[]
}

export function ApiKeysCard(props: ApiKeysCardProps) {
  const navigate = useNavigate()

  const [showConfirmRevoke, setShowConfirmRevoke] = useState(false)

  const [showError, setShowError] = useState(false)
  const [errorText, setErrorText] = useState('')
  const [revokePid, setRevokePid] = useState('')

  console.log('loading api keys: ', props.apiKeys)

  const revokeFormApiKey = async () => {
    setErrorText('')
    const res = await api.users['api-key'].revoke.$post({
      json: {
        pid: revokePid
      }
    })

    if (res.ok) {
      mutate(api.users.settings.$url().pathname)
      navigate('/app/settings')
    } else {
      const json = await res.json()
      setErrorText(json.message)
      setShowError(true)
    }
  }

  return (
    <>
      <ErrorAlert
        open={showError}
        onOpenChange={setShowError}
        error={errorText}
      />
      <AlertDialog
        open={showConfirmRevoke}
        onOpenChange={setShowConfirmRevoke}
      >
        <AlertDialogContent>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              setShowConfirmRevoke(false)
              revokeFormApiKey()
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className='pb-2'>
                This will permanently delete the api key.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                asChild
                className={buttonVariants({variant: 'destructive'})}
              >
                <button type='submit'>Continue</button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Manage your API Keys for `warpdive-cli`</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className='hidden md:table-cell'>Last used</TableHead>
                <TableHead className='hidden md:table-cell'>Created</TableHead>
                <TableHead>
                  <span className='sr-only'>Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.apiKeys &&
                props.apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.pid}>
                    <TableCell className='font-medium'>{apiKey.description}</TableCell>
                    <TableCell className='hidden md:table-cell'>
                      {apiKey.updatedAt &&
                        apiKey.createdAt &&
                        (apiKey.createdAt === apiKey.updatedAt ? '-' : formatRelativeTimeFromUTC(apiKey.updatedAt))}
                    </TableCell>
                    <TableCell className='hidden md:table-cell'>
                      {apiKey.createdAt && formatTimeFromUTC(apiKey.createdAt)}
                    </TableCell>
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
                          <DropdownMenuItem
                            onClick={() => {
                              console.log('api key: ', apiKey.pid)
                              if (apiKey.pid) {
                                setRevokePid(apiKey.pid)
                                setShowConfirmRevoke(true)
                              }
                            }}
                          >
                            Revoke
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <NewApiKeyForm />
        </CardFooter>
      </Card>
    </>
  )
}
