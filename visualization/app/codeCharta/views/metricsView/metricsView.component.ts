import { ChangeDetectionStrategy, Component } from "@angular/core"
import { BottomBarComponent } from "../../features/bottomBar/facade"
import { CodeMapComponent } from "../../features/codeMap/facade"
import { FileExtensionBarComponent } from "../../features/fileExtensionBar/facade"
import { LegendPanelComponent } from "../../features/legend/facade"
import { MetricsBarComponent } from "../../features/metricsBar/facade"
import {
    DEFAULT_NODE_CONTEXT_MENU_CAPABILITIES,
    NODE_CONTEXT_MENU_CAPABILITIES,
    NodeContextMenuComponent
} from "../../features/nodeContextMenu/facade"
import { LoadingFileProgressSpinnerComponent, provideViewScopedCssVariables } from "../../features/shared/facade"
import {
    DEFAULT_EXPLORER_CAPABILITIES,
    EXPLORER_CAPABILITIES,
    EXPLORER_CONTEXT_MENU,
    EXPLORER_COUNTS,
    EXPLORER_ROW,
    EXPLORER_RULES,
    EXPLORER_SELECTION,
    EXPLORER_TREE,
    ExplorerSearchBarComponent,
    provideExplorerSearch,
    provideExplorerSort,
    provideViewScopedExplorerState,
    SidebarExplorerComponent
} from "../../features/sidebarExplorer/facade"
import { SidebarInspectorComponent } from "../../features/sidebarInspector/facade"
import { MetricsExplorerContextMenu } from "./explorer/metricsExplorerContextMenu"
import { MetricsExplorerCounts } from "./explorer/metricsExplorerCounts"
import { MetricsExplorerRow } from "./explorer/metricsExplorerRow"
import { MetricsExplorerRules } from "./explorer/metricsExplorerRules"
import { METRICS_EXPLORER_SEARCH } from "./explorer/metricsExplorerSearch"
import { MetricsExplorerSelection } from "./explorer/metricsExplorerSelection"
import { METRICS_EXPLORER_SORT } from "./explorer/metricsExplorerSort"
import { MetricsExplorerTree } from "./explorer/metricsExplorerTree"
import { RevealsSelectedNodeAfterLoadDirective } from "./explorer/revealsSelectedNodeAfterLoad.directive"

@Component({
    selector: "cc-metrics-view",
    templateUrl: "./metricsView.component.html",
    imports: [
        FileExtensionBarComponent,
        MetricsBarComponent,
        NodeContextMenuComponent,
        SidebarExplorerComponent,
        ExplorerSearchBarComponent,
        SidebarInspectorComponent,
        CodeMapComponent,
        LegendPanelComponent,
        BottomBarComponent,
        LoadingFileProgressSpinnerComponent
    ],
    providers: [
        MetricsExplorerRow,
        { provide: EXPLORER_ROW, useExisting: MetricsExplorerRow },
        MetricsExplorerSelection,
        { provide: EXPLORER_SELECTION, useExisting: MetricsExplorerSelection },
        MetricsExplorerContextMenu,
        { provide: EXPLORER_CONTEXT_MENU, useExisting: MetricsExplorerContextMenu },
        MetricsExplorerTree,
        { provide: EXPLORER_TREE, useExisting: MetricsExplorerTree },
        MetricsExplorerCounts,
        { provide: EXPLORER_COUNTS, useExisting: MetricsExplorerCounts },
        MetricsExplorerRules,
        { provide: EXPLORER_RULES, useExisting: MetricsExplorerRules },
        provideExplorerSort(METRICS_EXPLORER_SORT),
        provideExplorerSearch(METRICS_EXPLORER_SEARCH),
        { provide: EXPLORER_CAPABILITIES, useValue: DEFAULT_EXPLORER_CAPABILITIES },
        { provide: NODE_CONTEXT_MENU_CAPABILITIES, useValue: DEFAULT_NODE_CONTEXT_MENU_CAPABILITIES },
        provideViewScopedExplorerState("metrics"),
        provideViewScopedCssVariables()
    ],
    hostDirectives: [RevealsSelectedNodeAfterLoadDirective],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricsViewComponent {}
