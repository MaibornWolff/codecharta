import { Injectable, inject } from "@angular/core"
import { SunburstChartRegistry } from "../../../renderer/sunburst/sunburstRegistry.facade"
import { ChartScreenshotService } from "./chartScreenshot.service"

@Injectable({ providedIn: "root" })
export class SunburstScreenshotService extends ChartScreenshotService {
    protected readonly chartRegistry = inject(SunburstChartRegistry)
    protected readonly fileNameSuffix = "map"

    readonly subject = "sunburst"
}
