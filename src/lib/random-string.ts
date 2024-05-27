export function randomString(bufferLength = 16): string {
  const arrayBuffer = crypto.getRandomValues(new Uint8Array(bufferLength))
  return Array.from(arrayBuffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
