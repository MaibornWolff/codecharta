import { ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core"
import { WordOccurrenceNode } from "../../../../lenses/domain/domainLens.facade"
import { formatShare } from "../../util/formatShare"

const INDENT_PER_DEPTH_PX = 12

@Component({
    selector: "cc-domain-word-occurrence-row",
    templateUrl: "./domainWordOccurrenceRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "block" }
})
export class DomainWordOccurrenceRowComponent {
    readonly node = input.required<WordOccurrenceNode>()
    readonly depth = input(0)
    readonly isExpanded = input(false)

    readonly toggled = output<void>()
    readonly revealed = output<void>()

    protected readonly indentPx = computed(() => this.depth() * INDENT_PER_DEPTH_PX)
    protected readonly sharePercentage = computed(() => formatShare(this.node().share))
    protected readonly shareBarWidth = computed(() => `${this.node().share * 100}%`)
    protected readonly isExpandable = computed(() => this.node().children.length > 0)
}
