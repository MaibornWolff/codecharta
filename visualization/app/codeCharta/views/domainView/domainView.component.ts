import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { BottomBarComponent } from "../../features/bottomBar/facade"
import { DomainBarComponent, DomainBarReadStore } from "../../features/domainBar/facade"
import { DomainToolboxComponent } from "../../features/domainToolbox/facade"
import { DomainWordMenuComponent } from "../../features/domainWordMenu/facade"
import {
    DomainWordListComponent,
    HiddenWordsPopoverComponent,
    HiddenWordsReadStore,
    HiddenWordsWriteStore
} from "../../features/domainWordOccurrences/facade"
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
    EXPLORER_WORD_SEARCH,
    EXPLORER_WORD_SORT,
    ExplorerCollapseService,
    ExplorerCountChipComponent,
    ExplorerModeService,
    ExplorerWidthService,
    provideExplorerSearch,
    provideExplorerSort,
    provideViewScopedExplorerState,
    SidebarExplorerComponent
} from "../../features/sidebarExplorer/facade"
import { RightClickedWord, WordCloudComponent } from "../../renderer/wordCloud/wordCloud.facade"
import { CopyToClipboardService } from "../../util/copyToClipboard.service"
import { pathToNodeName } from "../../util/nodePathHelper"
import { DOMAIN_EXPLORER_MODES, WORDS_EXPLORER_MODE } from "./explorer/domainExplorerModes"
import { DomainExplorerRow } from "./explorer/domainExplorerRow"
import { DOMAIN_EXPLORER_SEARCH } from "./explorer/domainExplorerSearch"
import { DomainExplorerSelection } from "./explorer/domainExplorerSelection"
import { DOMAIN_EXPLORER_SORT } from "./explorer/domainExplorerSort"
import { DomainExplorerTree } from "./explorer/domainExplorerTree"
import { ShowsHandedOverNodeDirective } from "./explorer/showsHandedOverNode.directive"
import { DomainSelectionStore } from "./stores/domainSelection.store"
import { DomainWordInspectionStore } from "./stores/domainWordInspection.store"
import { DomainWordQueryStore } from "./stores/domainWordQuery.store"
import { DomainWordSortStore } from "./stores/domainWordSort.store"

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
        DomainWordListComponent,
        HiddenWordsPopoverComponent,
        ExplorerCountChipComponent,
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
                modes: DOMAIN_EXPLORER_MODES
            }
        },
        DomainWordQueryStore,
        { provide: EXPLORER_WORD_SEARCH, useExisting: DomainWordQueryStore },
        DomainWordSortStore,
        { provide: EXPLORER_WORD_SORT, useExisting: DomainWordSortStore },
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
    private readonly explorerModeService = inject(ExplorerModeService)
    private readonly domainSelectionStore = inject(DomainSelectionStore)
    private readonly domainWordInspectionStore = inject(DomainWordInspectionStore)
    private readonly domainWordQueryStore = inject(DomainWordQueryStore)
    private readonly domainWordSortStore = inject(DomainWordSortStore)
    private readonly hiddenWordsReadStore = inject(HiddenWordsReadStore)
    private readonly hiddenWordsWriteStore = inject(HiddenWordsWriteStore)
    private readonly clipboard = inject(CopyToClipboardService)

    readonly settings = this.domainBarReadStore.settings
    readonly copied = this.clipboard.copied

    readonly selectedNodePath = this.domainSelectionStore.selectedNodePath
    readonly selectedNodeName = computed(() => pathToNodeName(this.selectedNodePath(), ""))

    readonly cloudLeftInset = computed(() => (this.explorerCollapseService.isCollapsed() ? 0 : this.explorerWidthService.width()))

    readonly hiddenWordCount = computed(() => this.hiddenWordsReadStore.hiddenWords().length)
    readonly hiddenWordsTooltip = computed(() =>
        this.hiddenWordCount() === 0 ? "No word is hidden" : `${this.hiddenWordCount()} hidden from the cloud and the word list`
    )

    readonly rightClickedWord = signal<RightClickedWord | null>(null)
    readonly inspectedWord = this.domainWordInspectionStore.inspectedWord
    readonly wordQuery = toSignal(this.domainWordQueryStore.pattern$, { requireSync: true })
    readonly wordSorting = toSignal(this.domainWordSortStore.sorting$, { requireSync: true })

    /** Searching for the word narrows the list to it, which says why the list is short and needs no scrolling. */
    showWordOccurrences(word: string) {
        this.explorerModeService.activate(WORDS_EXPLORER_MODE.id)
        this.explorerCollapseService.expand()
        this.domainWordQueryStore.setPattern(word)
        this.domainWordInspectionStore.inspect(word)
    }

    toggleInspectedWord(word: string) {
        this.domainWordInspectionStore.toggle(word)
    }

    /** A hidden word leaves the cloud and the list alike, so an inspection of it would have nothing left
     * to point at. */
    hideWord(word: string) {
        if (this.inspectedWord() === word) {
            this.domainWordInspectionStore.toggle(word)
        }
        this.hiddenWordsWriteStore.hide(word)
    }

    closeWordMenu() {
        this.rightClickedWord.set(null)
    }

    selectNode(path: string) {
        this.domainSelectionStore.select(path)
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
