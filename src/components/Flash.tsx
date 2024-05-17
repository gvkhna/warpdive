import {Status} from 'src/generated/google/rpc/status_pb'
import {Code} from 'src/generated/google/rpc/code_pb'
import type {FormResp} from 'src/generated/form_pb'
import {Struct} from 'src/generated/google/protobuf/struct_pb'

import {AlertCircle, CheckCircle2} from 'lucide-react'

import {Alert, AlertDescription, AlertTitle} from '@ui/alert'

export type FlashType = Status | FormResp | undefined

export interface FlashProps {
  flash: Status | FormResp | undefined
}

export function getFlashFormValue(flash: FlashType, key: string) {
  if (flash && 'form' in flash && flash.form && Struct.is(flash.form)) {
    const json = Struct.toJson(flash.form)
    if (json) {
      return json[key] || ''
    }
  }
  return ''
}

export default function Flash(props: FlashProps) {
  return (
    <>
      {props.flash?.code === Code.OK && props.flash.message && (
        <Alert>
          <CheckCircle2 className='h-4 w-4' />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{props.flash.message}</AlertDescription>
        </Alert>
      )}
      {typeof props.flash?.code === 'number' && props.flash?.code !== Code.OK && (
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{props.flash?.message}</AlertDescription>
        </Alert>
      )}
    </>
  )
}
