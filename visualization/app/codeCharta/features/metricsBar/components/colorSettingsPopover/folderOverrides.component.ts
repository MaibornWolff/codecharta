import { ChangeDetectionStrategy, Component, computed, ElementRef, signal, viewChild } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { MarkedPackageWithCount } from "../../selectors/markedPackagesWithCounts.selector"
import { defaultMapColors } from "../../../../state/store/appSettings/mapColors/mapColors.reducer"
import { FolderOverridesService } from "../../services/folderOverrides.service"
import { MapColorsService } from "../../services/mapColors.service"
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
    constructor(
        private readonly folderOverridesService: FolderOverridesService,
        private readonly mapColorsService: MapColorsService
    ) {}

    readonly overrides = toSignal(this.folderOverridesService.markedPackagesWithCounts$(), {
        initialValue: [] as MarkedPackageWithCount[]
    })
    private readonly folderPaths = toSignal(this.folderOverridesService.markableFolderPaths$(), { initialValue: [] as string[] })
    private readonly mapColors = toSignal(this.mapColorsService.mapColors$(), { initialValue: defaultMapColors })

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
        this.folderOverridesService.markPackage({ path, color: this.nextMarkingColor(path) })
        this.stopPinning()
    }

    handleRecolor(path: string, color: string) {
        this.folderOverridesService.markPackage({ path, color })
    }

    handleUnpin(path: string) {
        this.folderOverridesService.unmarkPackage(path)
    }

    private nextMarkingColor(path: string) {
        const markingColors = this.mapColors().markingColors
        // a pin with its marked parent's color is dropped as redundant by the reducer,
        // so that color must not be handed out for a nested pin
        const parentColor = this.findMarkedParentColor(path)
        const candidates = markingColors.filter(color => color !== parentColor)
        if (candidates.length === 0) {
            return markingColors[0]
        }
        const usedColors = new Set(this.overrides().map(override => override.color))
        return candidates.find(color => !usedColors.has(color)) ?? candidates[this.overrides().length % candidates.length]
    }

    private findMarkedParentColor(path: string) {
        let deepestParentColor: string | undefined
        let deepestParentPathLength = 0
        for (const override of this.overrides()) {
            if (path.startsWith(`${override.path}/`) && override.path.length > deepestParentPathLength) {
                deepestParentColor = override.color
                deepestParentPathLength = override.path.length
            }
        }
        return deepestParentColor
    }
}
