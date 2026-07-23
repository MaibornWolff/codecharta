import { signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { WordCloudChartRegistry } from "../../../renderer/wordCloud/wordCloud.facade"
import { FilesRepo } from "../../../stores/fileStore/fileStore.facade"
import { checkWriteToClipboardAllowed, setToClipboard } from "./clipboardWriter"
import { WordCloudScreenshotService } from "./wordCloudScreenshot.service"

jest.mock("./clipboardWriter", () => {
    return {
        setToClipboard: jest.fn(),
        checkWriteToClipboardAllowed: jest.fn(() => true)
    }
})

const RENDERED_DATA_URL = "data:image/png;base64,aGk="

describe("WordCloudScreenshotService", () => {
    let getRenderedCanvas: jest.Mock
    let renderedCanvas: HTMLCanvasElement

    function configure(options: { hasChart?: boolean; isWriteToClipboardAllowed?: boolean } = {}) {
        const { hasChart = true, isWriteToClipboardAllowed = true } = options
        ;(checkWriteToClipboardAllowed as jest.Mock).mockReturnValue(isWriteToClipboardAllowed)

        renderedCanvas = document.createElement("canvas")
        renderedCanvas.width = 4
        renderedCanvas.height = 4
        jest.spyOn(renderedCanvas, "toDataURL").mockReturnValue(RENDERED_DATA_URL)
        jest.spyOn(renderedCanvas, "toBlob").mockImplementation(callback => callback(new Blob([], { type: "image/png" })))
        getRenderedCanvas = jest.fn(() => renderedCanvas)
        const chart = hasChart ? { getRenderedCanvas } : null

        TestBed.configureTestingModule({
            providers: [
                WordCloudScreenshotService,
                {
                    provide: WordCloudChartRegistry,
                    useValue: { hasChart: signal(hasChart).asReadonly(), current: () => chart }
                },
                { provide: FilesRepo, useValue: { getFiles: () => [] } }
            ]
        })
        return TestBed.inject(WordCloudScreenshotService)
    }

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should report the capture as unavailable while no chart is registered", () => {
        // Arrange
        const service = configure({ hasChart: false })

        // Assert
        expect(service.isCaptureAvailable()).toBe(false)
    })

    it("should render the chart on a transparent background and download it", async () => {
        // Arrange
        const service = configure()
        const clickDownloadLinkSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation()

        // Act
        await service.makeScreenshotToFile()

        // Assert
        expect(getRenderedCanvas).toHaveBeenCalledWith(expect.objectContaining({ backgroundColor: "transparent" }))
        expect(clickDownloadLinkSpy).toHaveBeenCalledTimes(1)
    })

    it("should name the downloaded file after the domain view", async () => {
        // Arrange
        const service = configure()
        const downloadNames: string[] = []
        jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
            downloadNames.push(this.download)
        })

        // Act
        await service.makeScreenshotToFile()

        // Assert
        expect(downloadNames[0]).toContain("domain")
        expect(downloadNames[0]).toContain(".png")
    })

    it("should copy the rendered png to the clipboard", async () => {
        // Arrange
        const service = configure()

        // Act
        await service.makeScreenshotToClipboard()

        // Assert
        expect(setToClipboard).toHaveBeenCalledTimes(1)
        expect((setToClipboard as jest.Mock).mock.calls[0][0].type).toBe("image/png")
    })

    it("should do nothing when the clipboard is not writable", async () => {
        // Arrange
        const service = configure({ isWriteToClipboardAllowed: false })

        // Act
        await service.makeScreenshotToClipboard()

        // Assert
        expect(setToClipboard).not.toHaveBeenCalled()
        expect(getRenderedCanvas).not.toHaveBeenCalled()
    })

    it("should do nothing when there is no chart to capture", async () => {
        // Arrange
        const service = configure({ hasChart: false })
        const clickDownloadLinkSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation()

        // Act
        await service.makeScreenshotToFile()
        await service.makeScreenshotToClipboard()

        // Assert
        expect(clickDownloadLinkSpy).not.toHaveBeenCalled()
        expect(setToClipboard).not.toHaveBeenCalled()
    })
})
