import { BufferAttribute, BufferGeometry, Float32BufferAttribute, Mesh, MeshBasicMaterial, Box3, Vector3, ShaderMaterial } from "three"
import { GeometryOptions } from "../preview3DPrintMesh"
import { BackPrintColorChangeStrategy } from "../ColorChangeStrategies/backPrintColorChangeStrategy"
import { MapMesh } from "./mapMesh"

describe("MapMesh", () => {
    let mapMesh: MapMesh
    let geometryOptions: GeometryOptions
    let originalMapMesh: Mesh

    beforeEach(() => {
        originalMapMesh = new Mesh(new BufferGeometry(), new MeshBasicMaterial())
        originalMapMesh.geometry.setAttribute("color", new Float32BufferAttribute([0.8, 0.8, 0.8, 0.9, 0.2, 0.2], 3))
        originalMapMesh.geometry.setAttribute("position", new Float32BufferAttribute([0, 0, 0, 1, 1, 1, 2, 2, 2], 3))

        originalMapMesh.geometry.computeBoundingBox = jest.fn(() => {
            originalMapMesh.geometry.boundingBox = new Box3(new Vector3(0, 0, 0), new Vector3(2, 3, 4))
        })

        originalMapMesh.geometry.computeBoundingBox()

        geometryOptions = {
            originalMapMesh,
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

        mapMesh = new MapMesh()
    })

    it("should initialize and set geometry and material", async () => {
        await mapMesh.init(geometryOptions)

        expect(mapMesh.material).toBe(originalMapMesh.material)
        expect(mapMesh.geometry).toBeInstanceOf(BufferGeometry)
        expect(mapMesh.colorChangeStrategy).toBeInstanceOf(BackPrintColorChangeStrategy)
    })

    it("should update map geometry correctly", async () => {
        await mapMesh.init(geometryOptions)
        const newGeometry = mapMesh.geometry

        expect(newGeometry.boundingBox).toBeDefined()
        expect(newGeometry.attributes.position).toBeDefined()

        const expectedBoundingBox = new Box3(new Vector3(-90, -90, 0), new Vector3(90, 90, 180))
        expect(newGeometry.boundingBox).toEqual(expectedBoundingBox)
    })

    it("should update map colors correctly", async () => {
        await mapMesh.init(geometryOptions)

        mapMesh.updateColor(3)
        const newColors = mapMesh.geometry.getAttribute("color") as BufferAttribute

        expect(newColors.array).toEqual(new Float32BufferAttribute([0.5, 0.5, 0.5, 1, 1, 1], 3).array)
    })

    it("should change size and update geometry scale", async () => {
        await mapMesh.init(geometryOptions)

        const oldWidth = geometryOptions.width
        geometryOptions.width = 400

        const scaleMock = jest.spyOn(mapMesh.geometry, "scale")

        await mapMesh.changeSize(geometryOptions, oldWidth)
        const scale = (geometryOptions.width - 2 * geometryOptions.mapSideOffset) / (oldWidth - 2 * geometryOptions.mapSideOffset)

        expect(scaleMock).toHaveBeenCalledWith(scale, scale, scale)
    })
})
