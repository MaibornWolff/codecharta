import { signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { createPNGFileName } from "../../../model/files/files.helper"
import { RadialChartRegistry } from "../../../renderer/radialMap/radialMapRegistry.facade"
import { FilesRepo } from "../../../stores/fileStore/fileStore.facade"
import { checkWriteToClipboardAllowed, setToClipboard } from "./clipboardWriter"
import { RadialMapScreenshotService } from "./radialMapScreenshot.service"

jest.mock("./clipboardWriter", () => ({
    setToClipboard: jest.fn(),
    checkWriteToClipboardAllowed: jest.fn(() => true)
}))

describe("RadialMapScreenshotService", () => {
    function configure(hasChart: boolean, encodedBlob: Blob | null = new Blob([], { type: "image/png" })) {
        const renderedCanvas = document.createElement("canvas")
        renderedCanvas.width = 4
        renderedCanvas.height = 4
        jest.spyOn(renderedCanvas, "toDataURL").mockReturnValue("data:image/png;base64,aGk=")
        jest.spyOn(renderedCanvas, "toBlob").mockImplementation(callback => callback(encodedBlob))
        TestBed.configureTestingModule({
            providers: [
                RadialMapScreenshotService,
                {
                    provide: RadialChartRegistry,
                    useValue: { hasChart: signal(hasChart).asReadonly(), current: () => ({ getRenderedCanvas: () => renderedCanvas }) }
                },
                { provide: FilesRepo, useValue: { getFiles: () => [] } }
            ]
        })
        return TestBed.inject(RadialMapScreenshotService)
    }

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should be available while a radial chart is drawn", () => {
        // Act
        const service = configure(true)

        // Assert
        expect(service.isCaptureAvailable()).toBe(true)
        expect(service.subject).toBe("map")
    })

    it("should not be available while no radial chart is drawn", () => {
        // Act
        const service = configure(false)

        // Assert
        expect(service.isCaptureAvailable()).toBe(false)
    })

    it("should download the sunburst under the metric map's file name", async () => {
        // Arrange
        const service = configure(true)
        const downloadNames: string[] = []
        jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
            downloadNames.push(this.download)
        })

        // Act
        await service.makeScreenshotToFile()

        // Assert
        expect(downloadNames).toEqual([createPNGFileName([], "map")])
    })

    it("should copy the sunburst to the clipboard as a png", async () => {
        // Arrange
        const service = configure(true)

        // Act
        await service.makeScreenshotToClipboard()

        // Assert
        expect(checkWriteToClipboardAllowed).toHaveBeenCalled()
        expect(setToClipboard).toHaveBeenCalledTimes(1)
        expect((setToClipboard as jest.Mock).mock.calls[0][0].type).toBe("image/png")
    })

    it("should leave the clipboard alone when the canvas cannot be encoded", async () => {
        // Arrange
        const service = configure(true, null)

        // Act
        await service.makeScreenshotToClipboard()

        // Assert
        expect(setToClipboard).not.toHaveBeenCalled()
    })
})
