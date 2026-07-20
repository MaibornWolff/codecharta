import { ChangeDetectionStrategy, Component } from "@angular/core"
import { BottomBarComponent } from "../../features/bottomBar/facade"
import { CodeMapComponent } from "../../features/codeMap/facade"
import { FileExtensionBarComponent } from "../../features/fileExtensionBar/facade"
import { LegendPanelComponent } from "../../features/legend/facade"
import { MetricsBarComponent } from "../../features/metricsBar/facade"
import { NodeContextMenuComponent } from "../../features/nodeContextMenu/facade"
import { LoadingFileProgressSpinnerComponent } from "../../features/shared/facade"
import { EXPLORER_HOST, SidebarExplorerComponent } from "../../features/sidebarExplorer/facade"
import { SidebarInspectorComponent } from "../../features/sidebarInspector/facade"
import { MetricsExplorerHost } from "./explorerHost/metricsExplorerHost"

/**
 * The metrics (3D treemap) view — the default route. Owns the map, its inspector/legend/context menu and
 * the metricsBar, plus the file-extension and bottom bars. The explorer keeps its full controls (rules +
 * search). The shell owns loadOnBoot, the nav bar and the global dialogs.
 */
@Component({
    selector: "cc-metrics-view",
    templateUrl: "./metricsView.component.html",
    imports: [
        FileExtensionBarComponent,
        MetricsBarComponent,
        NodeContextMenuComponent,
        SidebarExplorerComponent,
        SidebarInspectorComponent,
        CodeMapComponent,
        LegendPanelComponent,
        BottomBarComponent,
        LoadingFileProgressSpinnerComponent
    ],
    providers: [MetricsExplorerHost, { provide: EXPLORER_HOST, useExisting: MetricsExplorerHost }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricsViewComponent {}
