import { CodeMapNode } from "../../../codeCharta.model"
import { Store } from "../../../state/store/store"
import * as codeMapHelper from "../../../util/codeMapHelper"
import { MapTreeViewLevelItemIconColorPipe } from "./mapTreeViewLevelItemIconColor.pipe"

describe("MapTreeViewLevelItemIconColorPipe", () => {
	beforeEach(() => {
		Store["initialize"]()
	})

	it("should return undefined for leaf nodes", () => {
		const fakeNode = {} as unknown as CodeMapNode
		expect(new MapTreeViewLevelItemIconColorPipe().transform(fakeNode)).toBe(undefined)
	})

	it("should return default color if getMarkingColor returns undefined", () => {
		const fakeNode = { children: [{}] } as unknown as CodeMapNode
		jest.spyOn(codeMapHelper, "getMarkingColor").mockImplementation(() => {})
		expect(new MapTreeViewLevelItemIconColorPipe().transform(fakeNode)).toBe(MapTreeViewLevelItemIconColorPipe.defaultColor)
	})

	it("should return color of getMarkingColor", () => {
		const fakeNode = { children: [{}] } as unknown as CodeMapNode
		jest.spyOn(codeMapHelper, "getMarkingColor").mockImplementation(() => "#123456")
		expect(new MapTreeViewLevelItemIconColorPipe().transform(fakeNode)).toBe("#123456")
	})
})
