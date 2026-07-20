import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { DomainBarReadStore } from "../../../features/domainBar/facade"
import { ExplorerHost, ExplorerHostCapabilities, ExplorerRowState } from "../../../features/sidebarExplorer/facade"
import { CodeMapNode, DomainWord } from "../../../model/codeCharta.model"
import { WordCloudSizingMode } from "../../../model/wordCloud.model"
import { domainWordsSelector } from "../../../stores/domainLensSource/domainLensSource.read.facade"
import { HoverTooltipService } from "../../../util/hoverTooltip.service"

const TOOLTIP_WORD_COUNT = 5
const NO_WORDS_HINT = "No domain words"

/**
 * What an explorer row means in the domain view: a node in the domain word bank.
 *
 * Deliberately narrow. There is no 3D map here, so nothing gates selection on a building existing —
 * that gate is why a `#/domain` deep link (where the metrics view never mounted and no buildings were
 * ever registered) left every file row inert and unable to drive the cloud. Right-click is off for now;
 * it will later highlight the node on the map and redirect there.
 */
@Injectable()
export class DomainExplorerHost implements ExplorerHost {
    private readonly store = inject(Store)
    private readonly domainBarReadStore = inject(DomainBarReadStore)
    private readonly hoverTooltipService = inject(HoverTooltipService)

    private readonly domainWords = toSignal(this.store.select(domainWordsSelector), { requireSync: true })

    // Flatten, exclude, the search patterns that feed them and the area-based counters are all 3D-map
    // concepts. The tree, header and sort control carry over unchanged.
    readonly capabilities: ExplorerHostCapabilities = {
        showRules: false,
        showSearch: false,
        showCounts: false
    }

    isSelectable(): boolean {
        return true
    }

    rowState(): ExplorerRowState {
        return { isDimmed: false, isItalic: false, title: "" }
    }

    rowDecoration(): string | null {
        return null
    }

    hasContextMenu(): boolean {
        return false
    }

    onHover(node: CodeMapNode, rowRect: DOMRect): void {
        const sizingMode = this.domainBarReadStore.settings().sizingMode
        const words = this.topWords(node.path, sizingMode)

        this.hoverTooltipService.show(
            {
                title: node.name,
                rows:
                    words.length > 0
                        ? words.map(word => ({ label: word.text, value: `${scoreOf(word, sizingMode)}` }))
                        : [{ label: NO_WORDS_HINT, value: "" }]
            },
            rowRect.right,
            rowRect.top
        )
    }

    onHoverEnd(): void {
        this.hoverTooltipService.hide()
    }

    onSelect(): void {
        // Publishing the selection is enough — the word cloud reads it and re-renders.
    }

    onDeselect(): void {
        // Same: clearing the selection falls back to the root's aggregated words.
    }

    /** Ranked the same way the cloud sizes its words, so the tooltip previews what selecting will show. */
    private topWords(path: string, sizingMode: WordCloudSizingMode): DomainWord[] {
        const words = this.domainWords()[path] ?? []
        return [...words].sort((a, b) => scoreOf(b, sizingMode) - scoreOf(a, sizingMode)).slice(0, TOOLTIP_WORD_COUNT)
    }
}

function scoreOf(word: DomainWord, sizingMode: WordCloudSizingMode): number {
    if (sizingMode === WordCloudSizingMode.tfidf) {
        return word.tfidf ?? 0
    }
    return word.frequency
}
