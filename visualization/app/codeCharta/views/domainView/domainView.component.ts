import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { BottomBarComponent } from "../../features/bottomBar/facade"
import { DomainBarComponent, DomainBarReadStore } from "../../features/domainBar/facade"
import { DomainToolboxComponent } from "../../features/domainToolbox/facade"
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

@Component({
    selector: "cc-domain-view",
    templateUrl: "./domainView.component.html",
    imports: [
        SidebarExplorerComponent,
        WordCloudComponent,
        DomainBarComponent,
        DomainToolboxComponent,
        BottomBarComponent,
        LoadingFileProgressSpinnerComponent
    ],
    providers: [
        DomainExplorerRow,
        { provide: EXPLORER_ROW, useExisting: DomainExplorerRow },
        DomainExplorerSelection,
        { provide: EXPLORER_SELECTION, useExisting: DomainExplorerSelection },
        DomainExplorerSort,
        { provide: EXPLORER_SORT, useExisting: DomainExplorerSort },
        {
            provide: EXPLORER_CAPABILITIES,
            useValue: {
                showRules: false,
                showSearch: false,
                showFind: true,
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

    readonly selectedNodePath = this.domainSelectionStore.selectedNodePath
    readonly selectedNodeName = computed(() => pathToNodeName(this.selectedNodePath(), ""))

    // The cloud can neither be panned nor zoomed, so whatever the explorer covers is unrecoverable.
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
