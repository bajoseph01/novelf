/**
 * Simple utility for interacting with the File System Access API
 */

export async function getDirectoryHandle() {
    try {
        const handle = await window.showDirectoryPicker({
            mode: 'readwrite',
        });
        return handle;
    } catch (err) {
        if ((err as Error).name === 'AbortError') return null;
        throw err;
    }
}

export async function writeFile(
    dirHandle: FileSystemDirectoryHandle,
    filename: string,
    content: string
) {
    const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();
}

export async function listFiles(dirHandle: FileSystemDirectoryHandle) {
    const files = [];
    for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
            files.push(entry);
        }
    }
    return files;
}
