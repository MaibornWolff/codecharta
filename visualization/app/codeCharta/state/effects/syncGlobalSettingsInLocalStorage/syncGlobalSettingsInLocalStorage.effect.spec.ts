import { ApplicationInitStatus } from "@angular/core"
import { TestBed } from "@angular/core/testing"
import { GlobalSettingsHelper } from "../../../util/globalSettingsHelper"
import { EffectsModule } from "../../angular-redux/effects/effects.module"
import { setIsWhiteBackground } from "../../store/appSettings/isWhiteBackground/isWhiteBackground.actions"
import { Store } from "../../store/store"
import { SyncGlobalSettingsInLocalStorageEffect } from "./syncGlobalSettingsInLocalStorage.effect"

describe("SyncGlobalSettingsInLocalStorageEffect", () => {
	beforeEach(async () => {
		TestBed.configureTestingModule({
			imports: [EffectsModule.forRoot([SyncGlobalSettingsInLocalStorageEffect])]
		})
		await TestBed.inject(ApplicationInitStatus).donePromise
	})

	it("should ignore a not relevant action", () => {
		const setGlobalSettingsInLocalStorageSpy = jest.spyOn(GlobalSettingsHelper, "setGlobalSettingsInLocalStorage")
		Store.dispatch({ type: "whatever" })
		expect(setGlobalSettingsInLocalStorageSpy).not.toHaveBeenCalled()
	})

	it("should sync local storage on a change in global settings", () => {
		const setGlobalSettingsInLocalStorageSpy = jest.spyOn(GlobalSettingsHelper, "setGlobalSettingsInLocalStorage")
		Store.dispatch(setIsWhiteBackground(true))
		expect(setGlobalSettingsInLocalStorageSpy).toHaveBeenCalled()
	})
})
