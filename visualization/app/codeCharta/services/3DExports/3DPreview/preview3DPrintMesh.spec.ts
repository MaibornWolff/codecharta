import { Mesh, ShaderMaterial, Vector3 } from "three"
import { Font } from "three/examples/jsm/loaders/FontLoader"
import { BackPrintContainerMesh } from "./MeshModels/BackMeshModels/backPrintContainerMesh"
import { BaseplateMesh } from "./MeshModels/baseplateMesh"
import { FrontPrintContainerMesh } from "./MeshModels/FrontMeshModels/frontPrintContainerMesh"
import { GeneralMesh } from "./MeshModels/generalMesh"
import { MapMesh } from "./MeshModels/mapMesh"
import { GeometryOptions, Preview3DPrintMesh } from "./preview3DPrintMesh"
import helvetiker from "three/examples/fonts/helvetiker_regular.typeface.json"

describe("Preview3DPrintMesh", () => {
    let geometryOptions: GeometryOptions
    let frontPrintContainerMesh: FrontPrintContainerMesh
    let backPrintContainerMesh: BackPrintContainerMesh
    let baseplateMesh: BaseplateMesh
    let mapMesh: MapMesh

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

        frontPrintContainerMesh = new FrontPrintContainerMesh(new Font(helvetiker))
        frontPrintContainerMesh.init = jest.fn().mockResolvedValue(frontPrintContainerMesh)
        frontPrintContainerMesh.addCustomLogo = jest.fn()
        frontPrintContainerMesh.rotateCustomLogo = jest.fn()
        frontPrintContainerMesh.flipCustomLogo = jest.fn()
        frontPrintContainerMesh.removeCustomLogo = jest.fn()
        frontPrintContainerMesh.updateCustomLogoColor = jest.fn()
        frontPrintContainerMesh.updateFrontText = jest.fn()
        frontPrintContainerMesh.updateSecondRowVisibility = jest.fn()
        frontPrintContainerMesh.updateSecondRowText = jest.fn().mockResolvedValue("Text")
        frontPrintContainerMesh.changeSize = jest.fn()

        backPrintContainerMesh = new BackPrintContainerMesh(new Font(helvetiker))
        backPrintContainerMesh.init = jest.fn().mockResolvedValue(backPrintContainerMesh)
        backPrintContainerMesh.updateQrCodeText = jest.fn()
        backPrintContainerMesh.updateQrCodeVisibility = jest.fn()
        backPrintContainerMesh.isQRCodeVisible = jest.fn().mockReturnValue(true)

        baseplateMesh = new BaseplateMesh()
        baseplateMesh.init = jest.fn().mockResolvedValue(baseplateMesh)
        baseplateMesh.getWidth = jest.fn().mockReturnValue(100)
        baseplateMesh.getDepth = jest.fn().mockReturnValue(100)
        baseplateMesh.getHeight = jest.fn().mockReturnValue(10)
        baseplateMesh.changeSize = jest.fn()

        mapMesh = new MapMesh()
        mapMesh.init = jest.fn().mockResolvedValue(mapMesh)
        mapMesh.getHeight = jest.fn().mockReturnValue(50)
    })

    it("should initialize and calculate size correctly", async () => {
        const previewMesh = new Preview3DPrintMesh(geometryOptions, frontPrintContainerMesh, backPrintContainerMesh, baseplateMesh, mapMesh)
        await previewMesh.initialize()

        expect(previewMesh.getThreeMesh().children.length).toBe(4)
        expect(previewMesh.getSize()).toEqual(new Vector3(100, 100, 60))
    })

    it("should update the size correctly", async () => {
        const previewMesh = new Preview3DPrintMesh(geometryOptions, frontPrintContainerMesh, backPrintContainerMesh, baseplateMesh, mapMesh)
        await previewMesh.initialize()

        const result = await previewMesh.updateSize(300)
        expect(result).toBe(true)
        expect(geometryOptions.width).toBe(300)
    })

    it("should update the number of colors correctly", () => {
        const previewMesh = new Preview3DPrintMesh(geometryOptions, frontPrintContainerMesh, backPrintContainerMesh, baseplateMesh, mapMesh)
        previewMesh.updateNumberOfColors(10)

        for (const child of previewMesh.getThreeMesh().children) {
            if (child instanceof GeneralMesh) {
                expect(child.updateColor).toHaveBeenCalledWith(10)
            }
        }
    })

    it("should add a custom logo", async () => {
        const previewMesh = new Preview3DPrintMesh(geometryOptions, frontPrintContainerMesh, backPrintContainerMesh, baseplateMesh, mapMesh)
        await previewMesh.initialize()

        await previewMesh.addCustomLogo("dataUrl")
        expect(frontPrintContainerMesh.addCustomLogo).toHaveBeenCalledWith("dataUrl", geometryOptions)
    })

    it("should update front text", () => {
        const previewMesh = new Preview3DPrintMesh(geometryOptions, frontPrintContainerMesh, backPrintContainerMesh, baseplateMesh, mapMesh)
        previewMesh.updateFrontText("New Front Text")

        expect(frontPrintContainerMesh.updateFrontText).toHaveBeenCalledWith("New Front Text", geometryOptions)
    })

    it("should update QR code text", async () => {
        const previewMesh = new Preview3DPrintMesh(geometryOptions, frontPrintContainerMesh, backPrintContainerMesh, baseplateMesh, mapMesh)
        await previewMesh.initialize()

        await previewMesh.updateQrCodeText("New QR Code")
        expect(backPrintContainerMesh.updateQrCodeText).toHaveBeenCalledWith("New QR Code", geometryOptions)
    })

    it("should update second row visibility", () => {
        const previewMesh = new Preview3DPrintMesh(geometryOptions, frontPrintContainerMesh, backPrintContainerMesh, baseplateMesh, mapMesh)
        previewMesh.updateSecondRowVisibility(false)

        expect(frontPrintContainerMesh.updateSecondRowVisibility).toHaveBeenCalledWith(geometryOptions)
        expect(baseplateMesh.changeSize).toHaveBeenCalledWith(geometryOptions)
    })
})
