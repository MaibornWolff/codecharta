import { LocalDirectoryHandle } from "./fileSystemAccess"

/** A folder tree as nested objects: a string is a file's content, an object a sub folder. */
export interface FakeFolderTree {
    [name: string]: string | FakeFolderTree
}

export function fakeDirectory(name: string, tree: FakeFolderTree, permission: PermissionState = "granted"): LocalDirectoryHandle {
    return {
        name,
        kind: "directory",
        queryPermission: jest.fn().mockResolvedValue(permission),
        requestPermission: jest.fn().mockResolvedValue(permission),
        getDirectoryHandle: jest.fn((childName: string) => {
            const child = tree[childName]
            if (child === undefined) {
                return Promise.reject(new DOMException("missing", "NotFoundError"))
            }
            if (typeof child === "string") {
                return Promise.reject(new DOMException("a file", "TypeMismatchError"))
            }
            return Promise.resolve(fakeDirectory(childName, child, permission))
        }),
        getFileHandle: jest.fn((childName: string) => {
            const child = tree[childName]
            if (typeof child !== "string") {
                return Promise.reject(new DOMException("missing", "NotFoundError"))
            }
            return Promise.resolve({ getFile: () => Promise.resolve(new File([child], childName)) })
        })
    } as unknown as LocalDirectoryHandle
}
