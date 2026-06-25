import { BufferGeometry, Mesh, ShaderMaterial } from "three"
import { BaseplateColorChangeStrategy } from "../ColorChangeStrategies/baseplateColorChangeStrategy"
import { CreateBaseplateGeometryStrategy } from "../CreateGeometryStrategies/createBaseplateGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { BaseplateMesh } from "./baseplateMesh"

jest.mock("../CreateGeometryStrategies/createBaseplateGeometryStrategy")

describe("BaseplateMesh", () => {
    let geometryOptions: GeometryOptions
    let createBaseplateGeometryStrategy: CreateBaseplateGeometryStrategy

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

        createBaseplateGeometryStrategy = new CreateBaseplateGeometryStrategy()
        createBaseplateGeometryStrategy.create = jest.fn().mockResolvedValue(new BufferGeometry())
    })

    it("should initialize and set geometry and material", async () => {
        const baseplateMesh = new BaseplateMesh(createBaseplateGeometryStrategy)
        await baseplateMesh.init(geometryOptions)
        expect(createBaseplateGeometryStrategy.create).toHaveBeenCalledWith(geometryOptions)
        expect(baseplateMesh.geometry).toBeInstanceOf(BufferGeometry)
        expect(baseplateMesh.material).toBeInstanceOf(ShaderMaterial)
        expect(baseplateMesh.colorChangeStrategy).toBeInstanceOf(BaseplateColorChangeStrategy)
    })

    it("should change size and update geometry", async () => {
        const baseplateMesh = new BaseplateMesh(createBaseplateGeometryStrategy)
        await baseplateMesh.init(geometryOptions)
        baseplateMesh.changeSize(geometryOptions)

        expect(createBaseplateGeometryStrategy.create).toHaveBeenCalledTimes(2)
        expect(baseplateMesh.geometry).toBeInstanceOf(BufferGeometry)
        expect(baseplateMesh.boundingBoxCalculated).toBe(false)
    })
})
