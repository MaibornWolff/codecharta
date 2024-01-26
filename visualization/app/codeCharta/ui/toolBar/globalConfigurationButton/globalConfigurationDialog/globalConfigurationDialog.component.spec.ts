import { TestBed } from "@angular/core/testing"
import { GlobalConfigurationButtonModule } from "../globalConfigurationButton.module"
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

	it("should reset global settings when reset button is clicked", () => {})
})
