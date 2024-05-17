// Importing necessary packages and components
import type {Meta, StoryObj} from '@storybook/react'
import LayerRow from './LayerRow'
import {WarpDiveImage_Layer} from '@/generated/warpdive_pb'
import LayersList from './LayersList'

const meta: Meta<typeof LayerRow> = {
  title: 'ContainerBrowser/LayersList',
  component: LayersList,
  parameters: {
    layout: 'fullscreen'
  }
}

export default meta

type Story = StoryObj<typeof meta>

// Generating fake layer data
const layers = Array.from({length: 10}).map((_, index) => ({
  gid: index.toString(),
  layer: WarpDiveImage_Layer.create({
    id: `layer-${index}`,
    index: index,
    command: `command-really-long-digest-1l2kj3l1k2j3lk1j3l1kj3l12j3lk12j3kl12${index}`,
    size: `${1000 * (index + 1)}`,
    names: [`name-${index}-1`, `name-${index}-2`],
    digest: `digest-${index}`
  })
}))

export const Default: Story = {
  render: () => (
    <div className='w-72'>
      <LayersList>
        {layers.map((item) => (
          <LayerRow
            key={item.gid}
            gid={item.gid}
            layer={item.layer}
          />
        ))}
      </LayersList>
    </div>
  )
}
