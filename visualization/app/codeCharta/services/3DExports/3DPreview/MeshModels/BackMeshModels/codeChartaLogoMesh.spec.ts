import { CodeChartaLogoMesh } from "./codeChartaLogoMesh"
import { CreateSvgGeometryStrategy } from "../../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { BufferGeometry, Vector3 } from "three"

describe("CodeChartaLogoMesh", () => {
    let createSvgGeometryStrategyMock: jest.Mocked<CreateSvgGeometryStrategy>

    beforeEach(() => {
        createSvgGeometryStrategyMock = {
            create: jest.fn().mockResolvedValue(new BufferGeometry())
        } as unknown as jest.Mocked<CreateSvgGeometryStrategy>
    })

    it("should initialize with correct geometry and position", async () => {
        const geometryOptions: GeometryOptions = {
            baseplateHeight: 10,
            printHeight: 2,
            numberOfColors: 3
        } as GeometryOptions

        const name = "testMesh"
        const mesh = new CodeChartaLogoMesh(name, createSvgGeometryStrategyMock)

        await mesh.init(geometryOptions)

        expect(createSvgGeometryStrategyMock.create).toHaveBeenCalledWith(geometryOptions, {
            filePath: "codeCharta/assets/codecharta_logo.svg",
            size: 0.17,
            side: "back"
        })

        expect(mesh.geometry).toBeInstanceOf(BufferGeometry)

        const expectedPosition = new Vector3(0, 0.18 - 0.17 / 2, -geometryOptions.baseplateHeight + geometryOptions.printHeight / 2)
        expect(mesh.position).toEqual(expectedPosition)
    })
})
