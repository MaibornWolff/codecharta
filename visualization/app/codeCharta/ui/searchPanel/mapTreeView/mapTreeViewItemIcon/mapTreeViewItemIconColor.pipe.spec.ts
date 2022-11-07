import { CodeMapNode } from "../../../../codeCharta.model"
import { Store } from "../../../../state/store/store"
import * as codeMapHelper from "../../../../util/codeMapHelper"
import { MapTreeViewItemIconColorPipe } from "./mapTreeViewItemIconColor.pipe"
import { setAreaMetric } from "../../../../state/store/dynamicSettings/areaMetric/areaMetric.actions"

describe("MapTreeViewItemIconColorPipe", () => {
	beforeEach(() => {
		Store["initialize"]()
		Store.dispatch(setAreaMetric("mcc"))
	})

	it("should return undefined for leaf nodes", () => {
		const fakeNode = { attributes: [{ mcc: 100 }] } as unknown as CodeMapNode
		expect(new MapTreeViewItemIconColorPipe().transform(fakeNode)).toBe(undefined)
	})

	it("should return default color if getMarkingColor returns undefined", () => {
		const fakeNode = { children: [{}], attributes: [{ mcc: 100 }] } as unknown as CodeMapNode
		jest.spyOn(codeMapHelper, "getMarkingColor").mockImplementation(() => {})
		expect(new MapTreeViewItemIconColorPipe().transform(fakeNode)).toBe(MapTreeViewItemIconColorPipe.defaultColor)
	})

	it("should return color of getMarkingColor", () => {
		const fakeNode = { children: [{}], attributes: [{ mcc: 100 }] } as unknown as CodeMapNode
		jest.spyOn(codeMapHelper, "getMarkingColor").mockImplementation(() => "#123456")
		expect(new MapTreeViewItemIconColorPipe().transform(fakeNode)).toBe("#123456")
	})

	it("should return constant gray color if node has no area metric entry", () => {
		const fakeNode = { children: [{}], attributes: [] } as unknown as CodeMapNode
		expect(new MapTreeViewItemIconColorPipe().transform(fakeNode)).toBe(MapTreeViewItemIconColorPipe.areMetricZeroColor)
	})

	it("should return constant gray color if node has a value of zero for area metric entry", () => {
		const fakeNode = { children: [{}], attributes: [{ mcc: 0 }] } as unknown as CodeMapNode
		expect(new MapTreeViewItemIconColorPipe().transform(fakeNode)).toBe(MapTreeViewItemIconColorPipe.areMetricZeroColor)
	})
})
