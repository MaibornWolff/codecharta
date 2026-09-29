import { inject, Provider } from "@angular/core"
import { NODE_CONTEXT_MENU_VIEW_ACTIONS, NodeContextMenuViewAction } from "../nodeContextMenu/facade"
import { DependencyMapViewStore } from "./stores/dependencyMapView.store"

export function provideDependencyMapContextMenuActions(): Provider {
    return {
        provide: NODE_CONTEXT_MENU_VIEW_ACTIONS,
        useFactory: (): NodeContextMenuViewAction[] => {
            const viewStore = inject(DependencyMapViewStore)
            return [
                {
                    label: "Hide",
                    icon: "fa-regular fa-eye-slash",
                    hoverHint: "Leave this node and its dependencies out of the dependency graph",
                    run: path => viewStore.hide(path),
                    isOfferedFor: path => !viewStore.isHidden(path)
                },
                {
                    label: "Show again",
                    icon: "fa-regular fa-eye",
                    hoverHint: "Bring this node, and the hidden folders holding it, back into the dependency graph",
                    run: path => viewStore.show(path),
                    isOfferedFor: path => viewStore.isHidden(path)
                }
            ]
        }
    }
}
