// The TypeScript DOM library knows the handles, but not yet the picker and the permission calls of the
// File System Access API (Chromium only), so this declares the part CodeCharta uses.
const READ_ONLY = { mode: "read" } as const

export interface LocalDirectoryHandle extends FileSystemDirectoryHandle {
    queryPermission(descriptor: typeof READ_ONLY): Promise<PermissionState>
    requestPermission(descriptor: typeof READ_ONLY): Promise<PermissionState>
}

type DirectoryPicker = (options: { id: string; mode: "read" }) => Promise<LocalDirectoryHandle>

const PICKER_ID = "codecharta-local-source"

export function isFolderPickerSupported(): boolean {
    return typeof window !== "undefined" && "showDirectoryPicker" in window
}

export async function pickFolder(): Promise<LocalDirectoryHandle | null> {
    const showDirectoryPicker = (window as unknown as { showDirectoryPicker: DirectoryPicker }).showDirectoryPicker
    try {
        return await showDirectoryPicker({ id: PICKER_ID, mode: "read" })
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            return null
        }
        throw error
    }
}

export async function hasReadPermission(directory: LocalDirectoryHandle): Promise<boolean> {
    if ((await directory.queryPermission(READ_ONLY)) === "granted") {
        return true
    }
    return (await directory.requestPermission(READ_ONLY)) === "granted"
}

export async function findFile(directory: FileSystemDirectoryHandle, relativePath: string): Promise<File | null> {
    const segments = relativePath.split("/").filter(segment => segment !== "")
    const fileName = segments.pop()
    if (fileName === undefined) {
        return null
    }
    try {
        let folder = directory
        for (const segment of segments) {
            folder = await folder.getDirectoryHandle(segment)
        }
        const fileHandle = await folder.getFileHandle(fileName)
        return await fileHandle.getFile()
    } catch (error) {
        if (error instanceof DOMException && (error.name === "NotFoundError" || error.name === "TypeMismatchError")) {
            return null
        }
        throw error
    }
}
