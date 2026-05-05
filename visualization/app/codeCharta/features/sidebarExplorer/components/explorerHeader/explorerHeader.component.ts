import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { ExplorerCollapseService } from "../../services/explorerCollapse.service"
import { ExplorerCountsService } from "../../services/explorerCounts.service"
import { ExplorerCountChipComponent } from "../explorerCountChip/explorerCountChip.component"

@Component({
    selector: "cc-explorer-header",
    templateUrl: "./explorerHeader.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ExplorerCountChipComponent]
})
export class ExplorerHeaderComponent {
    private readonly countsService = inject(ExplorerCountsService)
    private readonly collapseService = inject(ExplorerCollapseService)

    readonly counts = toSignal(this.countsService.counts$, { requireSync: true })

    readonly shown = computed(() => this.counts().shown)
    readonly flattened = computed(() => this.counts().flattened)
    readonly hidden = computed(() => this.counts().hidden)
    readonly noArea = computed(() => this.counts().noArea)
    readonly shownTooltip = computed(() => `${this.shown()} visible · ${this.noArea()} with no area in current metric`)

    collapse() {
        this.collapseService.toggle()
    }
}
