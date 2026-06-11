import { ChangeDetectionStrategy, Component, computed, ElementRef, output, signal, viewChild } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { FolderOverridesService } from "../../services/folderOverrides.service"
import { MarkedPackageWithCount } from "../../selectors/markedPackagesWithCounts.selector"

const MAX_FOLDER_SUGGESTIONS = 8

@Component({
    selector: "cc-pin-folder-search",
    templateUrl: "./pinFolderSearch.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" }
})
export class PinFolderSearchComponent {
    constructor(private readonly folderOverridesService: FolderOverridesService) {}

    readonly pinFolder = output<string>()

    private readonly folderPaths = toSignal(this.folderOverridesService.markableFolderPaths$(), { initialValue: [] as string[] })
    private readonly overrides = toSignal(this.folderOverridesService.markedPackagesWithCounts$(), {
        initialValue: [] as MarkedPackageWithCount[]
    })

    readonly isPinning = signal(false)
    readonly searchTerm = signal("")
    private readonly pinInput = viewChild<ElementRef<HTMLInputElement>>("pinInput")

    readonly folderSuggestions = computed(() => {
        const term = this.searchTerm().toLowerCase()
        const markedPaths = new Set(this.overrides().map(override => override.path))
        const suggestions: string[] = []
        for (const path of this.folderPaths()) {
            if (markedPaths.has(path) || !path.toLowerCase().includes(term)) {
                continue
            }
            suggestions.push(path)
            if (suggestions.length >= MAX_FOLDER_SUGGESTIONS) {
                break
            }
        }
        return suggestions
    })

    startPinning() {
        this.isPinning.set(true)
        setTimeout(() => this.pinInput()?.nativeElement.focus())
    }

    stopPinning() {
        this.isPinning.set(false)
        this.searchTerm.set("")
    }

    handleSearchTermChange(searchTerm: string) {
        this.searchTerm.set(searchTerm)
    }

    handleSearchBlur() {
        if (this.searchTerm().trim() === "") {
            this.stopPinning()
        }
    }

    handleSearchEscape(event: Event) {
        // Escape would otherwise also close the surrounding native popover
        event.preventDefault()
        this.stopPinning()
    }

    handlePin(path: string) {
        this.pinFolder.emit(path)
        this.stopPinning()
    }
}
