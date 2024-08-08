import { Component, ViewEncapsulation } from "@angular/core"
import { MatDialog } from "@angular/material/dialog"
import { Export3DMapDialogComponent } from "./export3DMapDialog/export3DMapDialog.component"
import { State, Store } from "@ngrx/store"
import { CcState, ColorMode } from "../../codeCharta.model"
import { colorModeSelector } from "../../state/store/dynamicSettings/colorMode/colorMode.selector"
import { take } from "rxjs"
import { ErrorDialogComponent } from "../dialogs/errorDialog/errorDialog.component"
import { setColorMode } from "../../state/store/dynamicSettings/colorMode/colorMode.actions"

@Component({
    selector: "cc-export-3d-map-button",
    templateUrl: "./export3DMapButton.component.html",
    encapsulation: ViewEncapsulation.None
})
export class Export3DMapButtonComponent {
    constructor(
        private dialog: MatDialog,
        private state: State<CcState>,
        private store: Store<CcState>
    ) {}

    export3DMap() {
        const colorMode: ColorMode = this.state.getValue().dynamicSettings.colorMode
        if (colorMode !== ColorMode.absolute) {
            this.dialog.open(ErrorDialogComponent, {
                data: this.buildErrorDialog()
            })
        } else {
            this.dialog.open(Export3DMapDialogComponent, {
                panelClass: "cc-export-3D-map-dialog"
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
                            this.dialog.open(Export3DMapDialogComponent, {
                                panelClass: "cc-export-3D-map-dialog"
                            })
                        }, 100) //TODO: find a better way to wait for the colors to update without using setTimeout
                    }
                })
        }

        return { title, message, resolveErrorData: { buttonText: resolveButtonText, onResolveErrorClick: resolveErrorCallback } }
    }
}
