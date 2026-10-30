import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    Injector,
    inject,
    output,
    signal,
    viewChild
} from "@angular/core"
import { CopyToClipboardService } from "../../../../util/copyToClipboard.service"
import { SourceLanguage, sourceLanguageOf } from "../../services/sourceLanguage"
import { reasonToLeaveUncoloured, sizeOf } from "../../services/sourceLimits"
import { highlightedRowsHtml, lineCountOf, plainRowsHtml } from "../../services/sourceRows"

export interface ViewedFile {
    nodePath: string
    relativePath: string
    text: string
    bytes: number
    encoding: string
}

interface ViewedSource extends ViewedFile {
    folderPath: string
    fileName: string
    language: SourceLanguage
    lineCount: number
    size: string
    uncolouredReason: string | null
}

type CopiedPart = "path" | "content"

const WRAP_STORAGE_KEY = "codecharta.sourceViewer.wrapsLines"
const SELECTED_ROW_CLASS = "cc-source-row-selected"

@Component({
    selector: "cc-source-viewer",
    templateUrl: "./sourceViewer.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { "(window:popstate)": "closeAfterBrowserWentBack()" },
    providers: [CopyToClipboardService]
})
export class SourceViewerComponent {
    private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")
    private readonly scroller = viewChild<ElementRef<HTMLElement>>("scroller")
    private readonly injector = inject(Injector)
    private readonly clipboard = inject(CopyToClipboardService)
    private readonly lastCopiedPart = signal<CopiedPart>("path")
    private holdsHistoryEntry = false

    readonly openInEditor = output<string>()

    readonly source = signal<ViewedSource | null>(null)
    readonly rowsHtml = signal("")
    readonly isColoured = signal(false)
    readonly isColouring = signal(false)
    readonly selectedLine = signal<number | null>(null)
    readonly wrapsLines = signal(readWrapsLines())
    readonly copiedPart = computed(() => (this.clipboard.copied() ? this.lastCopiedPart() : null))
    readonly copyFailed = signal(false)

    async open(file: ViewedFile) {
        const language = sourceLanguageOf(file.relativePath)
        const nameStart = file.relativePath.lastIndexOf("/") + 1
        const source = {
            ...file,
            folderPath: file.relativePath.slice(0, nameStart),
            fileName: file.relativePath.slice(nameStart),
            language,
            lineCount: lineCountOf(file.text),
            size: sizeOf(file.bytes),
            uncolouredReason: language.grammar && reasonToLeaveUncoloured(file.text, file.bytes)
        }
        this.source.set(source)
        this.rowsHtml.set(plainRowsHtml(file.text))
        this.isColoured.set(false)
        this.selectedLine.set(null)
        this.copyFailed.set(false)
        this.dialog().nativeElement.showModal()
        // The code is what arrow keys and page keys should scroll, and it only exists after this render.
        afterNextRender(() => this.scroller()?.nativeElement.focus(), { injector: this.injector })
        if (!this.holdsHistoryEntry) {
            // The state stays as it is: the router keeps its own bookkeeping in it.
            history.pushState(history.state, "")
            this.holdsHistoryEntry = true
        }
        if (language.grammar && !source.uncolouredReason) {
            await this.colour(source, language.grammar)
        }
    }

    close() {
        this.dialog().nativeElement.close()
    }

    closeAfterBrowserWentBack() {
        if (this.holdsHistoryEntry) {
            this.holdsHistoryEntry = false
            this.close()
        }
    }

    handleClosed() {
        this.source.set(null)
        this.rowsHtml.set("")
        if (this.holdsHistoryEntry) {
            this.holdsHistoryEntry = false
            history.back()
        }
    }

    toggleWrapsLines() {
        this.wrapsLines.update(wrapsLines => !wrapsLines)
        writeWrapsLines(this.wrapsLines())
    }

    async copy(part: CopiedPart, source: ViewedSource) {
        this.lastCopiedPart.set(part)
        try {
            await this.clipboard.copy(part === "path" ? source.relativePath : source.text)
            this.copyFailed.set(false)
        } catch {
            this.copyFailed.set(true)
        }
    }

    requestEditor(source: ViewedSource) {
        this.openInEditor.emit(source.nodePath)
    }

    /** The rows are HTML of their own, so the clicked line number is found in the DOM rather than by a binding. */
    selectLineAt(event: MouseEvent) {
        const number = (event.target as HTMLElement).closest(".cc-source-number")
        if (!number) {
            return
        }
        const rows = (event.currentTarget as HTMLElement).querySelectorAll(`.${SELECTED_ROW_CLASS}`)
        for (const row of rows) {
            row.classList.remove(SELECTED_ROW_CLASS)
        }
        number.parentElement.classList.add(SELECTED_ROW_CLASS)
        this.selectedLine.set(Number(number.textContent))
    }

    /** Prism is loaded only once a file is shown, and colours it after it is already readable as plain text. */
    private async colour(source: ViewedSource, grammar: string) {
        this.isColouring.set(true)
        try {
            const { highlightSource } = await import("../../services/syntaxHighlighter")
            const rowsHtml = highlightedRowsHtml(highlightSource(source.text, grammar))
            if (this.source() === source) {
                this.rowsHtml.set(rowsHtml)
                this.isColoured.set(true)
            }
        } finally {
            this.isColouring.set(false)
        }
    }
}

function readWrapsLines(): boolean {
    try {
        return localStorage.getItem(WRAP_STORAGE_KEY) === "true"
    } catch {
        return false
    }
}

function writeWrapsLines(wrapsLines: boolean) {
    try {
        localStorage.setItem(WRAP_STORAGE_KEY, String(wrapsLines))
    } catch {
        // A browser without storage simply forgets the choice with the page.
    }
}
