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

	it("should handle default margin", async function () {
		const { container } = await render(AreaSettingsPanelComponent, { excludeComponentDeclaration: true })
		expect(screen.queryByRole("checkbox", { checked: true, name: "Default margin (50px)" })).not.toBe(null)

		const marginInput = container.querySelector("input")
		userEvent.type(marginInput, "1")
		await wait(AreaSettingsPanelComponent.DEBOUNCE_TIME)
		expect(screen.queryByRole("checkbox", { checked: false, name: "Default margin (50px)" })).not.toBe(null)
	})
})
