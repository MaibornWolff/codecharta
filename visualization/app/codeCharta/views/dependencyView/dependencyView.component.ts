import { ChangeDetectionStrategy, Component } from "@angular/core"
import { BottomBarComponent } from "../../features/bottomBar/facade"
import { DependencyMapComponent, provideDependencyMapContextMenuActions } from "../../features/dependencyMap/facade"
import {
    NODE_CONTEXT_MENU_CAPABILITIES,
    NodeContextMenuCapabilities,
    NodeContextMenuComponent,
    NodeContextMenuForExplorer
} from "../../features/nodeContextMenu/facade"
import { LoadingFileProgressSpinnerComponent, provideViewScopedCssVariables } from "../../features/shared/facade"
import {
    EXPLORER_CAPABILITIES,
    EXPLORER_CONTEXT_MENU,
    EXPLORER_ROW,
    EXPLORER_SELECTION,
    EXPLORER_TREE,
    ExplorerSearchBarComponent,
    FILES_EXPLORER_MODE,
    provideExplorerSearch,
    provideExplorerSort,
    provideViewScopedExplorerState,
    SidebarExplorerComponent
} from "../../features/sidebarExplorer/facade"
import { DependencyExplorerRow } from "./explorer/dependencyExplorerRow"
import { DEPENDENCY_EXPLORER_SEARCH } from "./explorer/dependencyExplorerSearch"
import { DependencyExplorerSelection } from "./explorer/dependencyExplorerSelection"
import { DEPENDENCY_EXPLORER_SORT } from "./explorer/dependencyExplorerSort"
import { DependencyExplorerTree } from "./explorer/dependencyExplorerTree"

@Component({
    selector: "cc-dependency-view",
    templateUrl: "./dependencyView.component.html",
    imports: [
        SidebarExplorerComponent,
        ExplorerSearchBarComponent,
        DependencyMapComponent,
        NodeContextMenuComponent,
        BottomBarComponent,
        LoadingFileProgressSpinnerComponent
    ],
    providers: [
        DependencyExplorerRow,
        { provide: EXPLORER_ROW, useExisting: DependencyExplorerRow },
        DependencyExplorerSelection,
        { provide: EXPLORER_SELECTION, useExisting: DependencyExplorerSelection },
        NodeContextMenuForExplorer,
        { provide: EXPLORER_CONTEXT_MENU, useExisting: NodeContextMenuForExplorer },
        DependencyExplorerTree,
        { provide: EXPLORER_TREE, useExisting: DependencyExplorerTree },
        provideExplorerSort(DEPENDENCY_EXPLORER_SORT),
        provideExplorerSearch(DEPENDENCY_EXPLORER_SEARCH),
        {
            provide: EXPLORER_CAPABILITIES,
            useValue: { showRules: false, showSearch: true, showCounts: false, modes: [FILES_EXPLORER_MODE] }
        },
        {
            provide: NODE_CONTEXT_MENU_CAPABILITIES,
            useValue: { showMapActions: false, jumpTargetView: "metrics" } satisfies NodeContextMenuCapabilities
        },
        provideDependencyMapContextMenuActions(),
        provideViewScopedExplorerState("dependencies"),
        provideViewScopedCssVariables()
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DependencyViewComponent {}
