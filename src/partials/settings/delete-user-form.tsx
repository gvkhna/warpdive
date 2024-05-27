import {Separator} from '@/components/ui/separator'
import {Button, buttonVariants} from '@/components/ui/button'
import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import api from '@/lib/api-client'
import {ErrorAlert} from './error-alert'
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

export interface DeleteUserFormProps {
  showInitialError?: boolean
}

export default function DeleteUserForm({showInitialError = false}: DeleteUserFormProps) {
  const navigate = useNavigate()

  const [showError, setShowError] = useState(showInitialError)
  const [errorText, setErrorText] = useState('')

  const formSubmit = async () => {
    setErrorText('')
    const res = await api.users.delete.$get()

    if (res.ok) {
      // navigate('/signout')
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
      <div>
        <h3 className='text-lg font-medium'>Delete account</h3>
        <p className='text-sm text-muted-foreground'>This action will destroy all of your data and is irreversible.</p>
      </div>
      <Separator />
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant='destructive'>Delete account</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              formSubmit()
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription className='pb-2'>
                This action cannot be undone. This will permanently delete your account and remove your data from our
                servers.
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
    </>
  )
}
