import { GeometryOptions } from "../../preview3DPrintMesh"
import { BufferGeometry, Mesh, ShaderMaterial } from "three"
import { ColorRange, NodeMetricData } from "../../../../../codeCharta.model"
import { QrCodeMesh } from "./qrCodeMesh"

jest.mock("three/examples/jsm/utils/BufferGeometryUtils", () => ({
    mergeGeometries: jest.fn(() => new BufferGeometry())
}))

jest.mock("qrcode", () => ({
    toCanvas: jest.fn(canvas => {
        const context = canvas.getContext("2d")
        context.fillStyle = "black"
        context.fillRect(0, 0, canvas.width, canvas.height)
    })
}))

describe("QrCodeMesh", () => {
    let qrCodeMesh: QrCodeMesh
    let geometryOptions: GeometryOptions

    beforeEach(() => {
        qrCodeMesh = new QrCodeMesh("TestQR")
        geometryOptions = {
            originalMapMesh: new Mesh(),
            width: 100,
            areaMetricTitle: "Area Metric",
            areaMetricData: {} as NodeMetricData,
            heightMetricTitle: "Height Metric",
            heightMetricData: {} as NodeMetricData,
            colorMetricTitle: "Color Metric",
            colorMetricData: {} as NodeMetricData,
            colorRange: {} as ColorRange,
            frontText: "Front Text",
            secondRowText: "Second Row Text",
            qrCodeText: "test",
            defaultMaterial: new ShaderMaterial(),
            numberOfColors: 5,
            layerHeight: 0.2,
            frontTextSize: 12,
            secondRowTextSize: 10,
            secondRowVisible: true,
            printHeight: 10,
            mapSideOffset: 5,
            baseplateHeight: 1,
            logoSize: 15
        }
    })

    it("should initialize correctly", async () => {
        const mesh = await qrCodeMesh.init(geometryOptions)
        expect(mesh.position.x).toBe(0.45)
        expect(mesh.position.y).toBe(0.45)
        expect(mesh.position.z).toBe(4)
        expect(mesh.geometry).toBeInstanceOf(BufferGeometry)
    })

    it("should change text correctly", async () => {
        const oldGeometry = qrCodeMesh.geometry
        await qrCodeMesh.changeText(geometryOptions)
        expect(qrCodeMesh.geometry).not.toBe(oldGeometry)
    })

    it("should create a geometry correctly", async () => {
        const geometry = await qrCodeMesh.create(geometryOptions)
        expect(geometry).toBeInstanceOf(BufferGeometry)
    })

    it("should handle empty QR code text correctly", async () => {
        geometryOptions.qrCodeText = ""
        const geometry = await qrCodeMesh.create(geometryOptions)
        expect(geometry).toBeInstanceOf(BufferGeometry)
        expect(geometry.attributes.position).toBeUndefined()
    })

    it("should update minWidth correctly", () => {
        const pixelSize = 0.1
        qrCodeMesh["updateMinWidth"](pixelSize)
        const roundedMinWidth = Math.round(qrCodeMesh.minWidth)
        expect(roundedMinWidth).toBe(6)
    })
})
