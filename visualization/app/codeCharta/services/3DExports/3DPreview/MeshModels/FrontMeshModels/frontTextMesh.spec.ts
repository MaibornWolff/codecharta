import { BufferGeometry } from "three"
import { Font } from "three/examples/jsm/loaders/FontLoader"
import helvetiker from "three/examples/fonts/helvetiker_regular.typeface.json"
import { CreateTextGeometryStrategy } from "../../CreateGeometryStrategies/createTextGeometryStrategy"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { FrontTextMesh } from "./frontTextMesh"

jest.mock("../../CreateGeometryStrategies/createTextGeometryStrategy")

describe("FrontTextMesh", () => {
    let frontTextMesh: FrontTextMesh
    let geometryOptions: GeometryOptions
    let createTextGeometryStrategy: jest.Mocked<CreateTextGeometryStrategy>
    let font: Font

    beforeEach(() => {
        font = new Font(helvetiker)
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
            frontText: "Sample Text",
            secondRowText: "Second Row",
            qrCodeText: "QR Code",
            defaultMaterial: {} as any,
            numberOfColors: 5,
            layerHeight: 0.1,
            frontTextSize: 12,
            secondRowTextSize: 12,
            secondRowVisible: true,
            printHeight: 100,
            mapSideOffset: 10,
            baseplateHeight: 10,
            logoSize: 50
        }

        createTextGeometryStrategy = new CreateTextGeometryStrategy() as jest.Mocked<CreateTextGeometryStrategy>
        createTextGeometryStrategy.create.mockResolvedValue(new BufferGeometry())

        frontTextMesh = new FrontTextMesh("TestFrontTextMesh", font, geometryOptions)
    })

    it("should initialize with default text if no front text is provided", async () => {
        geometryOptions.frontText = ""
        const mesh = new FrontTextMesh("TestFrontTextMesh", font, geometryOptions)

        expect(mesh.createTextGeometryOptions.text).toBe("FrontText")
    })

    it("should initialize with provided front text", async () => {
        expect(frontTextMesh.createTextGeometryOptions.text).toBe(geometryOptions.frontText)
    })

    it("should initialize with correct geometry options", async () => {
        expect(frontTextMesh.createTextGeometryOptions.font).toBe(font)
        expect(frontTextMesh.createTextGeometryOptions.side).toBe("front")
        expect(frontTextMesh.createTextGeometryOptions.xPosition).toBe(0)
        expect(frontTextMesh.createTextGeometryOptions.yPosition).toBe(geometryOptions.frontTextSize / 2)
        expect(frontTextMesh.createTextGeometryOptions.textSize).toBe(geometryOptions.frontTextSize)
        expect(frontTextMesh.createTextGeometryOptions.align).toBe("center")
    })
})
