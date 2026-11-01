import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { formatClusterShare, showsRealNames } from "../../../../lenses/clusters/clusters.facade"
import { ClusterShareRow, clusterSharesOf } from "../../selectors/clusterShares"
import { ClusterHighlightService } from "../../services/clusterHighlight.service"
import { ClusterExplorerReadStore } from "../../stores/clusterExplorer.read.store"

@Component({
    selector: "cc-cluster-explorer",
    templateUrl: "./clusterExplorer.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "block px-2 py-2" }
})
export class ClusterExplorerComponent implements OnDestroy {
    private readonly readStore = inject(ClusterExplorerReadStore)
    private readonly highlight = inject(ClusterHighlightService)

    private readonly clusterings = toSignal(this.readStore.clusterings$, { requireSync: true })
    private readonly shownFilePaths = toSignal(this.readStore.shownFilePaths$, { requireSync: true })
    private readonly chosenKey = signal<string | null>(null)

    readonly clusteringOptions = computed(() =>
        Object.entries(this.clusterings())
            .map(([key, clustering]) => ({ key, title: clustering.title }))
            .sort((first, second) => first.title.localeCompare(second.title))
    )
    readonly activeKey = computed(() => {
        const options = this.clusteringOptions()
        return options.find(option => option.key === this.chosenKey())?.key ?? options[0]?.key
    })
    readonly shares = computed(() => {
        const clustering = this.clusterings()[this.activeKey()]
        return clustering ? clusterSharesOf(clustering, this.shownFilePaths()) : { rows: [], notAttributedShare: null }
    })
    // Whichever clustering is open: the map holds the names either way.
    readonly showsRealNames = computed(() => Object.keys(this.clusterings()).some(showsRealNames))
    readonly pinnedClusterId = this.highlight.pinnedClusterId
    readonly formatShare = formatClusterShare
    readonly clusterIdsOffTheMap = computed(() => {
        const isOnMap = this.highlight.isOnMap()
        return new Set(
            this.shares()
                .rows.filter(row => !row.filePaths.some(path => isOnMap(path)))
                .map(row => row.id)
        )
    })

    titleOf(row: ClusterShareRow): string {
        const fileCount = row.filePaths.length === 1 ? "1 file" : `${row.filePaths.length} files`
        return this.clusterIdsOffTheMap().has(row.id) ? `${fileCount}, none of them on the map` : fileCount
    }

    ngOnDestroy(): void {
        this.highlight.endHover()
    }

    chooseClustering(event: Event): void {
        this.highlight.endHover()
        this.chosenKey.set((event.target as HTMLSelectElement).value)
    }

    hover(row: ClusterShareRow): void {
        this.highlight.hover(row.filePaths)
    }

    endHover(): void {
        this.highlight.endHover()
    }

    togglePin(row: ClusterShareRow): void {
        this.highlight.togglePin(row.id, row.filePaths)
    }
}
