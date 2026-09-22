import { signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { SunburstChartRegistry } from "../../../renderer/sunburst/sunburstRegistry.facade"
import { FilesRepo } from "../../../stores/fileStore/fileStore.facade"
import { SunburstScreenshotService } from "./sunburstScreenshot.service"

describe("SunburstScreenshotService", () => {
    function configure(hasChart: boolean) {
        const renderedCanvas = document.createElement("canvas")
        jest.spyOn(renderedCanvas, "toDataURL").mockReturnValue("data:image/png;base64,aGk=")
        TestBed.configureTestingModule({
            providers: [
                SunburstScreenshotService,
                {
                    provide: SunburstChartRegistry,
                    useValue: { hasChart: signal(hasChart).asReadonly(), current: () => ({ getRenderedCanvas: () => renderedCanvas }) }
                },
                { provide: FilesRepo, useValue: { getFiles: () => [] } }
            ]
        })
        return TestBed.inject(SunburstScreenshotService)
    }

    it("should be available only while a sunburst chart is drawn", () => {
        // Act
        const service = configure(false)

        // Assert
        expect(service.isCaptureAvailable()).toBe(false)
        expect(service.subject).toBe("sunburst")
    })

    it("should download the sunburst as a map screenshot", async () => {
        // Arrange
        const service = configure(true)
        const downloadNames: string[] = []
        jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
            downloadNames.push(this.download)
        })

        // Act
        await service.makeScreenshotToFile()

        // Assert
        expect(downloadNames[0]).toContain("map")
    })
})
