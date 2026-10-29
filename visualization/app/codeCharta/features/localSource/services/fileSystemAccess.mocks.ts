import { LocalDirectoryHandle } from "./fileSystemAccess"

/** A folder tree as nested objects: a string is a file's content, an object a sub folder. */
export interface FakeFolderTree {
    [name: string]: string | FakeFolderTree
}

export function fakeDirectory(name: string, tree: FakeFolderTree, permission: PermissionState = "granted"): LocalDirectoryHandle {
    const directory = {
        name,
        kind: "directory",
        isSameEntry: jest.fn(async (other: unknown) => other === directory),
        queryPermission: jest.fn().mockResolvedValue(permission),
        requestPermission: jest.fn().mockResolvedValue(permission),
        getDirectoryHandle: jest.fn(async (childName: string) => {
            const child = tree[childName]
            if (child === undefined) {
                throw new DOMException("missing", "NotFoundError")
            }
            if (typeof child === "string") {
                throw new DOMException("a file", "TypeMismatchError")
            }
            return fakeDirectory(childName, child, permission)
        }),
        getFileHandle: jest.fn(async (childName: string) => {
            const child = tree[childName]
            if (typeof child !== "string") {
                throw new DOMException("missing", "NotFoundError")
            }
            return { getFile: async () => new File([child], childName) }
        })
    } as unknown as LocalDirectoryHandle
    return directory
}
