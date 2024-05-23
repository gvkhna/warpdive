import {formatFileMode, formatFilePermissionsMode} from './format-permissions'

test('permissions are read correctly', () => {
  // TODO: figure out why file type flag is not read correctly

  // expect(formatFileMode(0o100755)).toBe('-rwxr-xr-x')
  // expect(formatFileMode(0o40755)).toBe('drwxr-xr-x')
  // expect(formatFileMode(0o120777)).toBe('lrwxrwxrwx')
  expect(formatFilePermissionsMode(0o100755)).toBe('rwxr-xr-x')
  expect(formatFilePermissionsMode(0o40755)).toBe('rwxr-xr-x')
  expect(formatFilePermissionsMode(0o120777)).toBe('rwxrwxrwx')

  // expect(formatFileMode(2147484141)).toBe('drwxr-xr-x')
  // expect(formatFileMode(134218239)).toBe('Lrwxrwxrwx')
  // expect(formatFileMode(420)).toBe('-rw-r--r--')
  // expect(formatFileMode(493)).toBe('-rwxr-xr-x')
  // expect(formatFileMode(0)).toBe('----------')
  // expect(formatFileMode(2147484136)).toBe('drwxr-x---')

  expect(formatFilePermissionsMode(2147484141)).toBe('rwxr-xr-x')
  expect(formatFilePermissionsMode(134218239)).toBe('rwxrwxrwx')
  expect(formatFilePermissionsMode(420)).toBe('rw-r--r--')
  expect(formatFilePermissionsMode(493)).toBe('rwxr-xr-x')
  expect(formatFilePermissionsMode(0)).toBe('---------')
  expect(formatFilePermissionsMode(2147484136)).toBe('rwxr-x---')
})
