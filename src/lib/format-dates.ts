import {formatDistanceToNow} from 'date-fns/esm'

export function formatRelativeTimeFromUTC(utcDateStr: string) {
  const utcDate = new Date(utcDateStr + 'Z')
  return formatDistanceToNow(utcDate, {addSuffix: true})
}
