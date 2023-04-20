import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { GlobalSettingsHelper } from "../../../../util/globalSettingsHelper"
import { GlobalConfigurationButtonModule } from "../globalConfigurationButton.module"
import { GlobalConfigurationDialogComponent } from "./globalConfigurationDialog.component"
import { provideMockStore } from "@ngrx/store/testing"
import { isWhiteBackgroundSelector } from "../../../../state/store/appSettings/isWhiteBackground/isWhiteBackground.selector"
import { State } from "@ngrx/store"
import { defaultState } from "../../../../state/store/state.manager"

describe("globalConfigurationDialogComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [GlobalConfigurationButtonModule],
			providers: [
				provideMockStore({ selectors: [{ selector: isWhiteBackgroundSelector, value: false }], initialState: defaultState }),
				{ provide: State, useValue: {} }
			]
		})
	})

	it("should sync its settings in local storage", async () => {
		const setGlobalSettingsInLocalStorageSpy = jest.spyOn(GlobalSettingsHelper, "setGlobalSettingsInLocalStorage")
		await render(GlobalConfigurationDialogComponent, { excludeComponentDeclaration: true })

		await userEvent.click(screen.getByText("White Background"))

		expect(setGlobalSettingsInLocalStorageSpy).toHaveBeenCalledWith({ isWhiteBackground: true })
	})
})
