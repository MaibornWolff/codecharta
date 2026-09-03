import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    effect,
    HostListener,
    inject,
    input,
    output,
    signal,
    viewChild
} from "@angular/core"
import { RightClickedWord } from "../../../../renderer/wordCloud/wordCloud.facade"
import { CopyToClipboardService } from "../../../../util/copyToClipboard.service"
import { ContextMenuItemComponent } from "../../../shared/facade"

const VIEWPORT_MARGIN = 4

@Component({
    selector: "cc-domain-word-menu",
    templateUrl: "./domainWordMenu.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ContextMenuItemComponent]
})
export class DomainWordMenuComponent {
    private readonly clipboard = inject(CopyToClipboardService)

    readonly rightClickedWord = input<RightClickedWord | null>(null)

    readonly showOccurrences = output<string>()
    readonly closed = output<void>()

    private readonly menuRef = viewChild<ElementRef<HTMLElement>>("menu")

    // null until the rendered menu was measured and clamped to the viewport
    protected readonly clampedPosition = signal<{ left: number; top: number } | null>(null)
    protected readonly wasWordCopied = this.clipboard.copied

    private clampAnimationFrameId: number | null = null

    constructor() {
        effect(() => this.clampOnceTheMenuIsRendered(this.rightClickedWord()))
    }

    @HostListener("document:pointerdown", ["$event"])
    protected onDocumentPointerDown(event: Event): void {
        this.closeWhenOutsideMenu(event)
    }

    @HostListener("document:wheel", ["$event"])
    protected onDocumentWheel(event: Event): void {
        this.closeWhenOutsideMenu(event)
    }

    @HostListener("window:resize")
    protected onWindowResize(): void {
        this.close()
    }

    protected inspectWord(): void {
        const rightClickedWord = this.rightClickedWord()
        if (rightClickedWord) {
            this.showOccurrences.emit(rightClickedWord.word)
        }
        this.close()
    }

    protected async copyWord(): Promise<void> {
        const rightClickedWord = this.rightClickedWord()
        if (rightClickedWord) {
            await this.clipboard.copy(rightClickedWord.word)
        }
    }

    protected close(): void {
        this.closed.emit()
    }

    private clampOnceTheMenuIsRendered(rightClickedWord: RightClickedWord | null): void {
        this.clampedPosition.set(null)
        // a pending measurement from a previous open would clamp the new menu to stale coordinates
        if (this.clampAnimationFrameId !== null) {
            cancelAnimationFrame(this.clampAnimationFrameId)
            this.clampAnimationFrameId = null
        }
        if (!rightClickedWord) {
            return
        }
        this.clampAnimationFrameId = requestAnimationFrame(() => {
            this.clampAnimationFrameId = null
            this.clampToViewport(rightClickedWord.clientX, rightClickedWord.clientY)
        })
    }

    private clampToViewport(x: number, y: number): void {
        const menuElement = this.menuRef()?.nativeElement
        if (!menuElement) {
            return
        }
        const { width, height } = menuElement.getBoundingClientRect()
        this.clampedPosition.set({
            left: Math.max(VIEWPORT_MARGIN, Math.min(x, window.innerWidth - width - VIEWPORT_MARGIN)),
            top: Math.max(VIEWPORT_MARGIN, Math.min(y, window.innerHeight - height - VIEWPORT_MARGIN))
        })
    }

    private closeWhenOutsideMenu(event: Event): void {
        const menuElement = this.menuRef()?.nativeElement
        if (!menuElement) {
            return
        }
        if (event.target instanceof Node && menuElement.contains(event.target)) {
            return
        }
        this.close()
    }
}
