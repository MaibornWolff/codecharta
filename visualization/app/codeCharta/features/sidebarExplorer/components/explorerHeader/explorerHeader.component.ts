import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { EXPLORER_CAPABILITIES } from "../../explorerCapabilities"
import { ExplorerCounts } from "../../selectors/sidebarExplorer.selectors"
import { ExplorerCollapseService } from "../../services/explorerCollapse.service"
import { SidebarExplorerReadStore } from "../../stores/sidebarExplorer.read.store"
import { ExplorerCountChipComponent } from "../explorerCountChip/explorerCountChip.component"

const NO_COUNTS: ExplorerCounts = { shown: 0, flattened: 0, hidden: 0, noArea: 0 }

@Component({
    selector: "cc-explorer-header",
    templateUrl: "./explorerHeader.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ExplorerCountChipComponent]
})
export class ExplorerHeaderComponent {
    private readonly readStore = inject(SidebarExplorerReadStore)
    private readonly collapseService = inject(ExplorerCollapseService)

    readonly showCounts = inject(EXPLORER_CAPABILITIES).showCounts

    readonly counts = this.showCounts ? toSignal(this.readStore.counts$, { requireSync: true }) : signal(NO_COUNTS)

    readonly shown = computed(() => this.counts().shown)
    readonly flattened = computed(() => this.counts().flattened)
    readonly hidden = computed(() => this.counts().hidden)
    readonly noArea = computed(() => this.counts().noArea)
    readonly shownTooltip = computed(() => `${this.shown()} visible · ${this.noArea()} with no area in current metric`)

    collapse() {
        this.collapseService.toggle()
    }
}
