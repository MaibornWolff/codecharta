import { TestBed } from "@angular/core/testing"
import { render } from "@testing-library/angular"
import { klona } from "klona"

import { CODE_MAP_BUILDING } from "../../util/dataMocks"

import { selectedNodeSelector } from "../../state/selectors/selectedNode.selector"
import { AttributeSideBarComponent } from "./attributeSideBar.component"
import { AttributeSideBarModule } from "./attributeSideBar.module"

jest.mock("../../state/selectors/selectedNode.selector", () => ({
	selectedNodeSelector: jest.fn()
}))
const mockedSelectedNodeSelector = selectedNodeSelector as unknown as jest.Mock
mockedSelectedNodeSelector.mockImplementation(() => klona(CODE_MAP_BUILDING.node))

describe("AttributeSideBarComponent", () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [AttributeSideBarModule]
		})
	})

	it("should not display side bar if there is no node selected", async () => {
		const { container } = await render(AttributeSideBarComponent, { excludeComponentDeclaration: true })

		expect(container.querySelector(".expanded")).toBe(null)
	})

	// test display filename
	// test primary and secondary metrics (sorted), with attribute type change
	// test close side bar
	// test click on leaf calls LazyLoader.openFile = jest.fn()
	// TEST_NODE_LEAF
})
