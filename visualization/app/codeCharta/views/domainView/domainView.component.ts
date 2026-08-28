import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { BottomBarComponent } from "../../features/bottomBar/facade"
import { DomainBarComponent, DomainBarReadStore } from "../../features/domainBar/facade"
import { DomainToolboxComponent } from "../../features/domainToolbox/facade"
import { LoadingFileProgressSpinnerComponent, provideViewScopedCssVariables } from "../../features/shared/facade"
import {
    EXPLORER_CAPABILITIES,
    EXPLORER_ROW,
    EXPLORER_SELECTION,
    EXPLORER_TREE,
    ExplorerCollapseService,
    ExplorerWidthService,
    provideExplorerSearch,
    provideExplorerSort,
    provideViewScopedExplorerState,
    SidebarExplorerComponent
} from "../../features/sidebarExplorer/facade"
import { SortingOption } from "../../model/codeCharta.model"
import { WordCloudComponent } from "../../renderer/wordCloud/wordCloud.facade"
import { CopyToClipboardService } from "../../util/copyToClipboard.service"
import { pathToNodeName } from "../../util/nodePathHelper"
import { DomainExplorerRow } from "./explorer/domainExplorerRow"
import { DOMAIN_EXPLORER_SEARCH } from "./explorer/domainExplorerSearch"
import { DomainExplorerSelection } from "./explorer/domainExplorerSelection"
import { DOMAIN_EXPLORER_SORT } from "./explorer/domainExplorerSort"
import { DomainExplorerTree } from "./explorer/domainExplorerTree"
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
        DomainExplorerTree,
        { provide: EXPLORER_TREE, useExisting: DomainExplorerTree },
        provideExplorerSort(DOMAIN_EXPLORER_SORT),
        provideExplorerSearch(DOMAIN_EXPLORER_SEARCH),
        {
            provide: EXPLORER_CAPABILITIES,
            useValue: {
                showRules: false,
                showSearch: true,
                showCounts: false,
                sortOptions: [SortingOption.NAME, SortingOption.NUMBER_OF_FILES]
            }
        },
        CopyToClipboardService,
        provideViewScopedExplorerState("domain"),
        provideViewScopedCssVariables()
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
