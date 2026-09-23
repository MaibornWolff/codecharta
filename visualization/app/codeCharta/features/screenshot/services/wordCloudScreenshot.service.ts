import { Injectable, inject } from "@angular/core"
import { WordCloudChartRegistry } from "../../../renderer/wordCloud/wordCloudRegistry.facade"
import { ChartScreenshotService } from "./chartScreenshot.service"

@Injectable({ providedIn: "root" })
export class WordCloudScreenshotService extends ChartScreenshotService {
    protected readonly chartRegistry = inject(WordCloudChartRegistry)
    protected readonly fileNameSuffix = "domain"

    readonly subject = "word cloud"
}
