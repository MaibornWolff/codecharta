import { inject, Provider } from "@angular/core"
import { NODE_CONTEXT_MENU_VIEW_ACTIONS, NodeContextMenuViewAction } from "../nodeContextMenu/facade"
import { DependencyMapWriteStore } from "./stores/dependencyMap.write.store"

export function provideDependencyMapContextMenuActions(): Provider {
    return {
        provide: NODE_CONTEXT_MENU_VIEW_ACTIONS,
        useFactory: (): NodeContextMenuViewAction[] => {
            const writeStore = inject(DependencyMapWriteStore)
            return [
                {
                    label: "Exclude",
                    icon: "fa-solid fa-ban",
                    hoverHint: "Exclude node from the map, in every view",
                    run: path => writeStore.excludeNode(path)
                }
            ]
        }
    }
}
