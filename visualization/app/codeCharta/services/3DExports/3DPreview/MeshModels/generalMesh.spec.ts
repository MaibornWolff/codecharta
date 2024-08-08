/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box3, BoxGeometry, Mesh, MeshBasicMaterial, Vector3 } from "three"
import { ColorChangeStrategy } from "../ColorChangeStrategies/colorChangeStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { GeneralMesh } from "./generalMesh"

class MockColorChangeStrategy implements ColorChangeStrategy {
    execute(numberOfColors: number, _mesh: Mesh): boolean {
        return numberOfColors % 2 === 0
    }
}

class TestGeneralMesh extends GeneralMesh {
    constructor(name: string, colorChangeStrategy: ColorChangeStrategy) {
        super(name, colorChangeStrategy)
        this.geometry = new BoxGeometry(2, 3, 4)
    }

    async init(_geometryOptions: GeometryOptions): Promise<GeneralMesh> {
        return this
    }

    changeSize(_geometryOptions: GeometryOptions, _oldWidth: number): void {
        // Mock implementation for testing
    }
}

describe("GeneralMesh", () => {
    let generalMesh: GeneralMesh
    let colorChangeStrategy: ColorChangeStrategy

    beforeEach(() => {
        colorChangeStrategy = new MockColorChangeStrategy()
        generalMesh = new TestGeneralMesh("TestMesh", colorChangeStrategy)
    })

    it("should initialize correctly", () => {
        expect(generalMesh.name).toBe("TestMesh")
        expect(generalMesh.colorChangeStrategy).toBe(colorChangeStrategy)
        expect(generalMesh.boundingBoxCalculated).toBe(false)
        expect(generalMesh.material).toBeInstanceOf(MeshBasicMaterial)
    })

    it("should update color", () => {
        jest.spyOn(colorChangeStrategy, "execute")

        generalMesh.updateColor(4)
        expect(colorChangeStrategy.execute).toHaveBeenCalledWith(4, generalMesh)

        const childMesh = new TestGeneralMesh("ChildMesh", colorChangeStrategy)
        jest.spyOn(childMesh, "updateColor")
        generalMesh.add(childMesh)

        generalMesh.updateColor(4)
        expect(childMesh.updateColor).toHaveBeenCalledWith(4)
    })

    it("should update bounding box and get dimensions", () => {
        generalMesh.geometry.computeBoundingBox = jest.fn(() => {
            generalMesh.geometry.boundingBox = new Box3(new Vector3(0, 0, 0), new Vector3(2, 3, 4))
        })

        generalMesh.getWidth()
        expect(generalMesh.geometry.computeBoundingBox).toHaveBeenCalled()
        expect(generalMesh.boundingBoxCalculated).toBe(true)

        generalMesh.getHeight()
        expect(generalMesh.geometry.computeBoundingBox).toHaveBeenCalledTimes(1) // Called only once

        generalMesh.getDepth()
        expect(generalMesh.geometry.computeBoundingBox).toHaveBeenCalledTimes(1) // Called only once

        // Verify dimensions based on BoxGeometry(2, 3, 4)
        expect(generalMesh.getWidth()).toBe(2)
        expect(generalMesh.getHeight()).toBe(4)
        expect(generalMesh.getDepth()).toBe(3)
    })

    it("should check if mesh implements GeneralSizeChangeMesh", () => {
        expect(generalMesh.isGeneralSizeChangeMesh()).toBe(true)
    })
})
