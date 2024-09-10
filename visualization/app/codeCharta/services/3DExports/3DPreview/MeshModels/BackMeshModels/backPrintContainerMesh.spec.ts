import { Font } from "three/examples/jsm/loaders/FontLoader"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { BackPrintContainerMesh } from "./backPrintContainerMesh"
import { BackMWLogoMesh } from "./backMWLogoMesh"
import { BackBelowLogoTextMesh } from "./backBelowLogoTextMesh"
import { QrCodeMesh } from "./qrCodeMesh"
import { CodeChartaLogoMesh } from "./codeChartaLogoMesh"
import { CodeChartaTextMesh } from "./codeChartaTextMesh"
import { MetricDescriptionsContainerMesh } from "./metricDescriptionsContainerMesh"

jest.mock("./backMWLogoMesh", () => {
    return {
        BackMWLogoMesh: jest.fn().mockImplementation(function (this: any) {
            this.init = jest.fn().mockResolvedValue(undefined)
            this.add = jest.fn()
            this.remove = jest.fn()
            this.visible = true
        })
    }
})

jest.mock("./backBelowLogoTextMesh", () => {
    return {
        BackBelowLogoTextMesh: jest.fn().mockImplementation(function (this: any) {
            this.init = jest.fn().mockResolvedValue(undefined)
            this.add = jest.fn()
            this.remove = jest.fn()
            this.visible = true
        })
    }
})

jest.mock("./qrCodeMesh", () => {
    return {
        QrCodeMesh: jest.fn().mockImplementation(function (this: any) {
            this.init = jest.fn().mockResolvedValue(undefined)
            this.changeText = jest.fn().mockResolvedValue(undefined)
            this.setManualVisibility = jest.fn()
            this.add = jest.fn()
            this.remove = jest.fn()
            this.visible = true
        })
    }
})

jest.mock("./codeChartaLogoMesh", () => {
    return {
        CodeChartaLogoMesh: jest.fn().mockImplementation(function (this: any) {
            this.init = jest.fn().mockResolvedValue(undefined)
            this.add = jest.fn()
            this.remove = jest.fn()
            this.visible = true
        })
    }
})

jest.mock("./codeChartaTextMesh", () => {
    return {
        CodeChartaTextMesh: jest.fn().mockImplementation(function (this: any) {
            this.init = jest.fn().mockResolvedValue(undefined)
            this.add = jest.fn()
            this.remove = jest.fn()
            this.visible = true
        })
    }
})

jest.mock("./metricDescriptionsContainerMesh", () => {
    return {
        MetricDescriptionsContainerMesh: jest.fn().mockImplementation(function (this: any) {
            this.init = jest.fn().mockResolvedValue(undefined)
            this.add = jest.fn()
            this.remove = jest.fn()
            this.visible = true
        })
    }
})

describe("BackPrintContainerMesh", () => {
    let font: Font
    let geometryOptions: GeometryOptions

    beforeEach(() => {
        font = new Font(font)
        geometryOptions = {
            width: 100,
            printHeight: 10,
            baseplateHeight: 20,
            qrCodeText: "qrCodeText"
        } as GeometryOptions
    })

    it("should initialize all children meshes and add them to the container", async () => {
        const backPrintContainerMesh = new BackPrintContainerMesh(font)
        await backPrintContainerMesh.init(geometryOptions)

        const childrenMeshes = backPrintContainerMesh.getChildrenMeshes()
        expect(childrenMeshes.size).toBe(6)
        expect(childrenMeshes.get("BackMWLogo")).toBeInstanceOf(BackMWLogoMesh)
        expect(childrenMeshes.get("BackBelowLogoText")).toBeInstanceOf(BackBelowLogoTextMesh)
        expect(childrenMeshes.get("QrCode")).toBeInstanceOf(QrCodeMesh)
        expect(childrenMeshes.get("CodeChartaLogo")).toBeInstanceOf(CodeChartaLogoMesh)
        expect(childrenMeshes.get("CodeChartaText")).toBeInstanceOf(CodeChartaTextMesh)
        expect(childrenMeshes.get("MetricDescriptionsContainer")).toBeInstanceOf(MetricDescriptionsContainerMesh)
    })

    it("should scale children meshes when changing size", async () => {
        const backPrintContainerMesh = new BackPrintContainerMesh(font)
        await backPrintContainerMesh.init(geometryOptions)

        backPrintContainerMesh.scale.set(1, 1, 1)

        const oldWidth = 100
        const scaleFactor = geometryOptions.width / oldWidth
        backPrintContainerMesh.changeSize(geometryOptions, oldWidth)

        expect(backPrintContainerMesh.scale.x).toBeCloseTo(scaleFactor)
        expect(backPrintContainerMesh.scale.y).toBeCloseTo(scaleFactor)
        expect(backPrintContainerMesh.scale.z).toBe(1)
    })

    it("should correctly update the QR code text", async () => {
        const backPrintContainerMesh = new BackPrintContainerMesh(font)
        await backPrintContainerMesh.init(geometryOptions)

        const newQrCodeText = "newQrCodeText"
        await backPrintContainerMesh.updateQrCodeText(newQrCodeText, geometryOptions)

        const qrCodeMesh = backPrintContainerMesh.getChildrenMeshes().get("QrCode") as QrCodeMesh
        expect(geometryOptions.qrCodeText).toBe(newQrCodeText)
        expect(qrCodeMesh.changeText).toHaveBeenCalledWith(geometryOptions)
    })

    it("should correctly update the QR code visibility", async () => {
        const backPrintContainerMesh = new BackPrintContainerMesh(font)
        await backPrintContainerMesh.init(geometryOptions)

        backPrintContainerMesh.updateQrCodeVisibility(false)
        let qrCodeMesh = backPrintContainerMesh.getChildrenMeshes().get("QrCode") as QrCodeMesh
        expect(qrCodeMesh.setManualVisibility).toHaveBeenCalledWith(false)

        backPrintContainerMesh.updateQrCodeVisibility(true)
        qrCodeMesh = backPrintContainerMesh.getChildrenMeshes().get("QrCode") as QrCodeMesh
        expect(qrCodeMesh.setManualVisibility).toHaveBeenCalledWith(true)
    })

    it("should return the correct QR code visibility", async () => {
        const backPrintContainerMesh = new BackPrintContainerMesh(font)
        await backPrintContainerMesh.init(geometryOptions)

        const qrCodeMesh = backPrintContainerMesh.getChildrenMeshes().get("QrCode") as QrCodeMesh
        qrCodeMesh.visible = true
        expect(backPrintContainerMesh.isQRCodeVisible()).toBe(true)

        qrCodeMesh.visible = false
        expect(backPrintContainerMesh.isQRCodeVisible()).toBe(false)
    })
})
