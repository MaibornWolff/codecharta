export interface ExplorerMode {
    id: string
    label: string
    icon: string
    searchPlaceholder: string
    searchAriaLabel: string
    /** A mode that is no searchable, sortable list drops the search bar and the sort control while it is open. */
    hidesListTools?: boolean
}

export const FILES_EXPLORER_MODE: ExplorerMode = {
    id: "files",
    label: "Files",
    icon: "fa-solid fa-folder-tree",
    searchPlaceholder: "*.js, **/app/*",
    searchAriaLabel: "Search files and folders"
}
