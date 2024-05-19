export function formatBytesString(bytes: string): string {
  const val = parseInt(bytes, 10)
  if (!isNaN(val) && isFinite(val)) {
    return formatBytes(val)
  }
  return bytes
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return bytes + ' B' // Less than 1 KB, show in bytes
  }

  let kilobytes = bytes / 1024
  if (kilobytes < 1000) {
    return kilobytes.toFixed(0) + ' KB' // Less than 1 MB, show in KB without decimals
  }

  let megabytes = kilobytes / 1024
  if (megabytes < 1) {
    return megabytes.toFixed(1) + ' MB' // Less than 1 MB, show one decimal
  } else if (megabytes < 100) {
    return megabytes.toFixed(1) + ' MB' // From 1 MB to 100 MB, show one decimal
  } else if (megabytes < 1000) {
    return megabytes.toFixed(0) + ' MB' // From 100 MB to 1 GB, no decimal
  }

  let gigabytes = megabytes / 1024
  if (gigabytes < 100) {
    return gigabytes.toFixed(1) + ' GB' // From 1 GB to 100 GB, show one decimal
  } else {
    return gigabytes.toFixed(0) + ' GB' // More than 100 GB, no decimal
  }
}
