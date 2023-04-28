import { ScreenshotButtonComponent } from "./screenshotButton.component"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { ScreenshotButtonModule } from "./screenshotButton.module"
import userEvent from "@testing-library/user-event"
import { ThreeRendererService } from "../codeMap/threeViewer/threeRenderer.service"
import { ThreeCameraService } from "../codeMap/threeViewer/threeCamera.service"
import { ThreeSceneService } from "../codeMap/threeViewer/threeSceneService"
import { MockStore, provideMockStore } from "@ngrx/store/testing"
import { screenshotToClipboardEnabledSelector } from "../../state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.selector"
import { State } from "@ngrx/store"

describe("screenshotButtonComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ScreenshotButtonModule],
			providers: [
				{ provide: ThreeCameraService, useValue: {} },
				{ provide: ThreeSceneService, useValue: {} },
				{ provide: ThreeRendererService, useValue: {} },
				{ provide: State, useValue: {} },
				provideMockStore({ selectors: [{ selector: screenshotToClipboardEnabledSelector, value: true }] })
			]
		})
	})

	it("should copy to clipboard on click, when screenshot to clipboard is enabled", async () => {
		const { fixture } = await render(ScreenshotButtonComponent, { excludeComponentDeclaration: true })
		fixture.componentInstance.makeScreenshotToClipBoard = jest.fn()

		await userEvent.click(screen.getByTitle("Copy screenshot to clipboard (Ctrl+Alt+F), export it as a file by (Ctrl+Alt+S)"))
		expect(fixture.componentInstance.makeScreenshotToClipBoard).toHaveBeenCalled()
	})

	it("should save to file on click, when screenshot to clipboard is not enabled", async () => {
		const { fixture, detectChanges } = await render(ScreenshotButtonComponent, { excludeComponentDeclaration: true })
		const store = TestBed.inject(MockStore)
		store.overrideSelector(screenshotToClipboardEnabledSelector, false)
		store.refreshState()
		detectChanges()
		fixture.componentInstance.makeScreenshotToFile = jest.fn()

		await userEvent.click(screen.getByTitle("Export screenshot as file (Ctrl+Alt+S), copy it to clipboard by (Ctrl+Alt+F)"))
		expect(fixture.componentInstance.makeScreenshotToFile).toHaveBeenCalled()
	})
})
