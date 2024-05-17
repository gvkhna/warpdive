import type {Meta, StoryObj} from '@storybook/react'
// import {Status} from '@/generated/google/rpc/status_pb'
// import {Code} from '@/generated/google/rpc/code_pb'
import {Any} from '@/generated/google/protobuf/any_pb'
import {WarpDiveImage} from '@/generated/warpdive_pb'
import Page from './page'
import fs from 'fs'
// import {fileURLToPath} from 'url'
import path from 'path'
// import {AppUser} from '@/generated/auth_pb'
// import {Timestamp} from '@/generated/google/protobuf/timestamp_pb'
// import {mockAppUser, mockFlashFormError, mockFlashFormSuccess} from '@/stories/mock-args'

// const __dirname = path.dirname(fileURLToPath(import.meta.url))

// async function fetchAndDeserialize() {
//   const response = await fetch('/test/assets/test.bin') // Note the path is relative to the root of the server
//   const arrayBuffer = await response.arrayBuffer()
//   // const warpDiveImage = WarpDiveImage.deserializeBinary(new Uint8Array(arrayBuffer));
//   // return warpDiveImage;
//   return arrayBuffer
// }

// console.log('resp', response)
// console.log('arr', arrayBuffer)

const meta = {
  title: 'ContainerBrowser/Page',
  component: Page,
  parameters: {
    layout: 'fullscreen'
  }
  // argTypes: {
  // }
} satisfies Meta<typeof Page>

export default meta
type Story = StoryObj<typeof meta>

// const binary = fs.readFileSync(path.resolve(__dirname, 'test.bin'))

// const line = {typeName: ApiCrawlerDirective.typeName, message: ApiCrawlerDirective.toJson(item)}

export const Default: Story = {
  // loaders: [async () => ({binary: await fetchAndDeserialize()})],
  // render: (args, {loaded}) => <Page binary={loaded.binary} />
  args: {
    binaryPath: '/test/assets/test.tmp.warpdive'
  }
}

// export const WithFormSubmit: Story = {
//   args: {
//     context: {
//       url: new URL('file:///app/settings/account/'),
//       flash: mockFlashFormSuccess(),
//       user: mockAppUser()
//     },
//     user: mockAppUser()
//   }
// }

// export const WithFormSubmitError: Story = {
//   args: {
//     context: {
//       url: new URL('file:///app/settings/account/'),
//       flash: mockFlashFormError(),
//       user: mockAppUser()
//     },
//     user: AppUser.create({fullName: 'Test Name', email: 'user@test.test', confirmedAt: Timestamp.fromDate(new Date())})
//   }
// }

// export const WithUnconfirmedEmail: Story = {
//   args: {
//     context: {
//       url: new URL('file:///app/settings/account/'),
//       flash: undefined,
//       user: mockAppUser()
//     },
//     user: AppUser.create({fullName: 'Test Name', email: 'user@test.test'})
//   }
// }

// export const WithFlash: Story = {
//   args: {
//     context: {
//       url: new URL('file:///app/settings/account/'),
//       flash: Status.create({code: Code.OK, message: 'Your profile was updated!'}),
//       user: mockAppUser()
//     },
//     user: AppUser.create({fullName: 'Test Name', email: 'user@test.test', confirmedAt: Timestamp.fromDate(new Date())})
//   }
// }

// export const WithFlashError: Story = {
//   args: {
//     context: {
//       url: new URL('file:///app/settings/account/'),
//       flash: Status.create({code: Code.INVALID_ARGUMENT, message: 'Your input was invalid'}),
//       user: mockAppUser()
//     },
//     user: AppUser.create({fullName: 'Test Name', email: 'user@test.test', confirmedAt: Timestamp.fromDate(new Date())})
//   }
// }
