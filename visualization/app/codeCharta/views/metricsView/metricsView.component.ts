import { ChangeDetectionStrategy, Component } from "@angular/core"
import { BottomBarComponent } from "../../features/bottomBar/facade"
import { CodeMapComponent } from "../../features/codeMap/facade"
import { FileExtensionBarComponent } from "../../features/fileExtensionBar/facade"
import { LegendPanelComponent } from "../../features/legend/facade"
import {
    HANDED_OVER_MAP_NODE_ARRIVAL,
    LeavesFocusForNodeOutsideIt,
    MAP_EXPLORER_SEARCH,
    MAP_EXPLORER_SORT,
    MAP_EXPLORER_VIEW,
    MapExplorerRules,
    MapExplorerTree,
    ShowsHandedOverMapNodeDirective
} from "../../features/mapExplorer/facade"
import { MapToolsComponent } from "../../features/mapTools/facade"
import { MetricsBarComponent } from "../../features/metricsBar/facade"
import {
    DEFAULT_NODE_CONTEXT_MENU_CAPABILITIES,
    NODE_CONTEXT_MENU_CAPABILITIES,
    NodeContextMenuComponent
} from "../../features/nodeContextMenu/facade"
import { RadialMapComponent, RadialMapToolsComponent } from "../../features/radialMap/facade"
import {
    injectIsRadialLayout,
    LoadingFileProgressSpinnerComponent,
    provideViewScopedCssVariables,
    SharedFocusStore
} from "../../features/shared/facade"
import {
    DEFAULT_EXPLORER_CAPABILITIES,
    EXPLORER_CAPABILITIES,
    EXPLORER_CONTEXT_MENU,
    EXPLORER_COUNTS,
    EXPLORER_FOCUS,
    EXPLORER_METRIC_RULES,
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
import { MetricsExplorerMetricRules } from "./explorer/metricsExplorerMetricRules"
import { MetricsExplorerRow } from "./explorer/metricsExplorerRow"
import { MetricsExplorerSelection } from "./explorer/metricsExplorerSelection"
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
        LoadingFileProgressSpinnerComponent,
        MapToolsComponent,
        RadialMapComponent,
        RadialMapToolsComponent
    ],
    providers: [
        MetricsExplorerRow,
        { provide: EXPLORER_ROW, useExisting: MetricsExplorerRow },
        MetricsExplorerSelection,
        { provide: EXPLORER_SELECTION, useExisting: MetricsExplorerSelection },
        MetricsExplorerContextMenu,
        { provide: EXPLORER_CONTEXT_MENU, useExisting: MetricsExplorerContextMenu },
        MapExplorerTree,
        { provide: EXPLORER_TREE, useExisting: MapExplorerTree },
        MetricsExplorerCounts,
        { provide: EXPLORER_COUNTS, useExisting: MetricsExplorerCounts },
        MapExplorerRules,
        { provide: EXPLORER_RULES, useExisting: MapExplorerRules },
        MetricsExplorerMetricRules,
        { provide: EXPLORER_METRIC_RULES, useExisting: MetricsExplorerMetricRules },
        { provide: EXPLORER_FOCUS, useExisting: SharedFocusStore },
        provideExplorerSort(MAP_EXPLORER_SORT),
        provideExplorerSearch(MAP_EXPLORER_SEARCH),
        { provide: MAP_EXPLORER_VIEW, useValue: "metrics" },
        LeavesFocusForNodeOutsideIt,
        { provide: HANDED_OVER_MAP_NODE_ARRIVAL, useExisting: LeavesFocusForNodeOutsideIt },
        { provide: EXPLORER_CAPABILITIES, useValue: DEFAULT_EXPLORER_CAPABILITIES },
        { provide: NODE_CONTEXT_MENU_CAPABILITIES, useValue: DEFAULT_NODE_CONTEXT_MENU_CAPABILITIES },
        provideViewScopedExplorerState("metrics"),
        provideViewScopedCssVariables()
    ],
    hostDirectives: [RevealsSelectedNodeAfterLoadDirective, ShowsHandedOverMapNodeDirective],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricsViewComponent {
    protected readonly isRadialLayout = injectIsRadialLayout()
}
