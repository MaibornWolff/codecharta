import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { EXPLORER_CAPABILITIES } from "../../explorerCapabilities"
import { EXPLORER_COUNTS, ExplorerCounts } from "../../explorerCounts.port"
import { ExplorerCollapseService } from "../../services/explorerCollapse.service"
import { ExplorerCountChipComponent } from "../explorerCountChip/explorerCountChip.component"
import { ExplorerModeToggleComponent } from "../explorerModeToggle/explorerModeToggle.component"

const NO_COUNTS: ExplorerCounts = { shown: 0, flattened: 0, hidden: 0, noArea: 0 }

@Component({
    selector: "cc-explorer-header",
    templateUrl: "./explorerHeader.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ExplorerCountChipComponent, ExplorerModeToggleComponent]
})
export class ExplorerHeaderComponent {
    private readonly collapseService = inject(ExplorerCollapseService)

    private readonly capabilities = inject(EXPLORER_CAPABILITIES)

    readonly showCounts = this.capabilities.showCounts
    readonly showModeToggle = this.capabilities.modes.length > 1

    private readonly countsSource = this.showCounts ? inject(EXPLORER_COUNTS) : null

    readonly counts = this.countsSource ? toSignal(this.countsSource.counts$, { requireSync: true }) : signal(NO_COUNTS)

    readonly shown = computed(() => this.counts().shown)
    readonly flattened = computed(() => this.counts().flattened)
    readonly hidden = computed(() => this.counts().hidden)
    readonly noArea = computed(() => this.counts().noArea)
    readonly shownTooltip = computed(() => `${this.shown()} visible · ${this.noArea()} with no area in current metric`)

    collapse() {
        this.collapseService.toggle()
    }
}
