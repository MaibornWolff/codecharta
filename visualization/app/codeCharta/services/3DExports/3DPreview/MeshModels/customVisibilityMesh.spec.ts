/* eslint-disable @typescript-eslint/no-unused-vars */
import { GeneralMesh } from "./generalMesh"
import { ColorChangeStrategy } from "../ColorChangeStrategies/colorChangeStrategy"
import { CustomVisibilityMesh } from "./customVisibilityMesh"
import { GeometryOptions } from "../preview3DPrintMesh"

class MockColorChangeStrategy implements ColorChangeStrategy {
    execute(numberOfColors: number, _mesh: GeneralMesh): boolean {
        return numberOfColors % 2 === 0
    }
}

class TestCustomVisibilityMesh extends CustomVisibilityMesh {
    async init(_geometryOptions: GeometryOptions): Promise<GeneralMesh> {
        return new Promise(resolve => {
            resolve(this)
        })
    }
    constructor(name: string, colorChangeStrategy: ColorChangeStrategy, minWidth: number, manualVisibility: boolean) {
        super(name, colorChangeStrategy, minWidth, manualVisibility)
    }
}

describe("CustomVisibilityMesh", () => {
    let customVisibilityMesh: CustomVisibilityMesh
    let colorChangeStrategy: ColorChangeStrategy

    beforeEach(() => {
        colorChangeStrategy = new MockColorChangeStrategy()
        customVisibilityMesh = new TestCustomVisibilityMesh("TestMesh", colorChangeStrategy, 1, true)
    })

    it("should initialize correctly", () => {
        expect(customVisibilityMesh.name).toBe("TestMesh")
        expect(customVisibilityMesh.minWidth).toBe(1)
        expect(customVisibilityMesh.manualVisibility).toBe(true)
    })

    it("should set manual visibility and update visibility", () => {
        customVisibilityMesh.setCurrentWidth(5)
        customVisibilityMesh.visibleBecauseOfColor = true

        customVisibilityMesh.setManualVisibility(false)
        expect(customVisibilityMesh.manualVisibility).toBe(false)
        expect(customVisibilityMesh.visible).toBe(false)

        customVisibilityMesh.setManualVisibility(true)
        expect(customVisibilityMesh.visible).toBe(true)
    })

    it("should set current width and update visibility", () => {
        customVisibilityMesh.setManualVisibility(true)
        customVisibilityMesh.visibleBecauseOfColor = true

        customVisibilityMesh.setCurrentWidth(0.5)
        expect(customVisibilityMesh.currentWidth).toBe(0.5)
        expect(customVisibilityMesh.visible).toBe(false)

        customVisibilityMesh.setCurrentWidth(2)
        expect(customVisibilityMesh.visible).toBe(true)
    })

    it("should update color and visibility", () => {
        customVisibilityMesh.setManualVisibility(true)
        customVisibilityMesh.setCurrentWidth(5)

        customVisibilityMesh.updateColor(4)
        expect(customVisibilityMesh.visibleBecauseOfColor).toBe(true)
        expect(customVisibilityMesh.visible).toBe(true)

        customVisibilityMesh.updateColor(3)
        expect(customVisibilityMesh.visibleBecauseOfColor).toBe(false)
        expect(customVisibilityMesh.visible).toBe(false)
    })

    it("should update color for child meshes", () => {
        const childMesh = new TestCustomVisibilityMesh("ChildMesh", colorChangeStrategy, 1, true)
        jest.spyOn(childMesh, "updateColor")
        customVisibilityMesh.add(childMesh)

        customVisibilityMesh.updateColor(4)
        expect(childMesh.updateColor).toHaveBeenCalledWith(4)
    })
})
