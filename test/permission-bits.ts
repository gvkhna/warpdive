// drwxr-xr-x (2147484141)
// Lrwxrwxrwx (134218239)
// -rw-r--r-- (420)
// -rwxr-xr-x (493)
// ---------- (0)
// drwxr-x--- (2147484136)

// Constants for file mode bits
const ModeDir = 0o040000;       // Directory
const ModeSymlink = 0o120000;   // Symbolic Link
const ModeRegular = 0o100000;   // Regular File
const ModeSocket = 0o140000;    // Socket
const ModeNamedPipe = 0o010000; // Named pipe (FIFO)
const ModeCharDevice = 0o020000; // Character device
const ModeBlockDevice = 0o060000; // Block device

// Permission bits mask
const ModePerm = 0o777; // Includes Setuid (0o4000), Setgid (0o2000), and Sticky (0o1000)

function fileTypeFlagToString(mode: number): string {
    if ((mode & ModeDir) === ModeDir) return 'd';
    if ((mode & ModeSymlink) === ModeSymlink) return 'l';
    if ((mode & ModeSocket) === ModeSocket) return 's';
    if ((mode & ModeNamedPipe) === ModeNamedPipe) return 'p';
    if ((mode & ModeCharDevice) === ModeCharDevice) return 'c';
    if ((mode & ModeBlockDevice) === ModeBlockDevice) return 'b';
    if ((mode & ModeRegular) === ModeRegular) return '-';
    return '?'; // Unknown type
}

function permissionToString(mode: number): string {
    const permissions = ['---', '---', '---'];
    for (let i = 0; i < 9; i++) {
        const bit = 1 << (8 - i);
        const charIndex = Math.floor(i / 3); // 0 for user, 1 for group, 2 for others
        const charPos = i % 3; // 0 for read, 1 for write, 2 for execute
        if (mode & bit) {
            permissions[charIndex] = replaceCharAt(permissions[charIndex], charPos,
                charPos === 0 ? 'r' : charPos === 1 ? 'w' : 'x');
        }
    }
    return permissions.join('');
}

function replaceCharAt(str: string, index: number, char: string) {
    return str.substr(0, index) + char + str.substr(index + 1);
}

function formatFileMode(mode: number): string {
    const type = fileTypeFlagToString(mode);
    const perms = permissionToString(mode & ModePerm);
    return type + perms;
}

// Example usage:
console.log(formatFileMode(0o100755)); // '-rwxr-xr-x' for a regular file with 755 permissions
console.log(formatFileMode(0o40755));  // 'drwxr-xr-x' for a directory with 755 permissions
console.log(formatFileMode(0o120777)); // 'lrwxrwxrwx' for a symlink with 777 permissions
