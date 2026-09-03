import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    effect,
    inject,
    input,
    OnDestroy,
    output
} from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { DomainWord } from "../../../../model/codeCharta.model"
import { ExplorerScrollHostService } from "../../../sidebarExplorer/facade"
import { DomainWordOccurrencesReadStore } from "../../stores/domainWordOccurrences.read.store"
import { matchingWords } from "../../util/matchingWords"
import { sortWords, WordSorting, WordSortingOption } from "../../util/sortWords"
import { isRowOnScreen, offsetThatCentres, wordListWindow } from "../../util/wordListWindow"
import { DomainWordOccurrenceTreeComponent } from "../domainWordOccurrenceTree/domainWordOccurrenceTree.component"
import { DomainWordRowComponent } from "../domainWordRow/domainWordRow.component"
import { WordListViewport } from "./wordListViewport"

@Component({
    selector: "cc-domain-word-list",
    templateUrl: "./domainWordList.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DomainWordRowComponent, DomainWordOccurrenceTreeComponent],
    host: { class: "block" }
})
export class DomainWordListComponent implements OnDestroy {
    private readonly readStore = inject(DomainWordOccurrencesReadStore)
    private readonly hostElement = inject<ElementRef<HTMLElement>>(ElementRef)
    private readonly scrollHostService = inject(ExplorerScrollHostService)
    private readonly viewport = new WordListViewport()

    readonly query = input("")
    readonly sorting = input<WordSorting>({ option: WordSortingOption.OCCURRENCES, ascending: false })
    readonly expandedWord = input<string | null>(null)
    readonly selectedNodePath = input<string | null>(null)

    readonly wordToggled = output<string>()
    readonly nodeClicked = output<string>()

    private readonly projectWords = toSignal(this.readStore.projectWords$, { requireSync: true })

    protected readonly visibleWords = computed(() => sortWords(matchingWords(this.projectWords(), this.query()), this.sorting()))
    protected readonly emptyHint = computed(() =>
        this.projectWords().length === 0 ? "This project carries no words." : `No word contains "${this.query().trim()}".`
    )

    private readonly expandedIndex = computed(() => this.visibleWords().findIndex(word => word.text === this.expandedWord()))

    private readonly geometry = computed(() => ({
        ...this.viewport.geometry(),
        rowCount: this.visibleWords().length,
        expandedIndex: this.expandedIndex()
    }))

    /** A project can carry thousands of words, so only the slice on screen is rendered. */
    protected readonly window = computed(() => wordListWindow(this.geometry()))

    protected readonly renderedWords = computed(() => {
        const { firstIndex, lastIndex } = this.window()
        return this.visibleWords().slice(firstIndex, lastIndex + 1)
    })

    private lastWordScrolledTo: string | null = null

    private readonly totalOccurrences = computed(() => this.projectWords().reduce((total, word) => total + word.frequency, 0))

    constructor() {
        effect(() => this.viewport.attachTo(this.hostElement.nativeElement, this.scrollHostService.element()))
        effect(() => this.viewport.trackOpenBreakdown(this.expandedWord()))
        effect(() => this.scrollTheExpandedWordIntoView())
    }

    ngOnDestroy(): void {
        this.viewport.dispose()
    }

    protected isExpanded(word: DomainWord): boolean {
        return word.text === this.expandedWord()
    }

    protected shareOf(word: DomainWord): number {
        const totalOccurrences = this.totalOccurrences()
        return totalOccurrences > 0 ? word.frequency / totalOccurrences : 0
    }

    /**
     * Brings a newly expanded word into view. A row outside the rendered slice has no element to scroll to,
     * so the list is scrolled by geometry. Only a *newly* expanded word is followed: reacting to the
     * geometry itself would drag the list back every time the reader scrolled the open word out of sight.
     */
    private scrollTheExpandedWordIntoView(): void {
        const expandedWord = this.expandedWord()
        const geometry = this.geometry()
        if (expandedWord === null) {
            this.lastWordScrolledTo = null
            return
        }
        // Nothing can be scrolled to before the panel has been measured; this runs again once it is.
        if (expandedWord === this.lastWordScrolledTo || geometry.viewportHeight === 0) {
            return
        }
        const expandedIndex = this.expandedIndex()
        if (expandedIndex < 0) {
            return
        }
        this.lastWordScrolledTo = expandedWord
        if (!isRowOnScreen(expandedIndex, geometry)) {
            this.viewport.scrollTo(offsetThatCentres(expandedIndex, geometry))
        }
    }
}
