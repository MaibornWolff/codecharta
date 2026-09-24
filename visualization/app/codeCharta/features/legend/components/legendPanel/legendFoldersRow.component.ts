import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core"
import { toSignal } from "@angular/core/rxjs-interop"
import { PreferencesReadWindow } from "../../../../stores/preferences/preferences.read.facade"
import { describeRadialFolderValue } from "../../../../util/radialFolderValues"

@Component({
    selector: "cc-legend-folders-row",
    templateUrl: "./legendFoldersRow.component.html",
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LegendFoldersRowComponent {
    private readonly preferencesReadWindow = inject(PreferencesReadWindow)

    private readonly folderValue = toSignal(this.preferencesReadWindow.radialFolderValue$, { requireSync: true })
    private readonly isNeutral = toSignal(this.preferencesReadWindow.isRadialFolderNeutral$, { requireSync: true })

    readonly swatch = toSignal(this.preferencesReadWindow.radialFolderSwatch$, { requireSync: true })
    readonly label = computed(() =>
        this.isNeutral() ? "folders: neutral" : `folders: ${describeRadialFolderValue(this.folderValue()).legend}, tinted`
    )
}
