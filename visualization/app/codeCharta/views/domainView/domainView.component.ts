import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { BottomBarComponent } from "../../features/bottomBar/facade"
import { DomainBarComponent, DomainBarReadStore } from "../../features/domainBar/facade"
import { LoadingFileProgressSpinnerComponent } from "../../features/shared/facade"
import {
    EXPLORER_CAPABILITIES,
    EXPLORER_ROW,
    EXPLORER_SELECTION,
    EXPLORER_SORT,
    ExplorerCollapseService,
    ExplorerWidthService,
    SidebarExplorerComponent
} from "../../features/sidebarExplorer/facade"
import { SortingOption } from "../../model/codeCharta.model"
import { WordCloudComponent } from "../../renderer/wordCloud/wordCloud.facade"
import { CopyToClipboardService } from "../../util/copyToClipboard.service"
import { pathToNodeName } from "../../util/nodePathHelper"
import { DomainExplorerRow } from "./explorer/domainExplorerRow"
import { DomainExplorerSelection } from "./explorer/domainExplorerSelection"
import { DomainExplorerSort } from "./explorer/domainExplorerSort"
import { DomainSelectionStore } from "./stores/domainSelection.store"

/**
 * The domain (word-cloud) view — the `domain` route. Reuses the explorer, supplying the domain reading of a
 * row (every row selectable, no map semantics) and driving selection through its own ephemeral
 * DomainSelectionStore rather than the global sharedView. Pairs the word-cloud renderer with its floating
 * settings bar and reuses the bottom bar, fed that same local selection since there is no map to hover.
 * No inspector, metricsBar, legend, distribution, compare or 3d-print — and no explorer context menu.
 */
@Component({
    selector: "cc-domain-view",
    templateUrl: "./domainView.component.html",
    imports: [SidebarExplorerComponent, WordCloudComponent, DomainBarComponent, BottomBarComponent, LoadingFileProgressSpinnerComponent],
    providers: [
        DomainExplorerRow,
        { provide: EXPLORER_ROW, useExisting: DomainExplorerRow },
        DomainExplorerSelection,
        { provide: EXPLORER_SELECTION, useExisting: DomainExplorerSelection },
        DomainExplorerSort,
        { provide: EXPLORER_SORT, useExisting: DomainExplorerSort },
        {
            provide: EXPLORER_CAPABILITIES,
            // No area metric here, so Area Size is dropped; Name + Number of Files still order the file tree.
            useValue: {
                showRules: false,
                showSearch: false,
                showCounts: false,
                sortOptions: [SortingOption.NAME, SortingOption.NUMBER_OF_FILES]
            }
        },
        CopyToClipboardService
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DomainViewComponent {
    private readonly domainBarReadStore = inject(DomainBarReadStore)
    private readonly explorerWidthService = inject(ExplorerWidthService)
    private readonly explorerCollapseService = inject(ExplorerCollapseService)
    private readonly domainSelectionStore = inject(DomainSelectionStore)
    private readonly clipboard = inject(CopyToClipboardService)

    readonly settings = this.domainBarReadStore.settings
    readonly copied = this.clipboard.copied

    // The domain view owns its selection; collapsed the explorer names it, and the bottom bar echoes it.
    readonly selectedNodePath = this.domainSelectionStore.selectedNodePath
    readonly selectedNodeName = computed(() => pathToNodeName(this.selectedNodePath(), ""))

    /**
     * Unlike the 3D map the cloud can neither be panned nor zoomed, so whatever the explorer covers is
     * unrecoverable. Keeping the cloud container flush with the explorer's right edge both avoids the
     * overlap and — because the container genuinely changes size — makes the cloud's ResizeObserver fire,
     * re-laying the words out into the visible region. A collapsed explorer is a short bar rather than a
     * full-height panel, so it claims no inset.
     */
    readonly cloudLeftInset = computed(() => (this.explorerCollapseService.isCollapsed() ? 0 : this.explorerWidthService.width()))

    clearSelection() {
        this.domainSelectionStore.clear()
    }

    async copySelectedPath() {
        const path = this.selectedNodePath()
        if (path) {
            await this.clipboard.copy(path)
        }
    }
}
