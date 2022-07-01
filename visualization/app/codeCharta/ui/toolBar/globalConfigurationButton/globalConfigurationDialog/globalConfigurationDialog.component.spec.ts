import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { GlobalSettingsHelper } from "../../../../util/globalSettingsHelper"
import { GlobalConfigurationButtonModule } from "../globalConfigurationButton.module"
import { GlobalConfigurationDialogComponent } from "./globalConfigurationDialog.component"

describe("globalConfigurationDialogComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [GlobalConfigurationButtonModule]
		})
	})

	it("should sync its settings in local storage", async () => {
		const setGlobalSettingsInLocalStorageSpy = jest.spyOn(GlobalSettingsHelper, "setGlobalSettingsInLocalStorage")
		await render(GlobalConfigurationDialogComponent, { excludeComponentDeclaration: true })

		userEvent.click(screen.getByText("White Background"))

		expect(setGlobalSettingsInLocalStorageSpy).toHaveBeenCalledWith({
			isWhiteBackground: true
		})
	})
})
