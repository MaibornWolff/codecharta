import { signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { DependencyGraphChartRegistry } from "../../../renderer/dependencyGraph/dependencyGraphRegistry.facade"
import { FilesRepo } from "../../../stores/fileStore/fileStore.facade"
import { DependencyGraphScreenshotService } from "./dependencyGraphScreenshot.service"

describe("DependencyGraphScreenshotService", () => {
    function configure(hasChart: boolean) {
        const renderedCanvas = document.createElement("canvas")
        const chart = hasChart ? { getRenderedCanvas: () => renderedCanvas } : null

        TestBed.configureTestingModule({
            providers: [
                DependencyGraphScreenshotService,
                {
                    provide: DependencyGraphChartRegistry,
                    useValue: { hasChart: signal(hasChart).asReadonly(), current: () => chart }
                },
                { provide: FilesRepo, useValue: { getFiles: () => [] } }
            ]
        })
        return TestBed.inject(DependencyGraphScreenshotService)
    }

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it("should report the capture as unavailable while no dependency graph is drawn", () => {
        // Arrange
        const service = configure(false)

        // Assert
        expect(service.isCaptureAvailable()).toBe(false)
    })

    it("should name the downloaded file after the dependency view", async () => {
        // Arrange
        const service = configure(true)
        const downloadNames: string[] = []
        jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
            downloadNames.push(this.download)
        })

        // Act
        await service.makeScreenshotToFile()

        // Assert
        expect(downloadNames).toEqual(["_dependencies.png"])
    })
})
