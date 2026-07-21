import { Injectable, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { DomainBarReadStore } from "../../../features/domainBar/facade"
import { ExplorerSelection } from "../../../features/sidebarExplorer/facade"
import { CodeMapNode, DomainWord } from "../../../model/codeCharta.model"
import { WordCloudSizingMode, wordSizingValue } from "../../../model/wordCloud.model"
import { selectTopWords } from "../../../renderer/wordCloud/wordCloud.facade"
import { domainWordsSelector } from "../../../stores/domainLensSource/domainLensSource.read.facade"
import { HoverTooltipService } from "../../../util/hoverTooltip.service"
import { DomainSelectionStore } from "../stores/domainSelection.store"

const TOOLTIP_WORD_COUNT = 5
const NO_WORDS_HINT = "No domain words"

/**
 * What selecting or hovering a row means in the domain view: a node in the word bank. Selecting drives the
 * cloud through the view-local {@link DomainSelectionStore} — the domain view never touches the global
 * `sharedView` selection. Hovering previews the node's top words in a tooltip. There is no map to light, so
 * a row never reports as hovered.
 */
@Injectable()
export class DomainExplorerSelection implements ExplorerSelection {
    private readonly store = inject(Store)
    private readonly domainSelectionStore = inject(DomainSelectionStore)
    private readonly domainBarReadStore = inject(DomainBarReadStore)
    private readonly hoverTooltipService = inject(HoverTooltipService)

    private readonly domainWords = toSignal(this.store.select(domainWordsSelector), { requireSync: true })

    isSelected(node: CodeMapNode): boolean {
        return this.domainSelectionStore.selectedNodePath() === node.path
    }

    isHovered(): boolean {
        // The domain rows do not light up on hover — there is no map hover signal, and the cloud reacts to
        // selection, not hover.
        return false
    }

    select(node: CodeMapNode): void {
        this.domainSelectionStore.select(node.path)
    }

    deselect(): void {
        this.domainSelectionStore.clear()
    }

    hover(node: CodeMapNode, rowRect: DOMRect): void {
        const sizingMode = this.domainBarReadStore.settings().sizingMode
        const words = this.topWords(node.path, sizingMode)

        this.hoverTooltipService.show(
            {
                title: node.name,
                rows:
                    words.length > 0
                        ? words.map(word => ({ label: word.text, value: `${wordSizingValue(word, sizingMode)}` }))
                        : [{ label: NO_WORDS_HINT, value: "" }]
            },
            rowRect.right,
            rowRect.top
        )
    }

    hoverEnd(): void {
        this.hoverTooltipService.hide()
    }

    /** Ranked the same way the cloud sizes its words, so the tooltip previews what selecting will show. */
    private topWords(path: string, sizingMode: WordCloudSizingMode): DomainWord[] {
        return selectTopWords(this.domainWords()[path] ?? [], sizingMode, TOOLTIP_WORD_COUNT)
    }
}
