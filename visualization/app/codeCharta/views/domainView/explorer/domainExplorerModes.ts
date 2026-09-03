import { ExplorerMode, FILES_EXPLORER_MODE } from "../../../features/sidebarExplorer/facade"

export const WORDS_EXPLORER_MODE: ExplorerMode = {
    id: "words",
    label: "Words",
    icon: "fa-solid fa-font",
    searchPlaceholder: "payment, invoice",
    searchAriaLabel: "Search words"
}

export const DOMAIN_EXPLORER_MODES: ExplorerMode[] = [FILES_EXPLORER_MODE, WORDS_EXPLORER_MODE]
