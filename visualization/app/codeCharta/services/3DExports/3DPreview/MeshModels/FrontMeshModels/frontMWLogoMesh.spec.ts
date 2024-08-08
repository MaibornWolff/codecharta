import { BufferGeometry } from "three"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { CreateSvgGeometryStrategy } from "../../CreateGeometryStrategies/createSvgGeometryStrategy"
import { FrontMWLogoMesh } from "./frontMWLogoMesh"
import { FrontLogo } from "./frontLogo"

jest.mock("../../CreateGeometryStrategies/createSvgGeometryStrategy")

describe("FrontMWLogoMesh", () => {
    let frontMWLogoMesh: FrontMWLogoMesh
    let geometryOptions: GeometryOptions
    let createSvgGeometryStrategy: jest.Mocked<CreateSvgGeometryStrategy>

    beforeEach(() => {
        geometryOptions = {
            originalMapMesh: new BufferGeometry() as any,
            width: 200,
            areaMetricTitle: "Area",
            areaMetricData: {} as any,
            heightMetricTitle: "Height",
            heightMetricData: {} as any,
            colorMetricTitle: "Color",
            colorMetricData: {} as any,
            colorRange: {} as any,
            frontText: "Front Text",
            secondRowText: "Second Row Text",
            qrCodeText: "QR Code",
            defaultMaterial: {} as any,
            numberOfColors: 5,
            layerHeight: 0.1,
            frontTextSize: 12,
            secondRowTextSize: 12,
            secondRowVisible: false,
            printHeight: 100,
            mapSideOffset: 10,
            baseplateHeight: 10,
            logoSize: 10
        }

        createSvgGeometryStrategy = new CreateSvgGeometryStrategy() as jest.Mocked<CreateSvgGeometryStrategy>
        createSvgGeometryStrategy.create.mockResolvedValue(new BufferGeometry())

        frontMWLogoMesh = new FrontMWLogoMesh("TestFrontMWLogoMesh")
    })

    it("should initialize with correct geometry and position", async () => {
        await frontMWLogoMesh.init(geometryOptions, createSvgGeometryStrategy)

        const size = (geometryOptions.frontTextSize * geometryOptions.width) / 250
        const xPosition = geometryOptions.width / 2 - size / 2 - geometryOptions.mapSideOffset / 2
        const yPosition = size / 2
        const zPosition = geometryOptions.printHeight / 2

        expect(frontMWLogoMesh.geometry).toBeInstanceOf(BufferGeometry)
        expect(frontMWLogoMesh.position.x).toBeCloseTo(xPosition, 1)
        expect(frontMWLogoMesh.position.y).toBeCloseTo(yPosition, 1)
        expect(frontMWLogoMesh.position.z).toBeCloseTo(zPosition, 1)
    })

    it("should call changeRelativeSize when second row is visible", async () => {
        const changeRelativeSizeSpy = jest.spyOn(FrontLogo.prototype, "changeRelativeSize")
        await frontMWLogoMesh.init(geometryOptions, createSvgGeometryStrategy)
        if (geometryOptions.secondRowVisible) {
            expect(changeRelativeSizeSpy).toHaveBeenCalledWith(geometryOptions)
        }
        changeRelativeSizeSpy.mockRestore()
    })

    it("should update position correctly when size changes", async () => {
        await frontMWLogoMesh.init(geometryOptions, createSvgGeometryStrategy)

        const oldWidth = geometryOptions.width
        geometryOptions.width = 300

        const initialXPosition = frontMWLogoMesh.position.x
        frontMWLogoMesh.changeSize(geometryOptions, oldWidth)
        const expectedXPosition = initialXPosition + (geometryOptions.width - oldWidth) / 2

        expect(frontMWLogoMesh.position.x).not.toBeNaN()
        expect(frontMWLogoMesh.position.x).toBeCloseTo(expectedXPosition, 1)
    })
})
