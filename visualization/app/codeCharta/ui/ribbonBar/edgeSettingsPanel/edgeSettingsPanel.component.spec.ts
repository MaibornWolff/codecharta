import { TestBed } from "@angular/core/testing"
import { render, screen } from "@testing-library/angular"
import { EdgeSettingsPanelComponent } from "./edgeSettingsPanel.component"
import { EdgeSettingsPanelModule } from "./edgeSettingsPanel.module"

describe("edgeSettingsPanelComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [EdgeSettingsPanelModule]
		})
	})

	it("should render correctly", async () => {
		await render(EdgeSettingsPanelComponent, { excludeComponentDeclaration: true })
		expect(screen.getByText("Preview")).toBeTruthy()
		expect(screen.getByText("Height")).toBeTruthy()
		expect(screen.getByText("Outgoing Edge")).toBeTruthy()
		expect(screen.getByText("Incoming Edge")).toBeTruthy()
		expect(screen.getByText("Only nodes with edges")).toBeTruthy()
		expect(screen.getByTitle("Reset edge metric settings to their defaults")).toBeTruthy()
	})
})
