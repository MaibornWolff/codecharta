import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { waitFor } from "@testing-library/angular"
import { checkWriteToClipboardAllowed, setToClipboard } from "../../../util/clipboard/clipboardWriter"
import { defaultState } from "../../../state/store/state.manager"
import { ThreeCameraService } from "../../../features/codeMap/facade"
import { ThreeRendererService } from "../../../features/codeMap/facade"
import { ThreeSceneService } from "../../../features/codeMap/facade"
import { ScreenshotService } from "./screenshot.service"

jest.mock("../../../util/clipboard/clipboardWriter", () => {
    return {
        setToClipboard: jest.fn(),
        checkWriteToClipboardAllowed: jest.fn(() => false)
    }
})

const mockHtml2Canvas = jest.fn()

jest.mock("html2canvas-pro", () => {
    return {
        __esModule: true,
        default: (...args: unknown[]) => mockHtml2Canvas(...args)
    }
})

describe("ScreenshotService", () => {
    let service: ScreenshotService

    function configure() {
        TestBed.configureTestingModule({
            providers: [
                ScreenshotService,
                { provide: State, useValue: { getValue: () => defaultState } },
                { provide: ThreeCameraService, useValue: {} },
                { provide: ThreeSceneService, useValue: {} },
                {
                    provide: ThreeRendererService,
                    useValue: {
                        renderer: {
                            getPixelRatio: jest.fn(),
                            setPixelRatio: jest.fn(),
                            getClearColor: jest.fn(),
                            setClearColor: jest.fn(),
                            render: jest.fn(),
                            domElement: document.createElement("canvas")
                        }
                    }
                }
            ]
        })
        service = TestBed.inject(ScreenshotService)
    }

    beforeEach(() => {
        mockHtml2Canvas.mockImplementation(() => document.createElement("canvas"))
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should copy to clipboard when isWriteToClipboardAllowed is true", async () => {
        // Arrange
        ;(checkWriteToClipboardAllowed as jest.Mock).mockImplementation(() => true)
        configure()

        const { xStart, yStart, croppedCanvasWidth, croppedCanvasHeight, imageData } = createMockImageData()
        jest.spyOn(CanvasRenderingContext2D.prototype, "getImageData").mockImplementation(() => imageData)
        const drawImageSpy = jest.spyOn(CanvasRenderingContext2D.prototype, "drawImage")

        // Act
        await service.makeScreenshotToClipboard()

        // Assert
        await waitFor(() => {
            expect(setToClipboard).toHaveBeenCalledTimes(1)
            expect(drawImageSpy).toHaveBeenCalledWith(
                expect.anything(),
                xStart,
                yStart,
                croppedCanvasWidth,
                croppedCanvasHeight,
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                expect.any(Number)
            )
        })
    })

    it("should save to file when makeScreenshotToFile is called", async () => {
        // Arrange
        ;(checkWriteToClipboardAllowed as jest.Mock).mockImplementation(() => true)
        configure()

        const { xStart, yStart, croppedCanvasWidth, croppedCanvasHeight, imageData } = createMockImageData()
        jest.spyOn(CanvasRenderingContext2D.prototype, "getImageData").mockImplementation(() => imageData)
        const drawImageSpy = jest.spyOn(CanvasRenderingContext2D.prototype, "drawImage")
        const clickDownloadLinkSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation()

        // Act
        await service.makeScreenshotToFile()

        // Assert
        await waitFor(() => {
            expect(clickDownloadLinkSpy).toHaveBeenCalledTimes(1)
            expect(drawImageSpy).toHaveBeenCalledWith(
                expect.anything(),
                xStart,
                yStart,
                croppedCanvasWidth,
                croppedCanvasHeight,
                expect.any(Number),
                expect.any(Number),
                expect.any(Number),
                expect.any(Number)
            )
        })
    })

    it("should early return from makeScreenshotToClipboard when clipboard is not allowed", async () => {
        // Arrange
        ;(checkWriteToClipboardAllowed as jest.Mock).mockImplementation(() => false)
        configure()

        // Act
        await service.makeScreenshotToClipboard()

        // Assert
        expect(setToClipboard).not.toHaveBeenCalled()
        expect(mockHtml2Canvas).not.toHaveBeenCalled()
    })

    it("should use null backgroundColor to create transparent screenshots", async () => {
        // Arrange
        configure()
        jest.spyOn(CanvasRenderingContext2D.prototype, "getImageData").mockImplementation(() => createMockImageData().imageData)

        // Act
        await service.makeScreenshotToFile()

        // Assert
        expect(mockHtml2Canvas).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                backgroundColor: null
            })
        )
    })

    it("should ignore cc-bottom-bar in screenshots", async () => {
        // Arrange
        configure()
        jest.spyOn(CanvasRenderingContext2D.prototype, "getImageData").mockImplementation(() => createMockImageData().imageData)

        // Act
        await service.makeScreenshotToFile()

        // Assert
        const ignoreElements = mockHtml2Canvas.mock.calls[0][1].ignoreElements as (element: Element) => boolean
        const fakeBottomBar = document.createElement("cc-bottom-bar")
        expect(ignoreElements(fakeBottomBar)).toBe(true)
    })
})

function createMockImageData() {
    const width = document.createElement("canvas").width
    const height = document.createElement("canvas").height
    const imageDataArray = new Uint8ClampedArray(4 * width * height)

    const xStart = 100
    const xEnd = 200
    const yStart = 50
    const yEnd = 100
    const croppedCanvasWidth = xEnd - xStart
    const croppedCanvasHeight = yEnd - yStart

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4
            imageDataArray[index] = 0
            imageDataArray[index + 1] = 0
            imageDataArray[index + 2] = 0

            if (x >= xStart && x < xEnd && y >= yStart && y < yEnd) {
                imageDataArray[index + 3] = 255
            } else {
                imageDataArray[index + 3] = 0
            }
        }
    }

    return { xStart, yStart, croppedCanvasWidth, croppedCanvasHeight, imageData: new ImageData(imageDataArray, width, height) }
}
