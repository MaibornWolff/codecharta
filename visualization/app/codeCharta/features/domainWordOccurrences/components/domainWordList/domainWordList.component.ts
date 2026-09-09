import { ChangeDetectionStrategy, Component, computed, ElementRef, effect, inject, input, OnDestroy, output } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { DomainWord } from "../../../../model/codeCharta.model"
import { ExplorerScrollHostService } from "../../../sidebarExplorer/facade"
import { DomainWordOccurrencesReadStore } from "../../stores/domainWordOccurrences.read.store"
import { matchingWords } from "../../util/matchingWords"
import { sortWords, WordSorting, WordSortingOption } from "../../util/sortWords"
import { wordListWindow } from "../../util/wordListWindow"
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

    /** The opened word is lifted out of the rows into the pin above them, so it is never listed twice. */
    protected readonly pinnedWord = computed(() => this.projectWords().find(word => word.text === this.expandedWord()) ?? null)

    private readonly matchedWords = computed(() => matchingWords(this.projectWords(), this.query()))

    protected readonly visibleWords = computed(() =>
        sortWords(
            this.matchedWords().filter(word => word.text !== this.expandedWord()),
            this.sorting()
        )
    )

    /** The hint answers for the search, so a search whose only match is pinned has nothing to explain. */
    protected readonly emptyHint = computed(() => {
        if (this.projectWords().length === 0) {
            return "This project carries no words."
        }
        return this.matchedWords().length === 0 ? `No word contains "${this.query().trim()}".` : null
    })

    private readonly geometry = computed(() => ({
        ...this.viewport.geometry(),
        rowCount: this.visibleWords().length
    }))

    /** A project can carry thousands of words, so only the slice on screen is rendered. */
    protected readonly window = computed(() => wordListWindow(this.geometry()))

    protected readonly renderedWords = computed(() => {
        const { firstIndex, lastIndex } = this.window()
        return this.visibleWords().slice(firstIndex, lastIndex + 1)
    })

    private readonly totalOccurrences = computed(() => this.projectWords().reduce((total, word) => total + word.frequency, 0))

    constructor() {
        effect(() => this.viewport.attachTo(this.hostElement.nativeElement, this.scrollHostService.element()))
    }

    ngOnDestroy(): void {
        this.viewport.dispose()
    }

    protected shareOf(word: DomainWord): number {
        const totalOccurrences = this.totalOccurrences()
        return totalOccurrences > 0 ? word.frequency / totalOccurrences : 0
    }
}
