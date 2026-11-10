import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from "@angular/core"
import { PackageRow } from "../../../../lenses/security/security.facade"
import { showHandedOverNodeOnArrival } from "../../../../routing/showHandedOverNodeOnArrival"
import { ViewReadinessStore } from "../../../../routing/viewReadiness.store"
import { filteredRows } from "../../services/packageFilter"
import { formatOptional, severityBadgeClass, shownPath } from "../../services/packageFormat"
import { SecurityReadStore } from "../../stores/security.read.store"
import { SecurityWriteStore } from "../../stores/security.write.store"

const ROWS_PER_PAGE = 200

@Component({
    selector: "cc-security-page",
    templateUrl: "./securityPage.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecurityPageComponent {
    private readonly readStore = inject(SecurityReadStore)
    private readonly writeStore = inject(SecurityWriteStore)

    readonly summary = this.readStore.summary
    readonly text = signal("")
    readonly onlyProblems = signal(false)
    readonly scopePath = signal<string | null>(null)
    readonly expandedKey = signal<string | null>(null)
    private readonly shownCount = signal(ROWS_PER_PAGE)

    readonly matchingRows = computed(() =>
        filteredRows(this.readStore.rows(), { text: this.text(), onlyProblems: this.onlyProblems(), scopePath: this.scopePath() })
    )
    readonly shownRows = computed(() => this.matchingRows().slice(0, this.shownCount()))
    readonly hiddenRowCount = computed(() => this.matchingRows().length - this.shownRows().length)

    readonly formatOptional = formatOptional
    readonly severityBadgeClass = severityBadgeClass
    readonly shownPath = shownPath

    constructor() {
        showHandedOverNodeOnArrival("security", nodePath => this.scopePath.set(nodePath))
        const viewReadinessStore = inject(ViewReadinessStore)
        effect(() => {
            this.readStore.rows()
            viewReadinessStore.markReady("security")
        })
    }

    toggle(row: PackageRow) {
        this.expandedKey.update(expanded => (expanded === row.key ? null : row.key))
    }

    showMore() {
        this.shownCount.update(count => count + ROWS_PER_PAGE)
    }

    showFileInMap(path: string) {
        this.writeStore.showFileInMap(path)
    }
}
