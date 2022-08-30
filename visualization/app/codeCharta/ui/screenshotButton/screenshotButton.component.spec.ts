import { ScreenshotButtonComponent } from "./screenshotButton.component"
import { setScreenshotToClipboardEnabled } from "../../state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.actions"
import { TestBed } from "@angular/core/testing"
import { Store } from "../../state/store/store"
import { render, screen } from "@testing-library/angular"
import { ScreenshotButtonModule } from "./screenshotButton.module"
import { ThreeCameraServiceToken, ThreeRendererServiceToken, ThreeSceneServiceToken } from "../../services/ajs-upgraded-providers"
import userEvent from "@testing-library/user-event"

describe("screenshotButtonComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ScreenshotButtonModule],
			providers: [
				{ provide: ThreeCameraServiceToken, useValue: {} },
				{ provide: ThreeSceneServiceToken, useValue: {} },
				{ provide: ThreeRendererServiceToken, useValue: {} }
			]
		})
	})

	it("should copy to clipboard on click, when screenshot to clipboard is enabled", async () => {
		Store.store.dispatch(setScreenshotToClipboardEnabled(true))
		const { fixture } = await render(ScreenshotButtonComponent, { excludeComponentDeclaration: true })
		fixture.componentInstance.makeScreenshotToClipBoard = jest.fn()

		await userEvent.click(screen.getByTitle("Copy screenshot to clipboard (Ctrl+Alt+F), export it as a file by (Ctrl+Alt+S)"))
		expect(fixture.componentInstance.makeScreenshotToClipBoard).toHaveBeenCalled()
	})

	it("should save to file on click, when screenshot to clipboard is not enabled", async () => {
		Store.store.dispatch(setScreenshotToClipboardEnabled(false))
		const { fixture } = await render(ScreenshotButtonComponent, { excludeComponentDeclaration: true })
		fixture.componentInstance.makeScreenshotToFile = jest.fn()

		await userEvent.click(screen.getByTitle("Export screenshot as file (Ctrl+Alt+S), copy it to clipboard by (Ctrl+Alt+F)"))
		expect(fixture.componentInstance.makeScreenshotToFile).toHaveBeenCalled()
	})
})
