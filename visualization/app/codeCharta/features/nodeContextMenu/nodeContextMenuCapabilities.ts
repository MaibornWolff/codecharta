import { InjectionToken } from "@angular/core"
import { ViewId } from "../../routing/routePaths"

export interface NodeContextMenuCapabilities {
    /** Focus, highlight, flatten, exclude and folder marking only shape the metrics map. */
    showMapActions: boolean
    /** The views the menu offers to continue the node in; each is left out while it has nothing to show for it. */
    jumpTargetViews: ViewId[]
}

export const DEFAULT_NODE_CONTEXT_MENU_CAPABILITIES: NodeContextMenuCapabilities = {
    showMapActions: true,
    jumpTargetViews: ["domain", "dependencies"]
}

export const NODE_CONTEXT_MENU_CAPABILITIES = new InjectionToken<NodeContextMenuCapabilities>("NODE_CONTEXT_MENU_CAPABILITIES")
