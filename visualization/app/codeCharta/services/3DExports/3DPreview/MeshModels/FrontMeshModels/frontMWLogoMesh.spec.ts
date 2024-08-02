import { BufferGeometry, Font } from "three"
import helvetiker from "three/examples/fonts/helvetiker_regular.typeface.json"
import { CreateTextGeometryStrategy } from "../../CreateGeometryStrategies/createTextGeometryStrategy"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { SecondRowTextMesh } from "./secondRowTextMesh"

jest.mock("../../CreateGeometryStrategies/createTextGeometryStrategy")

describe("SecondRowTextMesh", () => {
    let secondRowTextMesh: SecondRowTextMesh
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
            frontText: "Front Text",
            secondRowText: "Second Row Text",
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

        secondRowTextMesh = new SecondRowTextMesh("TestSecondRowTextMesh", font, geometryOptions)
    })

    it("should initialize with provided second row text", async () => {
        expect(secondRowTextMesh.createTextGeometryOptions.text).toBe(geometryOptions.secondRowText)
    })

    it("should initialize with correct geometry options", async () => {
        expect(secondRowTextMesh.createTextGeometryOptions.font).toBe(font)
        expect(secondRowTextMesh.createTextGeometryOptions.side).toBe("front")
        expect(secondRowTextMesh.createTextGeometryOptions.xPosition).toBe(0)
        expect(secondRowTextMesh.createTextGeometryOptions.yPosition).toBe(-geometryOptions.secondRowTextSize)
        expect(secondRowTextMesh.createTextGeometryOptions.textSize).toBe(geometryOptions.secondRowTextSize)
        expect(secondRowTextMesh.createTextGeometryOptions.align).toBe("center")
    })
})
