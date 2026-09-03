import { NgTemplateOutlet } from "@angular/common"
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from "@angular/core"
import { toObservable, toSignal } from "@angular/core/rxjs-interop"
import { switchMap } from "rxjs"
import { WordOccurrenceNode } from "../../../../lenses/domain/domainLens.facade"
import { DomainWordOccurrencesReadStore } from "../../stores/domainWordOccurrences.read.store"
import { DomainWordOccurrenceRowComponent } from "../domainWordOccurrenceRow/domainWordOccurrenceRow.component"

/** The word list scopes to the whole project, so a word's occurrences are counted from the root. */
const PROJECT_SCOPE = null

@Component({
    selector: "cc-domain-word-occurrence-tree",
    templateUrl: "./domainWordOccurrenceTree.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgTemplateOutlet, DomainWordOccurrenceRowComponent],
    host: { class: "block" }
})
export class DomainWordOccurrenceTreeComponent {
    private readonly readStore = inject(DomainWordOccurrencesReadStore)

    readonly word = input.required<string>()
    readonly selectedNodePath = input<string | null>(null)

    readonly nodeClicked = output<string>()

    private readonly occurrences = toSignal(
        toObservable(this.word).pipe(switchMap(word => this.readStore.occurrencesOf(word, PROJECT_SCOPE))),
        { initialValue: null as WordOccurrenceNode | null }
    )

    protected readonly topLevelOccurrences = computed(() => this.occurrences()?.children ?? [])

    private readonly expandedPaths = signal<ReadonlySet<string>>(new Set())

    protected isExpanded(path: string): boolean {
        return this.expandedPaths().has(path)
    }

    /** A row acts like a file-tree row: a folder opens or closes, and every node becomes the selection. */
    protected clickRow(occurrence: WordOccurrenceNode): void {
        if (occurrence.children.length > 0) {
            this.toggle(occurrence.path)
        }
        this.nodeClicked.emit(occurrence.path)
    }

    private toggle(path: string): void {
        const expandedPaths = new Set(this.expandedPaths())
        if (!expandedPaths.delete(path)) {
            expandedPaths.add(path)
        }
        this.expandedPaths.set(expandedPaths)
    }
}
