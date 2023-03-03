import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { Store } from "../../../state/store/store"
import { AreaSettingsPanelComponent } from "./areaSettingsPanel.component"
import { AreaSettingsPanelModule } from "./areaSettingsPanel.module"

describe("AreaSettingsPanelComponent", () => {
	beforeEach(() => {
		Store["initialize"]()
		TestBed.configureTestingModule({
			imports: [AreaSettingsPanelModule]
		})
	})

	it("should display enableFloorLabels-checkbox", async () => {
		await render(AreaSettingsPanelComponent, { excludeComponentDeclaration: true })
		expect(screen.queryByText("Enable Floor Labels")).not.toBe(null)
	})
})
