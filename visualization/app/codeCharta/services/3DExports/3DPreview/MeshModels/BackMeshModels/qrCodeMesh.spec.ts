import { GeometryOptions } from "../../preview3DPrintMesh"
import { BufferGeometry, Mesh, ShaderMaterial } from "three"
import { ColorRange, NodeMetricData } from "../../../../../codeCharta.model"
import { QrCodeMesh } from "./qrCodeMesh"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils"

jest.mock("three/examples/jsm/utils/BufferGeometryUtils", () => ({
    BufferGeometryUtils: {
        mergeBufferGeometries: jest.fn(() => new BufferGeometry())
    }
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
            qrCodeText: "Text",
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

    it("should add geometries for non-transparent QR code pixels", async () => {
        const mockCanvasSize = 8
        const originalCreateElement = document.createElement

        jest.spyOn(document, "createElement").mockImplementation((tagName: string) => {
            if (tagName === "canvas") {
                const canvas = originalCreateElement.call(document, "canvas") as HTMLCanvasElement
                canvas.width = mockCanvasSize
                canvas.height = mockCanvasSize
                return canvas
            }
            return originalCreateElement.call(document, tagName)
        })
        geometryOptions.qrCodeText = "Test QR Code"

        const mockBufferGeometry = new BufferGeometry()
        jest.spyOn(BufferGeometryUtils, "mergeBufferGeometries").mockReturnValue(mockBufferGeometry)

        expect(BufferGeometryUtils.mergeBufferGeometries).toHaveBeenCalled()

        const canvas = document.createElement("canvas") as HTMLCanvasElement
        const context = canvas.getContext("2d")!
        const imageData = context.getImageData(0, 0, mockCanvasSize, mockCanvasSize)
        let nonTransparentPixelCount = 0

        for (let y = 0; y < mockCanvasSize; y++) {
            for (let x = 0; x < mockCanvasSize; x++) {
                const index = (y * mockCanvasSize + x) * 4
                if (imageData.data[index] !== 0) {
                    nonTransparentPixelCount++
                }
            }
        }
        const qrCodeGeometriesLength = (BufferGeometryUtils.mergeBufferGeometries as jest.Mock).mock.calls[0][0].length
        expect(qrCodeGeometriesLength).toBe(nonTransparentPixelCount)
    })
})
