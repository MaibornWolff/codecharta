import { AreaSettingsPanelComponent } from "./areaSettingsPanel.component"
import { render, screen } from "@testing-library/angular"
import { AreaSettingsPanelModule } from "./areaSettingsPanel.module"
import { Store } from "../../../state/store/store"
import { TestBed } from "@angular/core/testing"
import userEvent from "@testing-library/user-event"
import { wait } from "../../../util/testUtils/wait"

describe("AreaSettingsPanelComponent", () => {
	beforeEach(() => {
		Store["initialize"]()
		TestBed.configureTestingModule({
			imports: [AreaSettingsPanelModule]
		})
	})

	it("should reset default margin checkbox on changes of margin slider", async function () {
		const { container, detectChanges } = await render(AreaSettingsPanelComponent, { excludeComponentDeclaration: true })
		expect(screen.queryByRole("checkbox", { checked: true, name: "Default margin (50px)" })).not.toBe(null)

		const marginInput = container.querySelector("input")
		await userEvent.type(marginInput, "1")
		await wait(AreaSettingsPanelComponent.DEBOUNCE_TIME)
		detectChanges()
		expect(screen.queryByRole("checkbox", { checked: false, name: "Default margin (50px)" })).not.toBe(null)
	})
})
