/**
 * IndexedDB-based project persistence for NovelForge Atelier
 * Stores project metadata and folder handles for reopening projects
 */

const DB_NAME = 'novelforge_atelier'
const DB_VERSION = 1
const STORE_NAME = 'projects'

export interface ProjectMeta {
    id: string
    name: string
    folderHandle: FileSystemDirectoryHandle
    chapterCount: number
    totalWords: number
    lastOpened: number // timestamp
    createdAt: number
}

let dbInstance: IDBDatabase | null = null

async function getDB(): Promise<IDBDatabase> {
    if (dbInstance) return dbInstance

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
            dbInstance = request.result
            resolve(dbInstance)
        }

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
                store.createIndex('lastOpened', 'lastOpened', { unique: false })
            }
        }
    })
}

export async function saveProject(project: ProjectMeta): Promise<void> {
    const db = await getDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const request = store.put(project)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
    })
}

export async function getRecentProjects(): Promise<ProjectMeta[]> {
    const db = await getDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const index = store.index('lastOpened')
        const request = index.openCursor(null, 'prev') // descending by lastOpened

        const results: ProjectMeta[] = []
        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
            if (cursor && results.length < 10) {
                results.push(cursor.value)
                cursor.continue()
            } else {
                resolve(results)
            }
        }
        request.onerror = () => reject(request.error)
    })
}

export async function deleteProject(id: string): Promise<void> {
    const db = await getDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite')
        const store = tx.objectStore(STORE_NAME)
        const request = store.delete(id)
        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
    })
}

/**
 * Re-request permission for a stored folder handle
 * Returns true if permission granted, false otherwise
 */
export async function requestFolderPermission(
    handle: FileSystemDirectoryHandle
): Promise<boolean> {
    try {
        const permission = await handle.requestPermission({ mode: 'readwrite' })
        return permission === 'granted'
    } catch {
        return false
    }
}

/**
 * Read all .md files from a project folder
 */
export async function readProjectFiles(
    handle: FileSystemDirectoryHandle
): Promise<{ name: string; content: string }[]> {
    const files: { name: string; content: string }[] = []

    for await (const entry of handle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.md')) {
            const file = await entry.getFile()
            const content = await file.text()
            files.push({ name: entry.name, content })
        }
    }

    // Sort by chapter number
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

    return files
}
