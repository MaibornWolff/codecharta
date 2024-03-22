import { TestBed } from "@angular/core/testing"
import { State } from "@ngrx/store"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { render, waitFor } from "@testing-library/angular"
import { checkWriteToClipboardAllowed, setToClipboard } from "../../../../app/codeCharta/util/clipboard/clipboardWriter"
import { screenshotToClipboardEnabledSelector } from "../../state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.selector"
import { defaultState } from "../../state/store/state.manager"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCamera.service"
import { ThreeRendererService } from "../codeMap/threeViewer/threeRenderer.service"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { ScreenshotButtonComponent } from "./screenshotButton.component"
import { ScreenshotButtonModule } from "./screenshotButton.module"

jest.mock("../../../../app/codeCharta/util/clipboard/clipboardWriter", () => {
	return {
		setToClipboard: jest.fn(),
		checkWriteToClipboardAllowed: jest.fn(() => false)
	}
})

jest.mock("html2canvas", () => {
	return {
		__esModule: true,
		default: jest.fn().mockImplementation(() => document.createElement("canvas"))
	}
})

describe("screenshotButtonComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ScreenshotButtonModule],
			providers: [
				provideMockStore({ selectors: [{ selector: screenshotToClipboardEnabledSelector, value: true }] }),
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
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it("should copy to clipboard on click, when screenshot to clipboard is enabled", async () => {
		;(checkWriteToClipboardAllowed as jest.Mock).mockImplementation(() => true)

		const { fixture } = await render(ScreenshotButtonComponent, {
			excludeComponentDeclaration: true
		})

		jest.spyOn(CanvasRenderingContext2D.prototype, "getImageData").mockImplementation(() => createMockImageData())
		const drawImageSpy = jest.spyOn(CanvasRenderingContext2D.prototype, "drawImage")
		const makeScreenshotToClipboardSpy = jest.spyOn(fixture.componentInstance, "makeScreenshotToClipboard")

		await fixture.componentInstance.makeScreenshotToClipboard()

		expect(makeScreenshotToClipboardSpy).toHaveBeenCalledTimes(1)
		await waitFor(() => {
			expect(setToClipboard).toHaveBeenCalledTimes(1)
			expect(drawImageSpy).toHaveBeenCalledWith(
				expect.anything(),
				100,
				50,
				100,
				50,
				expect.any(Number),
				expect.any(Number),
				expect.any(Number),
				expect.any(Number)
			)
		})
	})

	it("should save to file on click, when screenshot to clipboard is not enabled", async () => {
		const { fixture, detectChanges } = await render(ScreenshotButtonComponent, {
			excludeComponentDeclaration: true
		})
		const store = TestBed.inject(MockStore)
		store.overrideSelector(screenshotToClipboardEnabledSelector, false)
		store.refreshState()
		detectChanges()

		jest.spyOn(CanvasRenderingContext2D.prototype, "getImageData").mockImplementation(() => createMockImageData())
		const drawImageSpy = jest.spyOn(CanvasRenderingContext2D.prototype, "drawImage")
		const clickDownloadLinkSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation()
		const makeScreenshotToFileSpy = jest.spyOn(fixture.componentInstance, "makeScreenshotToFile")

		await fixture.componentInstance.makeScreenshotToFile()

		expect(makeScreenshotToFileSpy).toHaveBeenCalledTimes(1)
		await waitFor(() => {
			expect(clickDownloadLinkSpy).toHaveBeenCalledTimes(1)
			expect(drawImageSpy).toHaveBeenCalledWith(
				expect.anything(),
				100,
				50,
				100,
				50,
				expect.any(Number),
				expect.any(Number),
				expect.any(Number),
				expect.any(Number)
			)
		})
	})

	it("should be disabled when write to clipoard is not available in browser", async () => {
		;(checkWriteToClipboardAllowed as jest.Mock).mockImplementation(() => false)
		const { container, fixture } = await render(ScreenshotButtonComponent, {
			excludeComponentDeclaration: true
		})

		const makeScreenshotToClipboardSpy = jest.spyOn(fixture.componentInstance, "makeScreenshotToClipboard")

		await fixture.componentInstance.makeScreenshotToClipboard()

		await waitFor(() => {
			expect(makeScreenshotToClipboardSpy).toHaveBeenCalledTimes(1)
			expect(isScreenshotButtonDisabled(container)).toBe(true)
		})
	})
})

function isScreenshotButtonDisabled(container: Element) {
	return container.querySelector("cc-action-icon").classList.contains("disabled")
}

function createMockImageData() {
	const width = document.createElement("canvas").width
	const height = document.createElement("canvas").height
	const imageDataArray = new Uint8ClampedArray(4 * width * height)

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const index = (y * width + x) * 4
			imageDataArray[index] = 0
			imageDataArray[index + 1] = 0
			imageDataArray[index + 2] = 0

			if (x >= 100 && x < 200 && y >= 50 && y < 100) {
				imageDataArray[index + 3] = 255
			} else {
				imageDataArray[index + 3] = 0
			}
		}
	}

	return new ImageData(imageDataArray, width, height)
}
