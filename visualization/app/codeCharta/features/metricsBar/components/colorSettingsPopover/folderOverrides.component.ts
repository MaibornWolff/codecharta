import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, signal, viewChild } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { Store } from "@ngrx/store"
import { CcState } from "../../../../codeCharta.model"
import { mapColorsSelector } from "../../../../state/store/appSettings/mapColors/mapColors.selector"
import { markPackages, unmarkPackage } from "../../../../state/store/fileSettings/markedPackages/markedPackages.actions"
import { markableFolderPathsSelector } from "../../selectors/markableFolderPaths.selector"
import { markedPackagesWithCountsSelector } from "../../selectors/markedPackagesWithCounts.selector"
import { InlineColorPickerComponent } from "./inlineColorPicker.component"

const MAX_FOLDER_SUGGESTIONS = 8

@Component({
    selector: "cc-folder-overrides",
    templateUrl: "./folderOverrides.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [InlineColorPickerComponent]
})
export class FolderOverridesComponent {
    private readonly store: Store<CcState> = inject(Store)

    readonly overrides = toSignal(this.store.select(markedPackagesWithCountsSelector), { requireSync: true })
    private readonly folderPaths = toSignal(this.store.select(markableFolderPathsSelector), { requireSync: true })
    private readonly mapColors = toSignal(this.store.select(mapColorsSelector), { requireSync: true })

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

    handlePin(path: string) {
        this.store.dispatch(markPackages({ packages: [{ path, color: this.nextMarkingColor() }] }))
        this.stopPinning()
    }

    handleRecolor(path: string, color: string) {
        this.store.dispatch(markPackages({ packages: [{ path, color }] }))
    }

    handleUnpin(path: string) {
        this.store.dispatch(unmarkPackage({ path }))
    }

    private nextMarkingColor() {
        const markingColors = this.mapColors().markingColors
        const usedColors = new Set(this.overrides().map(override => override.color))
        return markingColors.find(color => !usedColors.has(color)) ?? markingColors[this.overrides().length % markingColors.length]
    }
}
