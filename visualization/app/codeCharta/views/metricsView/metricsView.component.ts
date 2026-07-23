import { ChangeDetectionStrategy, Component } from "@angular/core"
import { BottomBarComponent } from "../../features/bottomBar/facade"
import { CodeMapComponent } from "../../features/codeMap/facade"
import { FileExtensionBarComponent } from "../../features/fileExtensionBar/facade"
import { LegendPanelComponent } from "../../features/legend/facade"
import { MetricsBarComponent } from "../../features/metricsBar/facade"
import { NodeContextMenuComponent } from "../../features/nodeContextMenu/facade"
import { LoadingFileProgressSpinnerComponent } from "../../features/shared/facade"
import {
    DEFAULT_EXPLORER_CAPABILITIES,
    EXPLORER_CAPABILITIES,
    EXPLORER_CONTEXT_MENU,
    EXPLORER_ROW,
    EXPLORER_SELECTION,
    EXPLORER_SORT,
    ExplorerSearchBarComponent,
    SidebarExplorerComponent
} from "../../features/sidebarExplorer/facade"
import { SidebarInspectorComponent } from "../../features/sidebarInspector/facade"
import { MetricsExplorerContextMenu } from "./explorer/metricsExplorerContextMenu"
import { MetricsExplorerRow } from "./explorer/metricsExplorerRow"
import { MetricsExplorerSelection } from "./explorer/metricsExplorerSelection"
import { MetricsExplorerSort } from "./explorer/metricsExplorerSort"

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
        { provide: EXPLORER_CAPABILITIES, useValue: DEFAULT_EXPLORER_CAPABILITIES }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricsViewComponent {}
