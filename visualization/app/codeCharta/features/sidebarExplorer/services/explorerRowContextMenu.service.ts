import { Injectable, inject } from "@angular/core"
import { EXPLORER_CONTEXT_MENU } from "../explorerContextMenu"
import { ExplorerScrollHostService } from "./explorerScrollHost.service"

/** Opens the view's node context menu from an explorer row, wherever the row is listed, and closes it
 * again as soon as the list scrolls out from under it. A view providing no menu leaves rows inert. */
@Injectable()
export class ExplorerRowContextMenuService {
    private readonly contextMenu = inject(EXPLORER_CONTEXT_MENU, { optional: true })
    private readonly scrollHostService = inject(ExplorerScrollHostService)

    private scrollHostWithListener: HTMLElement | null = null

    isEnabledFor(nodePath: string): boolean {
        return this.contextMenu?.isEnabledFor(nodePath) ?? false
    }

    isMarked(nodePath: string): boolean {
        return this.contextMenu?.isMarked(nodePath) ?? false
    }

    openFor(nodePath: string, event: MouseEvent): void {
        if (!this.isEnabledFor(nodePath)) {
            return
        }

        event.preventDefault()
        event.stopPropagation()

        this.contextMenu?.open(nodePath, event.clientX, event.clientY)

        this.addScrollListener()
    }

    private addScrollListener() {
        if (this.scrollHostWithListener) {
            return
        }
        const scrollHost = this.scrollHostService.element()
        scrollHost?.addEventListener("scroll", this.closeOnScroll)
        this.scrollHostWithListener = scrollHost
    }

    private removeScrollListener() {
        this.scrollHostWithListener?.removeEventListener("scroll", this.closeOnScroll)
        this.scrollHostWithListener = null
    }

    private readonly closeOnScroll = () => {
        this.contextMenu?.close()
        this.removeScrollListener()
    }
}
