import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { CodeMapNode, SortingOption } from "../../../../model/codeCharta.model"
import { debounce } from "../../../../util/debounce"
import { ExplorerRevealService } from "../../services/explorerReveal.service"
import { SidebarExplorerReadStore } from "../../stores/sidebarExplorer.read.store"

/**
 * The domain view's wayfinding tool. Unlike the metrics search bar — which filters the 3D map — this only
 * locates a node in the tree: typing reveals the first matching folder/file (expanding its ancestors and
 * scrolling it into view via {@link ExplorerRevealService}, the same primitive as "Show in Explorer"), and
 * Enter steps through the rest. It changes nothing about the tree or the cloud; it just gets the user to the
 * node they then click to scope the word cloud.
 */
@Component({
    selector: "cc-explorer-find-bar",
    templateUrl: "./explorerFindBar.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExplorerFindBarComponent {
    private static readonly DEBOUNCE_TIME = 300

    private readonly readStore = inject(SidebarExplorerReadStore)
    private readonly revealService = inject(ExplorerRevealService)

    // Sort order is irrelevant to finding a node, so any stable order works; NAME keeps match order readable.
    private readonly tree = toSignal(this.readStore.rootNodeFor(SortingOption.NAME, true))
    private readonly query = signal("")
    private readonly matchIndex = signal(0)

    readonly hasQuery = computed(() => this.query().trim().length > 0)
    readonly matchingPaths = computed(() => {
        const loweredQuery = this.query().trim().toLowerCase()
        const root = this.tree()
        if (!loweredQuery || !root) {
            return [] as string[]
        }
        return collectMatchingPaths(root, loweredQuery)
    })
    readonly matchCount = computed(() => this.matchingPaths().length)
    /** 1-based position of the currently revealed match, or 0 when there is no match. */
    readonly currentMatchNumber = computed(() => (this.matchCount() === 0 ? 0 : this.matchIndex() + 1))

    private readonly applyDebouncedQuery = debounce((value: string) => {
        this.query.set(value)
        this.matchIndex.set(0)
        this.revealCurrentMatch()
    }, ExplorerFindBarComponent.DEBOUNCE_TIME)

    onInput(event: Event) {
        this.applyDebouncedQuery((event.target as HTMLInputElement).value)
    }

    goToNextMatch() {
        if (this.matchCount() === 0) {
            return
        }
        this.matchIndex.update(index => (index + 1) % this.matchCount())
        this.revealCurrentMatch()
    }

    clear() {
        this.query.set("")
        this.matchIndex.set(0)
    }

    private revealCurrentMatch() {
        const paths = this.matchingPaths()
        if (paths.length === 0) {
            return
        }
        this.revealService.revealNode(paths[this.matchIndex()])
    }
}

/** Pre-order (ancestors before descendants) list of node paths whose name contains the lowercased query. */
function collectMatchingPaths(node: CodeMapNode, loweredQuery: string, accumulator: string[] = []): string[] {
    if (node.name.toLowerCase().includes(loweredQuery)) {
        accumulator.push(node.path)
    }
    for (const child of node.children ?? []) {
        collectMatchingPaths(child, loweredQuery, accumulator)
    }
    return accumulator
}
