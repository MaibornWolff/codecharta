import { BufferGeometry, Object3D } from "three"
import { Font } from "three/examples/jsm/loaders/FontLoader"
import helvetiker from "three/examples/fonts/helvetiker_regular.typeface.json"
import { BackPrintColorChangeStrategy } from "../../ColorChangeStrategies/backPrintColorChangeStrategy"
import { CreateTextGeometryStrategy } from "../../CreateGeometryStrategies/createTextGeometryStrategy"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { TextMesh } from "../textMesh"
import { ColorMetricDescriptionBlockMesh, ColorMetricDescriptionBlockOptions } from "./colorMetricDescriptionBlockMesh"

jest.mock("../../CreateGeometryStrategies/createTextGeometryStrategy")
jest.mock("../textMesh")

describe("ColorMetricDescriptionBlockMesh", () => {
    let colorMetricDescriptionBlockMesh: ColorMetricDescriptionBlockMesh
    let geometryOptions: GeometryOptions
    let colorMetricDescriptionBlockOptions: ColorMetricDescriptionBlockOptions
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
            colorRange: { from: 50, to: 150 },
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

        colorMetricDescriptionBlockOptions = {
            name: "ColorMetricBlock",
            title: "Color Metric",
            iconFilename: "color_icon.svg",
            iconScale: 1,
            nodeMetricData: {
                name: "Color Metric Data",
                minValue: 0,
                maxValue: 200,
                values: []
            },
            colorRange: { from: 50, to: 150 }
        }

        createTextGeometryStrategy = new CreateTextGeometryStrategy() as jest.Mocked<CreateTextGeometryStrategy>
        createTextGeometryStrategy.create.mockResolvedValue(new BufferGeometry())

        const mockTextMesh = new Object3D() as jest.Mocked<TextMesh>
        mockTextMesh.init = jest.fn().mockResolvedValue(mockTextMesh)
        mockTextMesh.getWidth = jest.fn().mockReturnValue(1)
        TextMesh.prototype.init = mockTextMesh.init
        TextMesh.prototype.getWidth = mockTextMesh.getWidth

        colorMetricDescriptionBlockMesh = new ColorMetricDescriptionBlockMesh(colorMetricDescriptionBlockOptions, font, 0.05)
    })

    it("should set correct text values for colored back text children", async () => {
        await colorMetricDescriptionBlockMesh.init(geometryOptions)

        const expectedTexts = ["Value ranges:", "0 - 49", "/", "50 - 149", "/", "150 - 200"]

        for (const [index, child] of colorMetricDescriptionBlockMesh.children.entries()) {
            if (child instanceof TextMesh) {
                expect((child.createTextGeometryOptions as any).text).toBe(expectedTexts[index])
            }
        }
    })

    it("should update color correctly for colored back text children", async () => {
        await colorMetricDescriptionBlockMesh.init(geometryOptions)

        const numberOfColors = 5
        colorMetricDescriptionBlockMesh.updateColor(numberOfColors)

        for (const child of colorMetricDescriptionBlockMesh.children) {
            if (child instanceof TextMesh) {
                expect(child.colorChangeStrategy).toBeInstanceOf(BackPrintColorChangeStrategy)
                expect(child.updateColor).toHaveBeenCalledWith(numberOfColors)
            }
        }
    })
})
