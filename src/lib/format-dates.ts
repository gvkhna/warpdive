import {formatDistanceToNow} from 'date-fns'

export function formatTimeFromUTC(utcDateStr: string) {
  const utcDate = new Date(utcDateStr + 'Z')
  let formatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'UTC'
  })
  return formatter.format(utcDate)
}

export function formatRelativeTimeFromUTC(utcDateStr: string) {
  const utcDate = new Date(utcDateStr + 'Z')
  return formatDistanceToNow(utcDate, {addSuffix: true})
}
