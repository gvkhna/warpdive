export default function log(...args: any[]) {
  const PUBLIC_DEBUG = import.meta.env.PUBLIC_DEBUG
  if (PUBLIC_DEBUG === 'true') {
    console.log.apply(null, args)
  }
}
