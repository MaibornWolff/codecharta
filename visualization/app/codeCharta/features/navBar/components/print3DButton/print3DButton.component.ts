import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from "@angular/core"
import { take } from "rxjs"
import { ColorMode } from "../../../../codeCharta.model"
import { Export3DColorModeStore } from "../../../3dPrint/facade"
import { Export3DMapDialogComponent } from "../../../3dPrint/components/export3DMapDialog/export3DMapDialog.component"
import { ErrorDialogComponent } from "../../../../features/shared/components/errorDialog/errorDialog.component"

@Component({
    selector: "cc-print-3d-button",
    templateUrl: "./print3DButton.component.html",
    imports: [Export3DMapDialogComponent, ErrorDialogComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Print3DButtonComponent {
    private readonly colorModeStore = inject(Export3DColorModeStore)

    readonly errorDialog = viewChild.required<ErrorDialogComponent>("errorDialog")

    showDialog = signal(false)

    export3DMap() {
        const colorMode = this.colorModeStore.getColorMode()
        if (colorMode === ColorMode.absolute) {
            this.showDialog.set(true)
        } else {
            this.errorDialog().open(this.buildErrorDialog())
        }
    }

    handleDialogClosed() {
        this.showDialog.set(false)
    }

    private buildErrorDialog() {
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
                    }, 100)
                }
            })
        }

        return { title, message, resolveErrorData: { buttonText: resolveButtonText, onResolveErrorClick: resolveErrorCallback } }
    }
}
