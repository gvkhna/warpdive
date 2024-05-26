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
import {Dispatch, SetStateAction} from 'react'

export interface ErrorAlertProps {
  open: boolean
  onOpenChange: Dispatch<SetStateAction<boolean>>
  error: string
}

export function ErrorAlert({open, onOpenChange, error}: ErrorAlertProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogContent>
        <form
          onSubmit={(e) => {
            onOpenChange(false)
            e.preventDefault()
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction asChild>
              <button type='submit'>Continue</button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
