import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { BottomBarComponent } from "../../features/bottomBar/facade"
import { DomainBarComponent, DomainBarReadStore } from "../../features/domainBar/facade"
import { LoadingFileProgressSpinnerComponent } from "../../features/shared/facade"
import {
    EXPLORER_HOST,
    ExplorerCollapseService,
    ExplorerWidthService,
    SidebarExplorerComponent
} from "../../features/sidebarExplorer/facade"
import { WordCloudComponent } from "../../renderer/wordCloud/wordCloud.facade"
import { DomainExplorerHost } from "./explorerHost/domainExplorerHost"

/**
 * The domain (word-cloud) view — the `domain` route. Reuses the explorer, supplying the domain reading of
 * a row (see DomainExplorerHost) so no map semantics leak in, the map's bottom bar (showing the selected
 * node's path, since there is no map to hover), and pairs the word-cloud renderer with its floating
 * settings bar. No inspector, metricsBar, legend, distribution, compare or 3d-print.
 */
@Component({
    selector: "cc-domain-view",
    templateUrl: "./domainView.component.html",
    imports: [SidebarExplorerComponent, WordCloudComponent, DomainBarComponent, BottomBarComponent, LoadingFileProgressSpinnerComponent],
    providers: [DomainExplorerHost, { provide: EXPLORER_HOST, useExisting: DomainExplorerHost }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DomainViewComponent {
    private readonly domainBarReadStore = inject(DomainBarReadStore)
    private readonly explorerWidthService = inject(ExplorerWidthService)
    private readonly explorerCollapseService = inject(ExplorerCollapseService)

    readonly settings = this.domainBarReadStore.settings

    /**
     * Unlike the 3D map the cloud can neither be panned nor zoomed, so whatever the explorer covers is
     * unrecoverable. Keeping the cloud container flush with the explorer's right edge both avoids the
     * overlap and — because the container genuinely changes size — makes the cloud's ResizeObserver fire,
     * re-laying the words out into the visible region. A collapsed explorer is a short bar rather than a
     * full-height panel, so it claims no inset.
     */
    readonly cloudLeftInset = computed(() => (this.explorerCollapseService.isCollapsed() ? 0 : this.explorerWidthService.width()))
}
