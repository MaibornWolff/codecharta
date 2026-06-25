import { MeshBasicMaterial, BufferGeometry } from "three"
import { CustomLogoMesh } from "./customLogoMesh"
import { GeometryOptions } from "../../preview3DPrintMesh"

jest.mock("../../CreateGeometryStrategies/createSvgGeometryStrategy", () => {
    return {
        CreateSvgGeometryStrategy: jest.fn().mockImplementation(() => {
            return {
                create: jest.fn(async () => new BufferGeometry())
            }
        })
    }
})

describe("CustomLogoMesh", () => {
    let geometryOptions: GeometryOptions
    let customLogoMesh: CustomLogoMesh

    beforeEach(() => {
        geometryOptions = {
            printHeight: 10,
            baseplateHeight: 20,
            frontTextSize: 15,
            width: 100,
            mapSideOffset: 10,
            secondRowVisible: false,
            numberOfColors: 2
        } as unknown as GeometryOptions
        customLogoMesh = new CustomLogoMesh("customLogoMesh", "/path/to/logo.svg")
    })

    it("should update color correctly", async () => {
        await customLogoMesh.init(geometryOptions)
        const material = new MeshBasicMaterial()
        customLogoMesh.material = material
        customLogoMesh.setColor("#ff0000")
        expect(material.color.getHexString()).toBe("ff0000")
    })

    it("should rotate geometry correctly", async () => {
        await customLogoMesh.init(geometryOptions)
        const rotateSpy = jest.spyOn(customLogoMesh.geometry, "rotateZ")
        customLogoMesh.rotate()
        expect(rotateSpy).toHaveBeenCalledWith(Math.PI / 2)
    })

    it("should flip geometry correctly", async () => {
        await customLogoMesh.init(geometryOptions)
        const rotateSpy = jest.spyOn(customLogoMesh.geometry, "rotateY")
        customLogoMesh.flip()
        expect(rotateSpy).toHaveBeenCalledWith(Math.PI)
    })

    it("should change size correctly", async () => {
        await customLogoMesh.init(geometryOptions)
        const oldWidth = geometryOptions.width
        geometryOptions.width = 200
        const initialX = customLogoMesh.position.x
        customLogoMesh.changeSize(geometryOptions, oldWidth)
        expect(customLogoMesh.position.x).toBeCloseTo(initialX - (geometryOptions.width - oldWidth) / 2)
    })

    it("should handle secondRowVisible correctly", async () => {
        geometryOptions.secondRowVisible = true
        const changeRelativeSizeSpy = jest.spyOn(customLogoMesh, "changeRelativeSize")
        await customLogoMesh.init(geometryOptions)
        expect(changeRelativeSizeSpy).toHaveBeenCalledWith(geometryOptions)
    })
})
