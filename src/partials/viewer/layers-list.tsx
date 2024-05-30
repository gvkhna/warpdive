import {Children, type PropsWithChildren} from 'react'
export interface LayersListProps {}

export function LayersList(props: PropsWithChildren<LayersListProps>) {
  return <div className='grid gap-2 p-2 md:p-3'>{props.children}</div>
}
