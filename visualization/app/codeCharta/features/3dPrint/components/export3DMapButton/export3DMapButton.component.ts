import { Component, signal, viewChild } from "@angular/core"
import { take } from "rxjs"
import { ColorMode } from "../../../../codeCharta.model"
import { ActionIconComponent } from "../../../../ui/actionIcon/actionIcon.component"
import { ErrorDialogComponent } from "../../../../ui/dialogs/errorDialog/errorDialog.component"
import { ColorModeStore } from "../../stores/colorMode.store"
import { Export3DMapDialogComponent } from "../export3DMapDialog/export3DMapDialog.component"

@Component({
    selector: "cc-export-3d-map-button",
    templateUrl: "./export3DMapButton.component.html",
    imports: [ActionIconComponent, Export3DMapDialogComponent, ErrorDialogComponent]
})
export class Export3DMapButtonComponent {
    showDialog = signal(false)
    readonly errorDialog = viewChild.required<ErrorDialogComponent>("errorDialog")

    constructor(private readonly colorModeStore: ColorModeStore) {}

    export3DMap() {
        const colorMode = this.colorModeStore.getColorMode()
        if (colorMode === ColorMode.absolute) {
            this.showDialog.set(true)
        } else {
            this.errorDialog().open(this.buildErrorDialog())
        }
    }

    buildErrorDialog() {
        const title = "Map could not be exported"
        const message =
            "<p>3D map can only be exported when <strong>color mode</strong> is set to <strong>absolute</strong>.<br>" +
            '<i class="fa fa-info-circle"></i> You can change this under Color Metric Options ' +
            'or use "Change and continue" to directly change the color mode and continue.<p>'

        const resolveButtonText = "Change and continue"
        const resolveErrorCallback = () => {
            this.colorModeStore.setAbsoluteColorMode()
            this.colorModeStore.colorMode$.pipe(take(1)).subscribe(colorMode => {
                if (colorMode === ColorMode.absolute) {
                    setTimeout(() => {
                        this.showDialog.set(true)
                    }, 100) //TODO: find a better way to wait for the colors to update without using setTimeout
                }
            })
        }

        return { title, message, resolveErrorData: { buttonText: resolveButtonText, onResolveErrorClick: resolveErrorCallback } }
    }

    handleDialogClosed() {
        this.showDialog.set(false)
    }
}
