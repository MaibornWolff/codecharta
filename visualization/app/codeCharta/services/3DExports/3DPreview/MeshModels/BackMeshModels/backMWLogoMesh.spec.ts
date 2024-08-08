import { BackMWLogoMesh } from "./backMWLogoMesh"
import { CreateSvgGeometryStrategy } from "../../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { BufferGeometry, Vector3 } from "three"

jest.mock("../../CreateGeometryStrategies/createSvgGeometryStrategy")

describe("BackMWLogoMesh", () => {
    let createSvgGeometryStrategyMock: jest.Mocked<CreateSvgGeometryStrategy>

    beforeEach(() => {
        createSvgGeometryStrategyMock = new CreateSvgGeometryStrategy() as jest.Mocked<CreateSvgGeometryStrategy>
        jest.clearAllMocks()
    })

    it("should initialize with correct geometry and position", async () => {
        const geometryOptions: GeometryOptions = {
            baseplateHeight: 10,
            printHeight: 2,
            numberOfColors: 3
        } as GeometryOptions

        const name = "testMesh"
        const mesh = new BackMWLogoMesh(name)

        createSvgGeometryStrategyMock.create.mockResolvedValue(new BufferGeometry())

        jest.spyOn(CreateSvgGeometryStrategy.prototype, "create").mockImplementation(createSvgGeometryStrategyMock.create)

        await mesh.init(geometryOptions)

        expect(createSvgGeometryStrategyMock.create).toHaveBeenCalledWith(geometryOptions, {
            filePath: "codeCharta/assets/mw_logo_text.svg",
            size: 0.31,
            side: "back"
        })

        expect(mesh.geometry).toBeInstanceOf(BufferGeometry)

        const expectedPosition = new Vector3(0, 0.37, -geometryOptions.baseplateHeight + geometryOptions.printHeight / 2)
        expect(mesh.position).toEqual(expectedPosition)

        const updateColorSpy = jest.spyOn(mesh, "updateColor")
        mesh.updateColor(geometryOptions.numberOfColors)
        expect(updateColorSpy).toHaveBeenCalledWith(geometryOptions.numberOfColors)
    })
})
