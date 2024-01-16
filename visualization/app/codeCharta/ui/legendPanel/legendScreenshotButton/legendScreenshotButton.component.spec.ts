import { State } from "@ngrx/store"
import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { MockStore, provideMockStore } from "@ngrx/store/testing"

import { LegendPanelModule } from "../legendPanel.module"
import { LegendScreenshotButtonComponent } from "./legendScreenshotButton.component"
import { screenshotToClipboardEnabledSelector } from "../../../../../app/codeCharta/state/store/appSettings/enableClipboard/screenshotToClipboardEnabled.selector"
import { IsAttributeSideBarVisibleService } from "../../../../../app/codeCharta/services/isAttributeSideBarVisible.service"
import { defaultState } from "../../../../../app/codeCharta/state/store/state.manager"
import userEvent from "@testing-library/user-event"

jest.mock("html2canvas", () => {
	return {
		__esModule: true,
		default: jest.fn(() => document.createElement("canvas"))
	}
})

describe("screenshotButtonComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [LegendPanelModule],
			providers: [
				provideMockStore({ selectors: [{ selector: screenshotToClipboardEnabledSelector, value: true }] }),
				{ provide: State, useValue: { getValue: () => defaultState } },
				{ provide: IsAttributeSideBarVisibleService, useValue: true }
			]
		})
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	it("should copy to clipboard on click when screenshot to clipboard is enabled", async () => {
		const user = userEvent.setup()
		const { fixture } = await render(LegendScreenshotButtonComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { isLegendVisible: true }
		})

		const createClipboardItem = (global.ClipboardItem = jest.fn())
		const makeScreenshotToClipboardSpy = jest.spyOn(fixture.componentInstance, "makeScreenshotToClipboard")

		await user.click(screen.getByTitle("Copy screenshot of legend to clipboard"))

		expect(createClipboardItem).toHaveBeenCalledTimes(1)
		expect(makeScreenshotToClipboardSpy).toHaveBeenCalledTimes(1)
	})

	it("should save to file on click when screenshot to clipboard is disabled", async () => {
		const user = userEvent.setup()
		const { fixture, detectChanges } = await render(LegendScreenshotButtonComponent, {
			excludeComponentDeclaration: true,
			componentProperties: { isLegendVisible: true }
		})

		const store = TestBed.inject(MockStore)
		store.overrideSelector(screenshotToClipboardEnabledSelector, false)
		store.refreshState()
		detectChanges()

		const clickDownloadLinkSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation()
		const makeScreenshotToFileSpy = jest.spyOn(fixture.componentInstance, "makeScreenshotToFile")

		await user.click(screen.getByTitle("Export screenshot of legend as file"))

		expect(clickDownloadLinkSpy).toHaveBeenCalledTimes(1)
		expect(makeScreenshotToFileSpy).toHaveBeenCalledTimes(1)
	})

	it("should open and close", async () => {
		const { container, rerender } = await render(LegendScreenshotButtonComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				isLegendVisible: false,
				isWriteToClipboardAllowed: false
			}
		})
		expect(isScreenshotButtonVisible(container)).toBe(false)

		rerender({ componentProperties: { isLegendVisible: true } })
		expect(isScreenshotButtonVisible(container)).toBe(true)

		rerender({ componentProperties: { isLegendVisible: false } })
		expect(isScreenshotButtonVisible(container)).toBe(false)
	})

	it("should be disabled if write to console not available in browser", async () => {
		const { container } = await render(LegendScreenshotButtonComponent, {
			excludeComponentDeclaration: true,
			componentProperties: {
				isLegendVisible: true,
				isWriteToClipboardAllowed: false
			}
		})

		expect(isScreenshotButtonDisabled(container)).toBe(true)
	})

	it("should add class 'isAttributeSideBarVisible' to screenshot button, when attribute sidebar is open", async () => {
		const { container } = await render(LegendScreenshotButtonComponent, {
			excludeComponentDeclaration: true,
			componentProviders: [{ provide: IsAttributeSideBarVisibleService, useValue: { isOpen: true } }]
		})
		const screenshotButton = container.querySelector(".screenshot-button")

		expect(screenshotButton.classList).toContain("isAttributeSideBarVisible")
	})
})

function isScreenshotButtonVisible(container: Element) {
	return container.querySelector(".screenshot-button").classList.contains("visible")
}

function isScreenshotButtonDisabled(container: Element) {
	return container.querySelector(".screenshot-button").classList.contains("disabled")
}
