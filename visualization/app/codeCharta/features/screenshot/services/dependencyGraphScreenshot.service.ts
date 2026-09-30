import { Injectable, inject } from "@angular/core"
import { DependencyGraphChartRegistry } from "../../../renderer/dependencyGraph/dependencyGraphRegistry.facade"
import { ChartScreenshotService } from "./chartScreenshot.service"

@Injectable({ providedIn: "root" })
export class DependencyGraphScreenshotService extends ChartScreenshotService {
    protected readonly chartRegistry = inject(DependencyGraphChartRegistry)
    protected readonly fileNameSuffix = "dependencies"

    readonly subject = "dependency graph"
}
