import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { DomainWord } from "../../../../model/codeCharta.model"
import { scrollRowIntoViewWhenRendered } from "../../../sidebarExplorer/facade"
import { DomainWordOccurrencesReadStore } from "../../stores/domainWordOccurrences.read.store"
import { matchingWords } from "../../util/matchingWords"
import { sortWords, WordSorting, WordSortingOption } from "../../util/sortWords"
import { DomainWordOccurrenceTreeComponent } from "../domainWordOccurrenceTree/domainWordOccurrenceTree.component"
import { DomainWordRowComponent, domainWordRowId } from "../domainWordRow/domainWordRow.component"

@Component({
    selector: "cc-domain-word-list",
    templateUrl: "./domainWordList.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [DomainWordRowComponent, DomainWordOccurrenceTreeComponent],
    host: { class: "block" }
})
export class DomainWordListComponent {
    private readonly readStore = inject(DomainWordOccurrencesReadStore)

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

    private readonly totalOccurrences = computed(() => this.projectWords().reduce((total, word) => total + word.frequency, 0))

    constructor() {
        effect(() => this.scrollTheExpandedWordIntoView())
    }

    protected isExpanded(word: DomainWord): boolean {
        return word.text === this.expandedWord()
    }

    protected shareOf(word: DomainWord): number {
        const totalOccurrences = this.totalOccurrences()
        return totalOccurrences > 0 ? word.frequency / totalOccurrences : 0
    }

    private scrollTheExpandedWordIntoView(): void {
        const expandedWord = this.expandedWord()
        if (expandedWord) {
            scrollRowIntoViewWhenRendered(domainWordRowId(expandedWord), () => this.expandedWord() === expandedWord)
        }
    }
}
