import helvetiker from "three/examples/fonts/helvetiker_regular.typeface.json"
import { GeometryOptions } from "../preview3DPrintMesh"
import { CreateTextGeometryStrategy, CreateTextGeometryStrategyOptions } from "../CreateGeometryStrategies/createTextGeometryStrategy"
import { BackPrintColorChangeStrategy } from "../ColorChangeStrategies/backPrintColorChangeStrategy"
import { TextMesh } from "./textMesh"
import { BufferGeometry, Mesh, ShaderMaterial } from "three"
import { Font } from "three/examples/jsm/loaders/FontLoader"

jest.mock("../CreateGeometryStrategies/createTextGeometryStrategy")

describe("TextMesh", () => {
    let geometryOptions: GeometryOptions
    let createTextGeometryOptions: CreateTextGeometryStrategyOptions
    let createTextGeometryStrategy: CreateTextGeometryStrategy

    beforeEach(() => {
        geometryOptions = {
            originalMapMesh: new Mesh(),
            width: 200,
            areaMetricTitle: "Area",
            areaMetricData: {} as any,
            heightMetricTitle: "Height",
            heightMetricData: {} as any,
            colorMetricTitle: "Color",
            colorMetricData: {} as any,
            colorRange: {} as any,
            frontText: "Front Text",
            secondRowText: "Second Row",
            qrCodeText: "QR Code",
            defaultMaterial: new ShaderMaterial(),
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

        createTextGeometryOptions = {
            font: new Font(helvetiker),
            text: "Test Text",
            side: "back",
            xPosition: 0,
            yPosition: 0,
            align: "center"
        }

        createTextGeometryStrategy = new CreateTextGeometryStrategy()
        createTextGeometryStrategy.create = jest.fn().mockResolvedValue(new BufferGeometry())
    })

    it("should initialize and set geometry and color", async () => {
        const textMesh = new TextMesh(
            "TestTextMesh",
            new BackPrintColorChangeStrategy(),
            200,
            true,
            createTextGeometryOptions,
            createTextGeometryStrategy
        )
        await textMesh.init(geometryOptions)

        expect(createTextGeometryStrategy.create).toHaveBeenCalledWith(geometryOptions, createTextGeometryOptions)
        expect(textMesh.geometry).toBeInstanceOf(BufferGeometry)
        expect(textMesh.colorChangeStrategy).toBeInstanceOf(BackPrintColorChangeStrategy)
    })

    it("should update text geometry", async () => {
        const textMesh = new TextMesh(
            "TestTextMesh",
            new BackPrintColorChangeStrategy(),
            200,
            true,
            createTextGeometryOptions,
            createTextGeometryStrategy
        )
        await textMesh.init(geometryOptions)

        createTextGeometryOptions.text = "Updated Text"
        await textMesh.updateText(geometryOptions)

        expect(createTextGeometryStrategy.create).toHaveBeenCalledTimes(2)
        expect(textMesh.geometry).toBeInstanceOf(BufferGeometry)
        expect(textMesh.boundingBoxCalculated).toBe(false)
    })

    it("should update text geometry options", () => {
        const textMesh = new TextMesh(
            "TestTextMesh",
            new BackPrintColorChangeStrategy(),
            200,
            true,
            createTextGeometryOptions,
            createTextGeometryStrategy
        )
        textMesh.updateTextGeometryOptions("New Text")

        expect(textMesh.createTextGeometryOptions.text).toBe("New Text")
    })
})
