import { InjectionToken } from "@angular/core"

type FocusableNodes = "none" | "folders" | "foldersAndFiles"

export interface NodeContextMenuCapabilities {
    /** A view focuses what it can still draw something of: a graph of one file has no edge left to show. */
    focusableNodes: FocusableNodes
    /** Highlight, flatten and folder marking only shape the metrics map. */
    showMapActions: boolean
    /** Excluding leaves the node out of every view drawing the map's files. */
    showExclude: boolean
}

export const DEFAULT_NODE_CONTEXT_MENU_CAPABILITIES: NodeContextMenuCapabilities = {
    focusableNodes: "foldersAndFiles",
    showMapActions: true,
    showExclude: true
}

export const NODE_CONTEXT_MENU_CAPABILITIES = new InjectionToken<NodeContextMenuCapabilities>("NODE_CONTEXT_MENU_CAPABILITIES")
