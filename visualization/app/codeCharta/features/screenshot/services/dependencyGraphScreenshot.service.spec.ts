import { signal } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { of } from "rxjs"
import { DependencyGraphChartRegistry, Rectangle } from "../../../renderer/dependencyGraph/dependencyGraphRegistry.facade"
import { FilesRepo } from "../../../stores/fileStore/fileStore.facade"
import { GlobalSettingsFacade } from "../../globalSettings/facade"
import { ToastService } from "../../shared/facade"
import * as clipboardWriter from "./clipboardWriter"
import { DependencyGraphScreenshotService } from "./dependencyGraphScreenshot.service"

describe("DependencyGraphScreenshotService", () => {
    const CHART_WIDTH = 400
    const CHART_HEIGHT = 300
    const toastMock = { show: jest.fn() }

    type ConfigureOptions = {
        hasChart?: boolean
        boxRect?: Rectangle | null
        isClipboardMode?: boolean
    }

    function configure({ hasChart = true, boxRect = null, isClipboardMode = false }: ConfigureOptions = {}) {
        const getRenderedCanvas = jest.fn(({ pixelRatio }: { pixelRatio: number }) => {
            const canvas = document.createElement("canvas")
            canvas.width = CHART_WIDTH * pixelRatio
            canvas.height = CHART_HEIGHT * pixelRatio
            return canvas
        })
        const chart = hasChart ? { getRenderedCanvas } : null
        const renderWithEdgesWithin = jest.fn((_path: string, pixelRatio: number) => getRenderedCanvas({ pixelRatio }))

        TestBed.configureTestingModule({
            providers: [
                DependencyGraphScreenshotService,
                {
                    provide: DependencyGraphChartRegistry,
                    useValue: {
                        hasChart: signal(hasChart).asReadonly(),
                        current: () => chart,
                        boxShots: { pixelRectOf: () => boxRect, renderWithEdgesWithin: renderWithEdgesWithin }
                    }
                },
                { provide: FilesRepo, useValue: { getFiles: () => [] } },
                { provide: GlobalSettingsFacade, useValue: { screenshotToClipboardEnabled$: () => of(isClipboardMode) } },
                { provide: ToastService, useValue: toastMock }
            ]
        })
        return { service: TestBed.inject(DependencyGraphScreenshotService), renderWithEdgesWithin }
    }

    function recordDownloads() {
        const downloadNames: string[] = []
        jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
            downloadNames.push(this.download)
        })
        return downloadNames
    }

    function recordCrops() {
        return jest.spyOn(CanvasRenderingContext2D.prototype, "drawImage").mockImplementation(() => undefined)
    }

    beforeEach(() => {
        jest.clearAllMocks()
        Object.defineProperty(window, "devicePixelRatio", { value: 1, configurable: true })
        jest.spyOn(CanvasRenderingContext2D.prototype, "getImageData").mockReturnValue({
            data: new Uint8ClampedArray(CHART_WIDTH * CHART_HEIGHT * 4)
        } as ImageData)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it("should report the capture as unavailable while no dependency graph is drawn", () => {
        // Arrange
        const { service } = configure({ hasChart: false })

        // Assert
        expect(service.isCaptureAvailable()).toBe(false)
    })

    it("should name the downloaded file after the dependency view", async () => {
        // Arrange
        const { service } = configure()
        const downloadNames = recordDownloads()

        // Act
        await service.makeScreenshotToFile()

        // Assert
        expect(downloadNames).toEqual(["_dependencies.png"])
    })

    describe("screenshotBox", () => {
        const boxRect = { x: 50, y: 40, width: 100, height: 60 }

        it("should offer the screenshot for a box in view", () => {
            // Arrange
            const { service } = configure({ boxRect })

            // Act
            const canScreenshot = service.canScreenshotBox("/root/src")

            // Assert
            expect(canScreenshot).toBe(true)
        })

        it("should not offer the screenshot for a box out of view", () => {
            // Arrange
            const { service } = configure({ boxRect: null })

            // Act
            const canScreenshot = service.canScreenshotBox("/root/src")

            // Assert
            expect(canScreenshot).toBe(false)
        })

        it("should save the box, sharper, with its outline and without the edges leaving it, to a file named after the folder", async () => {
            // Arrange
            const { service, renderWithEdgesWithin } = configure({ boxRect })
            const downloadNames = recordDownloads()
            const drawImageSpy = recordCrops()

            // Act
            await service.screenshotBox("/root/src", "src")

            // Assert
            expect(renderWithEdgesWithin).toHaveBeenCalledWith("/root/src", 2)
            expect(drawImageSpy).toHaveBeenCalledWith(expect.any(HTMLCanvasElement), 96, 76, 208, 128, 0, 0, 208, 128)
            expect(downloadNames).toEqual(["_dependencies_src.png"])
            expect(toastMock.show).toHaveBeenCalledWith('Screenshot of "src" saved', "success")
        })

        it("should keep the crop within the chart for a box at its edge", async () => {
            // Arrange
            const { service } = configure({ boxRect: { x: 0, y: 0, width: CHART_WIDTH, height: CHART_HEIGHT } })
            recordDownloads()
            const drawImageSpy = recordCrops()

            // Act
            await service.screenshotBox("/root", "root")

            // Assert
            expect(drawImageSpy).toHaveBeenCalledWith(
                expect.any(HTMLCanvasElement),
                0,
                0,
                CHART_WIDTH * 2,
                CHART_HEIGHT * 2,
                0,
                0,
                CHART_WIDTH * 2,
                CHART_HEIGHT * 2
            )
        })

        it("should copy the box to the clipboard when screenshots go there", async () => {
            // Arrange
            const { service } = configure({ boxRect, isClipboardMode: true })
            recordCrops()
            jest.spyOn(HTMLCanvasElement.prototype, "toBlob").mockImplementation(callback => callback(new Blob(["png"])))
            const setToClipboardSpy = jest.spyOn(clipboardWriter, "setToClipboard").mockResolvedValue(undefined)
            Object.defineProperty(service, "isWriteToClipboardAllowed", { value: true })

            // Act
            await service.screenshotBox("/root/src", "src")

            // Assert
            expect(setToClipboardSpy).toHaveBeenCalled()
            expect(toastMock.show).toHaveBeenCalledWith('Screenshot of "src" copied', "success")
        })

        it("should report a box that is no longer in view", async () => {
            // Arrange
            const { service } = configure({ boxRect: null })

            // Act
            await service.screenshotBox("/root/src", "src")

            // Assert
            expect(toastMock.show).toHaveBeenCalledWith('Screenshot of "src" failed: the folder is not in view', "error")
        })
    })
})
