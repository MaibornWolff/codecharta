import { ChangeDetectionStrategy, Component } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { MarkedPackageWithCount } from "../../selectors/markedPackagesWithCounts.selector"
import { defaultMapColors } from "../../../../appearance/appearance.facade"
import { FolderOverridesService } from "../../services/folderOverrides.service"
import { MapColorsService } from "../../services/mapColors.service"
import { FolderOverrideRowComponent } from "./folderOverrideRow.component"
import { PinFolderSearchComponent } from "./pinFolderSearch.component"

@Component({
    selector: "cc-folder-overrides",
    templateUrl: "./folderOverrides.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { class: "contents" },
    imports: [FolderOverrideRowComponent, PinFolderSearchComponent]
})
export class FolderOverridesComponent {
    constructor(
        private readonly folderOverridesService: FolderOverridesService,
        private readonly mapColorsService: MapColorsService
    ) {}

    readonly overrides = toSignal(this.folderOverridesService.markedPackagesWithCounts$(), {
        initialValue: [] as MarkedPackageWithCount[]
    })
    private readonly mapColors = toSignal(this.mapColorsService.mapColors$(), { initialValue: defaultMapColors })

    handlePin(path: string) {
        this.folderOverridesService.markPackage({ path, color: this.nextMarkingColor(path) })
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
