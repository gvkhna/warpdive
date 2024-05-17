import {PlusIcon, ChevronRightIcon, DownloadIcon} from '@radix-ui/react-icons'
import {type ComponentProps} from 'react'
import {cn} from '@/lib/utils'
import {Layer, NodeTree_Ref} from '@/generated/warpdive_pb'
import {useLayer} from './useLayer'
import {Badge} from '@/components/ui/badge'
import {formatBytesString} from './format'

export interface LayerRowProps {
  gid: string
  layer: Layer
}

export default function LayerRow(props: LayerRowProps) {
  const [layerState, setLayerState] = useLayer()
  return (
    <button
      key={props.gid}
      className={cn(
        'flex flex-col items-start gap-1 text-wrap break-all rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
        layerState.selectedGid?.gid === props.gid && 'bg-muted'
      )}
      onClick={() =>
        setLayerState({
          selectedGid: NodeTree_Ref.create({gid: props.gid})
        })
      }
    >
      <div className='flex gap-1'>
        <Badge>{`#${props.layer.index}`}</Badge>
        <Badge variant={'outline'}>{`Size: ${formatBytesString(props.layer.size)}`}</Badge>
      </div>
      <div className='flex w-full flex-col gap-1'>
        <div className='flex items-center'>
          <div className='flex items-center gap-2'>
            <div className=' font-mono font-medium'>{props.layer.command || ''}</div>
            {/* {!item.read && <span className='flex h-2 w-2 rounded-full bg-blue-600' />} */}
          </div>
          <div
            className={cn(
              'ml-auto text-xs',
              layerState.selectedGid?.gid === props.gid ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {/* {formatDistanceToNow(new Date(item.date), {
              addSuffix: true
            })} */}
          </div>
        </div>
        {props.layer.names && <div className='font-mono text-xs font-medium'>{props.layer.names}</div>}
      </div>
      <div className='line-clamp-2 font-mono text-xs text-muted-foreground'>{props.layer.digest}</div>
      {/* {item.labels.length ? (
        <div className='flex items-center gap-2'>
          {item.labels.map((label) => (
            <Badge
              key={label}
              variant={getBadgeVariantFromLabel(label)}
            >
              {label}
            </Badge>
          ))}
        </div>
      ) : null} */}
    </button>
  )
  // return (
  //   <div className='flex items-center justify-between text-wrap break-all rounded-md bg-gray-100 p-3 text-sm font-medium dark:bg-gray-800'>
  //     <div>
  //       <div className='break-all text-gray-500 dark:text-gray-400'>{props.command}</div>
  //       <div className='text-xs'>{props.digest}</div>
  //     </div>
  //     <div className='flex items-center gap-2'>
  //       {/* <div className='rounded-full bg-green-500 px-2 py-1 text-xs text-white'>Paid</div> */}
  //       <ChevronRightIcon className='h-4 w-4 text-gray-500 dark:text-gray-400' />
  //     </div>
  //   </div>
  // )
}

// function getBadgeVariantFromLabel(label: string): ComponentProps<typeof Badge>['variant'] {
//   if (['work'].includes(label.toLowerCase())) {
//     return 'default'
//   }

//   if (['personal'].includes(label.toLowerCase())) {
//     return 'outline'
//   }

//   return 'secondary'
// }
