export interface ExampleItem {
  id: string
  name: string
  url: string
  image: string
  default?: boolean
}

export const Examples: ExampleItem[] = [
  {
    id: 'ubuntu',
    name: 'ubuntu:noble',
    url: 'https://www.warpdive.xyz/share/01hz598eawqwkdvetayjankaps/',
    image: 'ubuntu-latest.png',
    default: true
  },
  {
    id: 'alpine',
    name: 'alpine:latest',
    url: 'https://www.warpdive.xyz/share/01hz58ztjzh93jgngjtt581fyj/',
    image: 'alpine-latest.png'
  },
  {
    id: 'node',
    name: 'node:latest',
    url: 'https://www.warpdive.xyz/share/01hz593s1qj1c1epghmnv66vdn/',
    image: 'node-latest.png'
  },
  {
    id: 'postgres',
    name: 'postgres:latest',
    url: 'https://www.warpdive.xyz/share/01hz594hj6bekjf5q98verwczf/',
    image: 'postgres-latest.png'
  },
  {
    id: 'mysql',
    name: 'mysql:latest',
    url: 'https://www.warpdive.xyz/share/01hz592agzagwn15sxr956q1yp/',
    image: 'mysql-latest.png'
  },
  {
    id: 'rails',
    name: 'rails:latest',
    url: 'https://www.warpdive.xyz/share/01hz596s47kbsmgcr7nh0k2j6n/',
    image: 'rails-latest.png'
  },
  {
    id: 'redis',
    name: 'redis:latest',
    url: 'https://www.warpdive.xyz/share/01hz597h1bqks51e3mzkcmxj4q/',
    image: 'redis-latest.png'
  },
  {
    id: 'python',
    name: 'python:latest',
    url: 'https://www.warpdive.xyz/share/01hz595nvxstzkv4rxxzae2z6c/',
    image: 'python-latest.png'
  }
]
