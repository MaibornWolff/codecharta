import { ChangeDetectionStrategy, Component } from "@angular/core"
import { BottomBarComponent } from "../../features/bottomBar/facade"
import {
    DependencyBarComponent,
    DependencyEdgeLegendComponent,
    DependencyMapArrival,
    DependencyMapComponent
} from "../../features/dependencyMap/facade"
import { LegendDrawerComponent } from "../../features/legend/facade"
import {
    HANDED_OVER_MAP_NODE_ARRIVAL,
    MAP_EXPLORER_SEARCH,
    MAP_EXPLORER_SORT,
    MAP_EXPLORER_VIEW,
    MapExplorerRules,
    MapExplorerTree,
    ShowsHandedOverMapNodeDirective
} from "../../features/mapExplorer/facade"
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
import { DependencyExplorerCounts } from "./explorer/dependencyExplorerCounts"
import { DependencyExplorerRow } from "./explorer/dependencyExplorerRow"
import { DependencyExplorerSelection } from "./explorer/dependencyExplorerSelection"

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
        MapExplorerTree,
        { provide: EXPLORER_TREE, useExisting: MapExplorerTree },
        DependencyExplorerCounts,
        { provide: EXPLORER_COUNTS, useExisting: DependencyExplorerCounts },
        MapExplorerRules,
        { provide: EXPLORER_RULES, useExisting: MapExplorerRules },
        provideExplorerSort(MAP_EXPLORER_SORT),
        provideExplorerSearch(MAP_EXPLORER_SEARCH),
        { provide: MAP_EXPLORER_VIEW, useValue: "dependencies" },
        DependencyMapArrival,
        { provide: HANDED_OVER_MAP_NODE_ARRIVAL, useExisting: DependencyMapArrival },
        {
            provide: EXPLORER_CAPABILITIES,
            useValue: { showRules: true, showSearch: true, showCounts: true, canFlatten: false, modes: [FILES_EXPLORER_MODE] }
        },
        {
            provide: NODE_CONTEXT_MENU_CAPABILITIES,
            useValue: { focusableNodes: "folders", showMapActions: false, showExclude: true } satisfies NodeContextMenuCapabilities
        },
        provideViewScopedExplorerState("dependencies"),
        provideViewScopedCssVariables()
    ],
    hostDirectives: [ShowsHandedOverMapNodeDirective],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DependencyViewComponent {}
