import { InjectionToken } from "@angular/core"
import { ViewId } from "../../routing/routePaths"

export interface NodeContextMenuCapabilities {
    /** Focus, highlight, flatten, exclude and folder marking only shape the metrics map. */
    showMapActions: boolean
    /** The view the menu offers to continue the node in, or null where there is nowhere to jump. */
    jumpTargetView: ViewId | null
}

export const DEFAULT_NODE_CONTEXT_MENU_CAPABILITIES: NodeContextMenuCapabilities = {
    showMapActions: true,
    jumpTargetView: "domain"
}

export const NODE_CONTEXT_MENU_CAPABILITIES = new InjectionToken<NodeContextMenuCapabilities>("NODE_CONTEXT_MENU_CAPABILITIES")
