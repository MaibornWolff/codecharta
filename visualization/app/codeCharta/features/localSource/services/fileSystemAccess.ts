// The TypeScript DOM library knows the handles, but not yet the picker and the permission calls of the
// File System Access API (Chromium only), so this declares the part CodeCharta uses.
const READ_ONLY = { mode: "read" } as const

export interface LocalDirectoryHandle extends FileSystemDirectoryHandle {
    queryPermission(descriptor: typeof READ_ONLY): Promise<PermissionState>
    requestPermission(descriptor: typeof READ_ONLY): Promise<PermissionState>
}

type DirectoryPicker = (options: { id: string; mode: "read" }) => Promise<LocalDirectoryHandle>

const PICKER_ID = "codecharta-local-source"
/** What a browser throws when a policy or the page's embedding forbids the picker, as opposed to a cancel. */
const BLOCKING_ERROR_NAMES = new Set(["SecurityError", "NotAllowedError"])

export class FolderAccessBlockedError extends Error {}

/** Firefox, Safari, mobile browsers and pages without https have no folder picker; a frame of another origin may not show it. */
export function canOpenFoldersHere(page: Window = window): boolean {
    return "showDirectoryPicker" in page && !isInFrameOfAnotherOrigin(page)
}

function isInFrameOfAnotherOrigin(page: Window): boolean {
    if (page.self === page.top) {
        return false
    }
    try {
        return page.top.location.origin !== page.location.origin
    } catch {
        return true
    }
}

export async function pickFolder(): Promise<LocalDirectoryHandle | null> {
    const showDirectoryPicker = (window as unknown as { showDirectoryPicker: DirectoryPicker }).showDirectoryPicker
    try {
        return await showDirectoryPicker({ id: PICKER_ID, mode: "read" })
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            return null
        }
        if (error instanceof DOMException && BLOCKING_ERROR_NAMES.has(error.name)) {
            throw new FolderAccessBlockedError(error.message)
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
        const folder = await segments.reduce(
            (parent, segment) => parent.then(folder => folder.getDirectoryHandle(segment)),
            Promise.resolve(directory)
        )
        const fileHandle = await folder.getFileHandle(fileName)
        return await fileHandle.getFile()
    } catch (error) {
        if (error instanceof DOMException && (error.name === "NotFoundError" || error.name === "TypeMismatchError")) {
            return null
        }
        throw error
    }
}
