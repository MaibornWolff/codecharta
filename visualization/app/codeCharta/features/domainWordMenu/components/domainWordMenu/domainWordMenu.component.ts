import { ChangeDetectionStrategy, Component, computed, inject, input, output } from "@angular/core"
import { RightClickedWord } from "../../../../renderer/wordCloud/wordCloud.facade"
import { CopyToClipboardService } from "../../../../util/copyToClipboard.service"
import { ContextMenuItemComponent, FloatingMenuComponent } from "../../../shared/facade"

@Component({
    selector: "cc-domain-word-menu",
    templateUrl: "./domainWordMenu.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [ContextMenuItemComponent, FloatingMenuComponent]
})
export class DomainWordMenuComponent {
    private readonly clipboard = inject(CopyToClipboardService)

    readonly rightClickedWord = input<RightClickedWord | null>(null)

    readonly showOccurrences = output<string>()
    readonly hideWord = output<string>()
    readonly closed = output<void>()

    protected readonly anchor = computed(() => {
        const rightClickedWord = this.rightClickedWord()
        return rightClickedWord ? { x: rightClickedWord.clientX, y: rightClickedWord.clientY } : null
    })
    protected readonly wasWordCopied = this.clipboard.copied

    protected inspectWord(): void {
        const rightClickedWord = this.rightClickedWord()
        if (rightClickedWord) {
            this.showOccurrences.emit(rightClickedWord.word)
        }
        this.close()
    }

    protected hideThisWord(): void {
        const rightClickedWord = this.rightClickedWord()
        if (rightClickedWord) {
            this.hideWord.emit(rightClickedWord.word)
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
}
