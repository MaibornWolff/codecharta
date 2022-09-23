import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import { mocked } from "ts-jest/utils"
import {
	CodeChartaServiceToken,
	ThreeCameraServiceToken,
	ThreeRendererServiceToken,
	ThreeSceneServiceToken
} from "../../services/ajs-upgraded-providers"
import { hoveredNodeIdSelector } from "../../state/store/appStatus/hoveredNodeId/hoveredNodeId.selector"
import { ToolBarComponent } from "./toolBar.component"
import { ToolBarModule } from "./toolBar.module"

jest.mock("../../state/store/appStatus/hoveredNodeId/hoveredNodeId.selector", () => ({
	hoveredNodeIdSelector: jest.fn()
}))
const mockedHoveredNodeIdSelector = mocked(hoveredNodeIdSelector)

describe("ToolBarComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [ToolBarModule],
			providers: [
				{ provide: CodeChartaServiceToken, useValue: {} },
				{ provide: ThreeCameraServiceToken, useValue: {} },
				{ provide: ThreeSceneServiceToken, useValue: {} },
				{ provide: ThreeRendererServiceToken, useValue: {} }
			]
		})
	})

	it("should show file panel and not hovered node path panel, when there is no node hovered", async () => {
		mockedHoveredNodeIdSelector.mockImplementation(() => null)
		const { container } = await render(ToolBarComponent, { excludeComponentDeclaration: true })
		expect(container.querySelector("cc-file-panel")).not.toBe(null)
		expect(container.querySelector("cc-hovered-node-path-panel")).toBe(null)
	})

	it("should show hovered node path panel and not file panel, when there is a node hovered", async () => {
		mockedHoveredNodeIdSelector.mockImplementation(() => 0)
		const { container } = await render(ToolBarComponent, { excludeComponentDeclaration: true })
		expect(container.querySelector("cc-hovered-node-path-panel")).not.toBe(null)
		expect(container.querySelector("cc-file-panel")).toBe(null)
	})
})
