import { ChangeDetectionStrategy, Component } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { defaultMapColors, MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { MarkedPackageWithCount } from "../../selectors/markedPackagesWithCounts.selector"
import { MetricsBarReadStore } from "../../stores/metricsBar.read.store"
import { MetricsBarWriteStore } from "../../stores/metricsBar.write.store"
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
        private readonly mapStateReadWindow: MapStateReadWindow,
        private readonly metricsBarReadStore: MetricsBarReadStore,
        private readonly metricsBarWriteStore: MetricsBarWriteStore
    ) {}

    readonly overrides = toSignal(this.metricsBarReadStore.markedPackagesWithCounts$, {
        initialValue: [] as MarkedPackageWithCount[]
    })
    private readonly mapColors = toSignal(this.mapStateReadWindow.mapColors$, { initialValue: defaultMapColors })

    handlePin(path: string) {
        this.metricsBarWriteStore.markPackage({ path, color: this.nextMarkingColor(path) })
    }

    handleRecolor(path: string, color: string) {
        this.metricsBarWriteStore.markPackage({ path, color })
    }

    handleUnpin(path: string) {
        this.metricsBarWriteStore.unmarkPackage(path)
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
