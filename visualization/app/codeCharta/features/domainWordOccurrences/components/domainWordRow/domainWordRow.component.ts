import { ChangeDetectionStrategy, Component, computed, input, output } from "@angular/core"
import { DomainWord } from "../../../../model/codeCharta.model"
import { formatCompactNumber } from "../../../../util/formatCompactNumber"
import { ExplorerRowComponent } from "../../../sidebarExplorer/facade"
import { formatShare } from "../../util/formatShare"

export const domainWordRowId = (word: string) => `domain-word-row-${word}`

@Component({
    selector: "cc-domain-word-row",
    templateUrl: "./domainWordRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ExplorerRowComponent],
    host: {
        class: "block",
        "[id]": "rowId()",
        "[attr.data-testid]": "rowId()",
        "[attr.aria-expanded]": "isExpanded()",
        "(click)": "toggled.emit()"
    }
})
export class DomainWordRowComponent {
    readonly word = input.required<DomainWord>()
    /** Part of all word occurrences in the project, stated like a metric explorer row's decoration. */
    readonly share = input(0)
    readonly isExpanded = input(false)

    readonly toggled = output<void>()

    protected readonly rowId = computed(() => domainWordRowId(this.word().text))
    protected readonly decoration = computed(() => `${formatShare(this.share())} / ${formatCompactNumber(this.word().frequency)}`)
}
