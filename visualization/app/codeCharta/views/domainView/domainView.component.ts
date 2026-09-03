import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core"
import { BottomBarComponent } from "../../features/bottomBar/facade"
import { DomainBarComponent, DomainBarReadStore } from "../../features/domainBar/facade"
import { DomainToolboxComponent } from "../../features/domainToolbox/facade"
import { DomainWordMenuComponent } from "../../features/domainWordMenu/facade"
import { DOMAIN_WORD_OCCURRENCES_WIDTH_PX, DomainWordOccurrencesComponent } from "../../features/domainWordOccurrences/facade"
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
    EXPLORER_ROW,
    EXPLORER_SELECTION,
    EXPLORER_TREE,
    ExplorerCollapseService,
    ExplorerRevealService,
    ExplorerWidthService,
    provideExplorerSearch,
    provideExplorerSort,
    provideViewScopedExplorerState,
    SidebarExplorerComponent
} from "../../features/sidebarExplorer/facade"
import { SortingOption } from "../../model/codeCharta.model"
import { RightClickedWord, WordCloudComponent } from "../../renderer/wordCloud/wordCloud.facade"
import { CopyToClipboardService } from "../../util/copyToClipboard.service"
import { pathToNodeName } from "../../util/nodePathHelper"
import { DomainExplorerRow } from "./explorer/domainExplorerRow"
import { DOMAIN_EXPLORER_SEARCH } from "./explorer/domainExplorerSearch"
import { DomainExplorerSelection } from "./explorer/domainExplorerSelection"
import { DOMAIN_EXPLORER_SORT } from "./explorer/domainExplorerSort"
import { DomainExplorerTree } from "./explorer/domainExplorerTree"
import { ShowsHandedOverNodeDirective } from "./explorer/showsHandedOverNode.directive"
import { DomainSelectionStore } from "./stores/domainSelection.store"
import { DomainWordInspectionStore } from "./stores/domainWordInspection.store"

@Component({
    selector: "cc-domain-view",
    templateUrl: "./domainView.component.html",
    imports: [
        SidebarExplorerComponent,
        WordCloudComponent,
        DomainBarComponent,
        DomainToolboxComponent,
        DomainWordMenuComponent,
        NodeContextMenuComponent,
        DomainWordOccurrencesComponent,
        BottomBarComponent,
        LoadingFileProgressSpinnerComponent
    ],
    providers: [
        DomainExplorerRow,
        { provide: EXPLORER_ROW, useExisting: DomainExplorerRow },
        DomainExplorerSelection,
        { provide: EXPLORER_SELECTION, useExisting: DomainExplorerSelection },
        NodeContextMenuForExplorer,
        { provide: EXPLORER_CONTEXT_MENU, useExisting: NodeContextMenuForExplorer },
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
        {
            provide: NODE_CONTEXT_MENU_CAPABILITIES,
            useValue: { showMapActions: false, jumpTargetView: "metrics" } satisfies NodeContextMenuCapabilities
        },
        CopyToClipboardService,
        provideViewScopedExplorerState("domain"),
        provideViewScopedCssVariables()
    ],
    hostDirectives: [ShowsHandedOverNodeDirective],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DomainViewComponent {
    private readonly domainBarReadStore = inject(DomainBarReadStore)
    private readonly explorerWidthService = inject(ExplorerWidthService)
    private readonly explorerCollapseService = inject(ExplorerCollapseService)
    private readonly domainSelectionStore = inject(DomainSelectionStore)
    private readonly domainWordInspectionStore = inject(DomainWordInspectionStore)
    private readonly explorerRevealService = inject(ExplorerRevealService)
    private readonly clipboard = inject(CopyToClipboardService)

    readonly settings = this.domainBarReadStore.settings
    readonly copied = this.clipboard.copied

    readonly selectedNodePath = this.domainSelectionStore.selectedNodePath
    readonly selectedNodeName = computed(() => pathToNodeName(this.selectedNodePath(), ""))

    readonly cloudLeftInset = computed(() => (this.explorerCollapseService.isCollapsed() ? 0 : this.explorerWidthService.width()))

    readonly rightClickedWord = signal<RightClickedWord | null>(null)
    readonly inspectedWord = this.domainWordInspectionStore.inspectedWord
    readonly cloudRightInset = computed(() => (this.inspectedWord() ? DOMAIN_WORD_OCCURRENCES_WIDTH_PX : 0))

    inspectWord(word: string) {
        this.domainWordInspectionStore.inspect(word)
    }

    stopInspectingWord() {
        this.domainWordInspectionStore.clear()
    }

    closeWordMenu() {
        this.rightClickedWord.set(null)
    }

    revealNode(path: string) {
        this.explorerRevealService.revealNode(path)
    }

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
