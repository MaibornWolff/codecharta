export type FileRoot = {
    rootName: string
    rootPath: string
    updateRoot: (name: string) => void
}

export const fileRoot: FileRoot = {
    rootName: "root",
    rootPath: "/root",
    updateRoot(name: string) {
        this.rootName = name
        this.rootPath = `/${name}`
    }
}
