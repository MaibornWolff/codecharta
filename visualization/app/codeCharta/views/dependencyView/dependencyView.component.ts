import { ChangeDetectionStrategy, Component } from "@angular/core"
import { BottomBarComponent } from "../../features/bottomBar/facade"
import { DependencyBarComponent, DependencyEdgeLegendComponent, DependencyMapComponent } from "../../features/dependencyMap/facade"
import { LegendDrawerComponent } from "../../features/legend/facade"
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
    EXPLORER_COUNTS,
    EXPLORER_ROW,
    EXPLORER_RULES,
    EXPLORER_SELECTION,
    EXPLORER_TREE,
    ExplorerSearchBarComponent,
    FILES_EXPLORER_MODE,
    provideExplorerSearch,
    provideExplorerSort,
    provideViewScopedExplorerState,
    SidebarExplorerComponent
} from "../../features/sidebarExplorer/facade"
import { MapExplorerRules } from "../mapExplorer/mapExplorerRules"
import { DependencyExplorerCounts } from "./explorer/dependencyExplorerCounts"
import { DependencyExplorerRow } from "./explorer/dependencyExplorerRow"
import { DEPENDENCY_EXPLORER_SEARCH } from "./explorer/dependencyExplorerSearch"
import { DependencyExplorerSelection } from "./explorer/dependencyExplorerSelection"
import { DEPENDENCY_EXPLORER_SORT } from "./explorer/dependencyExplorerSort"
import { DependencyExplorerTree } from "./explorer/dependencyExplorerTree"
import { ShowsHandedOverNodeDirective } from "./explorer/showsHandedOverNode.directive"

@Component({
    selector: "cc-dependency-view",
    templateUrl: "./dependencyView.component.html",
    imports: [
        SidebarExplorerComponent,
        ExplorerSearchBarComponent,
        DependencyMapComponent,
        DependencyBarComponent,
        LegendDrawerComponent,
        DependencyEdgeLegendComponent,
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
        DependencyExplorerCounts,
        { provide: EXPLORER_COUNTS, useExisting: DependencyExplorerCounts },
        MapExplorerRules,
        { provide: EXPLORER_RULES, useExisting: MapExplorerRules },
        provideExplorerSort(DEPENDENCY_EXPLORER_SORT),
        provideExplorerSearch(DEPENDENCY_EXPLORER_SEARCH),
        {
            provide: EXPLORER_CAPABILITIES,
            useValue: { showRules: true, showSearch: true, showCounts: true, canFlatten: false, modes: [FILES_EXPLORER_MODE] }
        },
        {
            provide: NODE_CONTEXT_MENU_CAPABILITIES,
            useValue: { showMapActions: false, showExclude: true } satisfies NodeContextMenuCapabilities
        },
        provideViewScopedExplorerState("dependencies"),
        provideViewScopedCssVariables()
    ],
    hostDirectives: [ShowsHandedOverNodeDirective],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DependencyViewComponent {}
