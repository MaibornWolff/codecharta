import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, output, signal, viewChild } from "@angular/core"
import { SourceLanguage, sourceLanguageOf } from "../../services/sourceLanguage"
import { reasonToLeaveUncoloured, sizeOf } from "../../services/sourceLimits"
import { highlightedRowsHtml, lineCountOf, plainRowsHtml } from "../../services/sourceRows"

export interface ViewedFile {
    nodePath: string
    relativePath: string
    text: string
    bytes: number
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
const COPY_FEEDBACK_MS = 1500
const SELECTED_ROW_CLASS = "cc-source-row-selected"

@Component({
    selector: "cc-source-viewer",
    templateUrl: "./sourceViewer.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SourceViewerComponent {
    private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>("dialog")
    private copyFeedbackTimeout?: ReturnType<typeof setTimeout>

    readonly openInEditor = output<string>()

    readonly source = signal<ViewedSource | null>(null)
    readonly rowsHtml = signal("")
    readonly isColoured = signal(false)
    readonly isColouring = signal(false)
    readonly selectedLine = signal<number | null>(null)
    readonly wrapsLines = signal(readWrapsLines())
    readonly copiedPart = signal<CopiedPart | null>(null)

    constructor() {
        inject(DestroyRef).onDestroy(() => clearTimeout(this.copyFeedbackTimeout))
    }

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
        this.dialog().nativeElement.showModal()
        if (language.grammar && !source.uncolouredReason) {
            await this.colour(source, language.grammar)
        }
    }

    close() {
        this.dialog().nativeElement.close()
    }

    handleClosed() {
        this.source.set(null)
        this.rowsHtml.set("")
    }

    toggleWrapsLines() {
        this.wrapsLines.update(wrapsLines => !wrapsLines)
        writeWrapsLines(this.wrapsLines())
    }

    async copy(part: CopiedPart, source: ViewedSource) {
        await navigator.clipboard.writeText(part === "path" ? source.relativePath : source.text)
        this.copiedPart.set(part)
        clearTimeout(this.copyFeedbackTimeout)
        this.copyFeedbackTimeout = setTimeout(() => this.copiedPart.set(null), COPY_FEEDBACK_MS)
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
