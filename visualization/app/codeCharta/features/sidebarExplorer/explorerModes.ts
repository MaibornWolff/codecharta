export interface ExplorerMode {
    id: string
    label: string
    icon: string
    searchPlaceholder: string
    searchAriaLabel: string
}

export const FILES_EXPLORER_MODE: ExplorerMode = {
    id: "files",
    label: "Files",
    icon: "fa-solid fa-folder-tree",
    searchPlaceholder: "*.js, **/app/*",
    searchAriaLabel: "Search files and folders"
}
