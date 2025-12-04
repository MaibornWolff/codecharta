import { Component, signal } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { Export3DMapDialogComponent } from "../export3DMapDialog/export3DMapDialog.component"
import { State, Store } from "@ngrx/store"
import { CcState, ColorMode } from "../../../../codeCharta.model"
import { colorModeSelector } from "../../../../state/store/dynamicSettings/colorMode/colorMode.selector"
import { take } from "rxjs"
import { ErrorDialogComponent } from "../../../../ui/dialogs/errorDialog/errorDialog.component"
import { setColorMode } from "../../../../state/store/dynamicSettings/colorMode/colorMode.actions"
import { ActionIconComponent } from "../../../../ui/actionIcon/actionIcon.component"

@Component({
    selector: "cc-export-3d-map-button",
    templateUrl: "./export3DMapButton.component.html",
    imports: [ActionIconComponent, Export3DMapDialogComponent]
})
export class Export3DMapButtonComponent {
    showDialog = signal(false)

    constructor(
        private readonly dialog: MatDialog,
        private readonly state: State<CcState>,
        private readonly store: Store<CcState>
    ) {}

    export3DMap() {
        const colorMode: ColorMode = this.state.getValue().dynamicSettings.colorMode
        if (colorMode === ColorMode.absolute) {
            this.showDialog.set(true)
        } else {
            this.dialog.open(ErrorDialogComponent, {
                data: this.buildErrorDialog()
            })
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
            this.store.dispatch(setColorMode({ value: ColorMode.absolute }))
            this.store
                .select(colorModeSelector)
                .pipe(take(1))
                .subscribe(colorMode => {
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
