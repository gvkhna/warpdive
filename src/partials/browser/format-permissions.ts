// Constants for file mode bits
const ModeDir = 0o040000 // Directory
const ModeSymlink = 0o120000 // Symbolic Link
const ModeRegular = 0o100000 // Regular File
const ModeSocket = 0o140000 // Socket
const ModeNamedPipe = 0o010000 // Named pipe (FIFO)
const ModeCharDevice = 0o020000 // Character device
const ModeBlockDevice = 0o060000 // Block device

// Permission bits mask
const ModePerm = 0o777 // Permissions mask
// Adjust the file type bitmask to ensure proper isolation of type bits
function fileTypeFlagToString(mode: number): string {
  const typeBits = mode & 0o170000 // This isolates the upper file type bits
  // console.log(typeBits.toString(8)) // Log for debugging

  if (typeBits === ModeSymlink) return 'l' // Check for symlink first
  if (typeBits === ModeDir) return 'd' // Then check for directory
  if (typeBits === ModeSocket) return 's'
  if (typeBits === ModeNamedPipe) return 'p'
  if (typeBits === ModeCharDevice) return 'c'
  if (typeBits === ModeBlockDevice) return 'b'
  if (typeBits === ModeRegular) return '-' // Ensure regular file is correctly identified
  return '?' // Fallback for unidentified types
}

// Make sure to handle permissions correctly
function permissionToString(mode: number): string {
  const permissions = ['---', '---', '---']
  for (let i = 0; i < 9; i++) {
    const bit = 1 << (8 - i)
    const charIndex = Math.floor(i / 3)
    const charPos = i % 3
    if ((mode & bit) !== 0) {
      permissions[charIndex] = replaceCharAt(
        permissions[charIndex],
        charPos,
        charPos === 0 ? 'r' : charPos === 1 ? 'w' : 'x'
      )
    }
  }
  return permissions.join('')
}

function replaceCharAt(str: string, index: number, char: string): string {
  return str.substring(0, index) + char + str.substring(index + 1)
}

export function formatFilePermissionsMode(mode: number): string {
  const perms = permissionToString(mode & ModePerm)
  return perms
}

export function formatFileMode(mode: number): string {
  const type = fileTypeFlagToString(mode)
  const perms = permissionToString(mode & ModePerm)
  return type + perms
}
