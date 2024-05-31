export interface ExampleItem {
  id: string
  name: string
  url: string
  image: string
  default?: boolean
}

export const Examples: ExampleItem[] = [
  {
    id: 'node',
    name: 'node:latest',
    url: 'https://www.warpdive.xyz/share/01hz83hcecw8r0fvcnqgd5wjym/',
    image: 'node-latest.png',
    default: true
  },
  {
    id: 'ubuntu',
    name: 'ubuntu:noble',
    url: 'https://www.warpdive.xyz/share/01hz83bn4b9j96mjwafv1b70f1/',
    image: 'ubuntu-latest.png'
  },
  {
    id: 'alpine',
    name: 'alpine:latest',
    url: 'https://www.warpdive.xyz/share/01hz83k19mp010dkx2yr6bpwhp/',
    image: 'alpine-latest.png'
  },
  {
    id: 'postgres',
    name: 'postgres:latest',
    url: 'https://www.warpdive.xyz/share/01hz83g7k1h6tcf5hkm30kr37e/',
    image: 'postgres-latest.png'
  },
  {
    id: 'mysql',
    name: 'mysql:latest',
    url: 'https://www.warpdive.xyz/share/01hz83j8a4d1yh05s8pd1cp7m1/',
    image: 'mysql-latest.png'
  },
  {
    id: 'rails',
    name: 'rails:latest',
    url: 'https://www.warpdive.xyz/share/01hz83e89vvkvv9bsdg0f6rm24/',
    image: 'rails-latest.png'
  },
  {
    id: 'redis',
    name: 'redis:latest',
    url: 'https://www.warpdive.xyz/share/01hz83d1rj1x79ph96ywgycv2x/',
    image: 'redis-latest.png'
  },
  {
    id: 'python',
    name: 'python:latest',
    url: 'https://www.warpdive.xyz/share/01hz83fbw8pxp8g89c6vm3gysg/',
    image: 'python-latest.png'
  }
]
