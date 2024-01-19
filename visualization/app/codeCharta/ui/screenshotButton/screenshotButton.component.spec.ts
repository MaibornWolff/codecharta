import userEvent from "@testing-library/user-event"
import { ScreenshotButtonComponent } from "./screenshotButton.component"
import { TestBed } from "@angular/core/testing"
import { render, screen, waitFor } from "@testing-library/angular"
import { ScreenshotButtonModule } from "./screenshotButton.module"
import { ThreeRendererService } from "../codeMap/threeViewer/threeRenderer.service"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCamera.service"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { screenshotToClipboardEnabledSelector } from "../../state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.selector"
import { State } from "@ngrx/store"
import { defaultState } from "../../state/store/state.manager"

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

	it("should copy to clipboard on click, when screenshot to clipboard is enabled", async () => {
		const user = userEvent.setup()
		const { fixture } = await render(ScreenshotButtonComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { isWriteToClipboardAllowed: true }
		})

		const mockClickboardItem = (global.ClipboardItem = jest.fn())
		const mockToBlob = (HTMLCanvasElement.prototype.toBlob = jest.fn())
		const makeScreenshotToClipboardSpy = jest.spyOn(fixture.componentInstance, "makeScreenshotToClipboard")

		await user.click(screen.getByTitle("Take a screenshot of the map with Ctrl+Alt+F (copy to clipboard) or Ctrl+Alt+S (save as file)"))

		waitFor(() => {
			expect(makeScreenshotToClipboardSpy).toHaveBeenCalledTimes(1)
			expect(mockClickboardItem).toHaveBeenCalledTimes(1)
			expect(mockToBlob).toHaveBeenCalledTimes(1)
		})
	})

	it("should save to file on click, when screenshot to clipboard is not enabled", async () => {
		const user = userEvent.setup()
		const { fixture, detectChanges } = await render(ScreenshotButtonComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { isWriteToClipboardAllowed: true }
		})
		const store = TestBed.inject(MockStore)
		store.overrideSelector(screenshotToClipboardEnabledSelector, false)
		store.refreshState()
		detectChanges()

		const clickDownloadLinkSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation()
		const makeScreenshotToFileSpy = jest.spyOn(fixture.componentInstance, "makeScreenshotToFile")

		await user.click(screen.getByTitle("Take a screenshot of the map with Ctrl+Alt+S (save as file) or Ctrl+Alt+F (copy to clipboard)"))

		await waitFor(() => {
			expect(makeScreenshotToFileSpy).toHaveBeenCalledTimes(1)
			expect(clickDownloadLinkSpy).toHaveBeenCalledTimes(1)
		})
	})

	it("should be disabled when write to clipoard is not available in browser", async () => {
		const user = userEvent.setup()
		const { container, fixture } = await render(ScreenshotButtonComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { isWriteToClipboardAllowed: false }
		})

		const mockClickboardItem = (global.ClipboardItem = jest.fn())
		const mockToBlob = (HTMLCanvasElement.prototype.toBlob = jest.fn())
		const makeScreenshotToClipboardSpy = jest.spyOn(fixture.componentInstance, "makeScreenshotToClipboard")

		await user.click(screen.getByTitle("Take a screenshot of the map with Ctrl+Alt+F (copy to clipboard) or Ctrl+Alt+S (save as file)"))

		waitFor(() => {
			expect(makeScreenshotToClipboardSpy).toHaveBeenCalledTimes(1)
			expect(mockClickboardItem).not.toHaveBeenCalled()
			expect(mockToBlob).not.toHaveBeenCalled()
			expect(isScreenshotButtonDisabled(container)).toBe(true)
		})
	})
})

function isScreenshotButtonDisabled(container: Element) {
	return container.querySelector("cc-action-icon").classList.contains("disabled")
}
