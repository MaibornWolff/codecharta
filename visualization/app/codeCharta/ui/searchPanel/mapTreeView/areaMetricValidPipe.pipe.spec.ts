import { CodeMapNode } from "../../../codeCharta.model"
import { AreaMetricValidPipe } from "./areaMetricValidPipe.pipe"

describe("AreaMetricValidPipe", () => {
	it("should be true if node area positive or delta area is negative", () => {
		const fakeNodeBoth = { attributes: { rloc: 5 }, deltas: { rloc: -5 } } as unknown as CodeMapNode
		const fakeNodeAttribute = { attributes: { rloc: 5 } } as unknown as CodeMapNode
		const fakeNodeDelta = { deltas: { rloc: -5 } } as unknown as CodeMapNode
		expect(new AreaMetricValidPipe().transform(fakeNodeBoth, "rloc")).toBe(true)
		expect(new AreaMetricValidPipe().transform(fakeNodeAttribute, "rloc")).toBe(true)
		expect(new AreaMetricValidPipe().transform(fakeNodeDelta, "rloc")).toBe(true)
	})

	it("should be false if area <= 0 or delta area not negative", () => {
		const fakeNodeBoth = { attributes: { rloc: 0 }, deltas: { rloc: 5 } } as unknown as CodeMapNode
		const fakeNodeAttribute = { attributes: { rloc: 0 } } as unknown as CodeMapNode
		const fakeNodeDelta = { deltas: { rloc: 5 } } as unknown as CodeMapNode
		expect(new AreaMetricValidPipe().transform(fakeNodeBoth, "rloc")).toBe(false)
		expect(new AreaMetricValidPipe().transform(fakeNodeAttribute, "rloc")).toBe(false)
		expect(new AreaMetricValidPipe().transform(fakeNodeDelta, "rloc")).toBe(false)
	})

	it("should be false if attributes and deltas are undefined", () => {
		const fakeNode = {} as unknown as CodeMapNode
		expect(new AreaMetricValidPipe().transform(fakeNode, "rloc")).toBe(false)
	})
})
