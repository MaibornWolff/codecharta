import { State } from "@ngrx/store"
import { CcState, CodeMapNode } from "../../../../../codeCharta.model"
import * as codeMapHelper from "../../../../../util/codeMapHelper"
import { MapTreeViewItemIconColorPipe } from "./mapTreeViewItemIconColor.pipe"

describe("MapTreeViewItemIconColorPipe", () => {
    const state = {
        getValue: () => ({
            dynamicSettings: {
                areaMetric: "unary"
            },
            fileSettings: {
                markedPackages: []
            }
        })
    } as State<CcState>

    it("should return undefined for leaf nodes", () => {
        const fakeNode = { attributes: { unary: 1 } } as unknown as CodeMapNode
        expect(new MapTreeViewItemIconColorPipe(state).transform(fakeNode)).toBe(undefined)
    })

    it("should return default color if getMarkingColor returns undefined", () => {
        const fakeNode = { children: [{}], attributes: { unary: 1 } } as unknown as CodeMapNode
        const fakeNodeDelta = { children: [{}], deltas: { unary: -1 } } as unknown as CodeMapNode
        jest.spyOn(codeMapHelper, "getMarkingColor").mockImplementation(() => {})
        expect(new MapTreeViewItemIconColorPipe(state).transform(fakeNode)).toBe(MapTreeViewItemIconColorPipe.defaultColor)
        expect(new MapTreeViewItemIconColorPipe(state).transform(fakeNodeDelta)).toBe(MapTreeViewItemIconColorPipe.defaultColor)
    })

    it("should return color of getMarkingColor", () => {
        const fakeNode = { children: [{}], attributes: { unary: 1 } } as unknown as CodeMapNode
        jest.spyOn(codeMapHelper, "getMarkingColor").mockImplementation(() => "#123456")
        expect(new MapTreeViewItemIconColorPipe(state).transform(fakeNode)).toBe("#123456")
    })

    it("should return color of getMarkingColor if valid delta present", () => {
        const fakeNodeWithDelta = { children: [{}], attributes: { unary: 0 }, deltas: { unary: -1 } } as unknown as CodeMapNode
        jest.spyOn(codeMapHelper, "getMarkingColor").mockImplementation(() => "#123456")
        expect(new MapTreeViewItemIconColorPipe(state).transform(fakeNodeWithDelta)).toBe("#123456")
    })

    it("should return constant gray color if node has no attributes", () => {
        const fakeNode = { children: [{}] } as unknown as CodeMapNode
        expect(new MapTreeViewItemIconColorPipe(state).transform(fakeNode)).toBe(MapTreeViewItemIconColorPipe.areMetricZeroColor)
    })

    it("should return constant gray color if node has no area metric entry", () => {
        const fakeNode = { children: [{}], attributes: {} } as unknown as CodeMapNode
        const fakeNodeDelta = { children: [{}], deltas: {} } as unknown as CodeMapNode

        expect(new MapTreeViewItemIconColorPipe(state).transform(fakeNode)).toBe(MapTreeViewItemIconColorPipe.areMetricZeroColor)
        expect(new MapTreeViewItemIconColorPipe(state).transform(fakeNodeDelta)).toBe(MapTreeViewItemIconColorPipe.areMetricZeroColor)
    })

    it("should return constant gray color if node has a value of zero for area metric entry", () => {
        const fakeNode = { children: [{}], attributes: { unary: 0 } } as unknown as CodeMapNode
        const fakeNodeDelta = { children: [{}], detlas: { unary: 0 } } as unknown as CodeMapNode
        expect(new MapTreeViewItemIconColorPipe(state).transform(fakeNode)).toBe(MapTreeViewItemIconColorPipe.areMetricZeroColor)
        expect(new MapTreeViewItemIconColorPipe(state).transform(fakeNodeDelta)).toBe(MapTreeViewItemIconColorPipe.areMetricZeroColor)
    })
})
