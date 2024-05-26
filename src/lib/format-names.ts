export function getInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/)
  let initials = words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
  return initials
}
