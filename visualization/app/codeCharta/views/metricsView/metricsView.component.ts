import { ChangeDetectionStrategy, Component } from "@angular/core"
import { BottomBarComponent } from "../../features/bottomBar/facade"
import { CodeMapComponent } from "../../features/codeMap/facade"
import { FileExtensionBarComponent } from "../../features/fileExtensionBar/facade"
import { LegendPanelComponent } from "../../features/legend/facade"
import { MetricsBarComponent } from "../../features/metricsBar/facade"
import { NodeContextMenuComponent } from "../../features/nodeContextMenu/facade"
import { LoadingFileProgressSpinnerComponent } from "../../features/shared/facade"
import {
    EXPLORER_CAPABILITIES,
    EXPLORER_CONTEXT_MENU,
    EXPLORER_ROW,
    EXPLORER_SELECTION,
    EXPLORER_SORT,
    ExplorerSearchBarComponent,
    SidebarExplorerComponent
} from "../../features/sidebarExplorer/facade"
import { SidebarInspectorComponent } from "../../features/sidebarInspector/facade"
import { SortingOption } from "../../model/codeCharta.model"
import { MetricsExplorerContextMenu } from "./explorer/metricsExplorerContextMenu"
import { MetricsExplorerRow } from "./explorer/metricsExplorerRow"
import { MetricsExplorerSelection } from "./explorer/metricsExplorerSelection"
import { MetricsExplorerSort } from "./explorer/metricsExplorerSort"

/**
 * The metrics (3D treemap) view — the default route. Owns the map, its inspector/legend/context menu and
 * the metricsBar, plus the file-extension and bottom bars. The explorer keeps its full controls (rules +
 * search) and gets the map reading of a row: selection drives the 3D scene, hovering shows the metric
 * tooltip, and right-click opens the node-context menu. The shell owns loadOnBoot, the nav bar and the
 * global dialogs.
 */
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
        MetricsExplorerSort,
        { provide: EXPLORER_SORT, useExisting: MetricsExplorerSort },
        {
            provide: EXPLORER_CAPABILITIES,
            useValue: { showRules: true, showSearch: true, showCounts: true, sortOptions: Object.values(SortingOption) }
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricsViewComponent {}
