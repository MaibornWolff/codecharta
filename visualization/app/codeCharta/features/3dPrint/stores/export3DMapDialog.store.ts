import { Injectable, inject, signal } from "@angular/core"
import { Router } from "@angular/router"
import { filter, take } from "rxjs"
import { ColorMode } from "../../../model/codeCharta.model"
import { ActiveViewStore } from "../../../routing/activeView.store"
import { routeLinks } from "../../../routing/routePaths"
import { ViewReadinessStore } from "../../../routing/viewReadiness.store"
import { ErrorDialogData } from "../../../util/errorDialog/errorDialog.model"
import { ErrorDialogService } from "../../../util/errorDialog/errorDialog.service"
import { Export3DColorModeStore } from "./colorMode.store"

//TODO: find a better way to wait for the colors to update without using setTimeout
const AWAIT_RECOLORED_MAP_MS = 100

/** The export button lives in the nav bar's mode bar, which is unmounted as soon as the pointer
 * leaves it. Keeping the "is the dialog open" state out here lets the always-mounted nav bar host
 * the dialog, so it survives the button that opened it. */
@Injectable({ providedIn: "root" })
export class Export3DMapDialogStore {
    private readonly colorModeStore = inject(Export3DColorModeStore)
    private readonly errorDialogService = inject(ErrorDialogService)
    private readonly activeViewStore = inject(ActiveViewStore)
    private readonly viewReadinessStore = inject(ViewReadinessStore)
    private readonly router = inject(Router)

    private readonly dialogOpen = signal(false)

    readonly isDialogOpen = this.dialogOpen.asReadonly()

    requestExport(): void {
        if (this.activeViewStore.currentView() !== "metrics") {
            this.errorDialogService.open(this.buildSwitchToMetricsViewDialog())
            return
        }
        if (this.colorModeStore.getColorMode() === ColorMode.absolute) {
            this.dialogOpen.set(true)
            return
        }
        this.errorDialogService.open(this.buildWrongColorModeDialog())
    }

    closeDialog(): void {
        this.dialogOpen.set(false)
    }

    private buildSwitchToMetricsViewDialog(): ErrorDialogData {
        return {
            title: "3D export needs the Metric view",
            message:
                "<p>The 3D export builds on the rendered map, so it only works in the <strong>Metric view</strong>.<br>" +
                '<i class="fa fa-info-circle"></i> Use "Switch and continue" to open the Metric view and go straight to the export.<p>',
            resolveErrorData: {
                buttonText: "Switch and continue",
                onResolveErrorClick: () => {
                    void this.switchToMetricsViewAndExport()
                }
            },
            dismissButtonText: "Stay here"
        }
    }

    private async switchToMetricsViewAndExport(): Promise<void> {
        const hasSwitchedToMetricsView = await this.router.navigateByUrl(routeLinks.metrics)
        if (!hasSwitchedToMetricsView) {
            return
        }
        this.viewReadinessStore
            .isStale$("metrics")
            .pipe(
                filter(isMetricsViewStale => !isMetricsViewStale),
                take(1)
            )
            .subscribe(() => this.requestExport())
    }

    private buildWrongColorModeDialog(): ErrorDialogData {
        return {
            title: "Map could not be exported",
            message:
                "<p>3D map can only be exported when <strong>color mode</strong> is set to <strong>absolute</strong>.<br>" +
                '<i class="fa fa-info-circle"></i> You can change this under Color Metric Options ' +
                'or use "Change and continue" to directly change the color mode and continue.<p>',
            resolveErrorData: {
                buttonText: "Change and continue",
                onResolveErrorClick: () => this.recolorTheMapAndExportIt()
            }
        }
    }

    private recolorTheMapAndExportIt(): void {
        this.colorModeStore.setAbsoluteColorMode()
        this.colorModeStore.colorMode$.pipe(take(1)).subscribe(colorMode => {
            if (colorMode === ColorMode.absolute) {
                setTimeout(() => this.dialogOpen.set(true), AWAIT_RECOLORED_MAP_MS)
            }
        })
    }
}
