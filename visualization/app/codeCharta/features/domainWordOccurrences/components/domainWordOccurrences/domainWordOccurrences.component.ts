import { NgTemplateOutlet } from "@angular/common"
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from "@angular/core"
import { toObservable, toSignal } from "@angular/core/rxjs-interop"
import { switchMap } from "rxjs"
import { WordOccurrenceNode } from "../../../../lenses/domain/domainLens.facade"
import { fileRoot } from "../../../../util/fileRoot"
import { pathToNodeName } from "../../../../util/nodePathHelper"
import { DomainWordOccurrencesReadStore } from "../../stores/domainWordOccurrences.read.store"
import { DomainWordOccurrenceRowComponent } from "../domainWordOccurrenceRow/domainWordOccurrenceRow.component"

export const DOMAIN_WORD_OCCURRENCES_WIDTH_PX = 320

@Component({
    selector: "cc-domain-word-occurrences",
    templateUrl: "./domainWordOccurrences.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgTemplateOutlet, DomainWordOccurrenceRowComponent],
    host: {
        class: "fixed right-0 z-[60] flex flex-col overflow-hidden bg-base-100 shadow-[-2px_0_8px_-2px_rgba(0,0,0,0.15)]",
        "[style.width.px]": "widthPx",
        "[style.top]": "'var(--cc-bars-height, 49px)'",
        "[style.bottom]": "'var(--cc-bottom-bar-height, 32px)'"
    }
})
export class DomainWordOccurrencesComponent {
    private readonly readStore = inject(DomainWordOccurrencesReadStore)

    readonly word = input.required<string>()
    readonly scopePath = input<string | null>(null)

    readonly closed = output<void>()
    readonly revealNode = output<string>()

    protected readonly widthPx = DOMAIN_WORD_OCCURRENCES_WIDTH_PX

    private readonly occurrences = toSignal(
        toObservable(computed(() => ({ scopePath: this.scopePath(), word: this.word() }))).pipe(
            switchMap(({ scopePath, word }) => this.readStore.occurrencesOf(word, scopePath))
        ),
        { initialValue: null as WordOccurrenceNode | null }
    )

    protected readonly totalCount = computed(() => this.occurrences()?.count ?? 0)
    protected readonly topLevelOccurrences = computed(() => this.occurrences()?.children ?? [])
    protected readonly scopeName = computed(() => pathToNodeName(this.scopePath(), fileRoot.rootName))

    private readonly expandedPaths = signal<ReadonlySet<string>>(new Set())

    constructor() {
        effect(() => this.expandTheTopLevelOfANewlyInspectedWord())
    }

    protected isExpanded(path: string): boolean {
        return this.expandedPaths().has(path)
    }

    protected toggle(path: string): void {
        const expandedPaths = new Set(this.expandedPaths())
        if (!expandedPaths.delete(path)) {
            expandedPaths.add(path)
        }
        this.expandedPaths.set(expandedPaths)
    }

    private expandTheTopLevelOfANewlyInspectedWord(): void {
        this.expandedPaths.set(new Set(this.topLevelOccurrences().map(occurrence => occurrence.path)))
    }
}
