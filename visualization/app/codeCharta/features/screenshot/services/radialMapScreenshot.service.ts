import { Injectable, inject } from "@angular/core"
import { RadialChartRegistry } from "../../../renderer/radialMap/radialMapRegistry.facade"
import { ChartScreenshotService } from "./chartScreenshot.service"

@Injectable({ providedIn: "root" })
export class RadialMapScreenshotService extends ChartScreenshotService {
    protected readonly chartRegistry = inject(RadialChartRegistry)
    protected readonly fileNameSuffix = "map"

    readonly subject = "sunburst"
}
