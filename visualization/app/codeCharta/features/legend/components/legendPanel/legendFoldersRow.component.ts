import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { RadialFolderStyle } from "../../../../model/codeCharta.model"
import { MapStateReadWindow } from "../../../../stores/mapState/mapState.read.facade"
import { PreferencesReadWindow } from "../../../../stores/preferences/preferences.read.facade"
import { describeRadialFolderValue, folderSwatchBackground } from "../../../../util/radialFolderValues"

@Component({
    selector: "cc-legend-folders-row",
    templateUrl: "./legendFoldersRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegendFoldersRowComponent {
    private readonly preferencesReadWindow = inject(PreferencesReadWindow)

    private readonly folderValue = toSignal(this.preferencesReadWindow.radialFolderValue$, { requireSync: true })
    private readonly folderStyle = toSignal(this.preferencesReadWindow.radialFolderStyle$, { requireSync: true })
    private readonly tint = toSignal(this.preferencesReadWindow.radialFolderTint$, { requireSync: true })
    private readonly mapColors = toSignal(inject(MapStateReadWindow).mapColors$, { requireSync: true })

    readonly swatch = computed(() => folderSwatchBackground(this.mapColors(), this.folderStyle(), this.tint()))
    readonly label = computed(() =>
        this.folderStyle() === RadialFolderStyle.Neutral
            ? "folders: neutral"
            : `folders: ${describeRadialFolderValue(this.folderValue()).legend}, tinted`
    )
}
