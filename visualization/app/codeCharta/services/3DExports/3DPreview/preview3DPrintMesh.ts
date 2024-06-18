import { Font, FontLoader, Mesh, ShaderMaterial, Vector3 } from "three"
import { ColorRange, NodeMetricData } from "../../../codeCharta.model"
import { BackMWLogoMesh } from "./MeshModels/backMWLogoMesh"
import { BaseplateMesh } from "./MeshModels/baseplateMesh"
import { BackBelowLogoTextMesh } from "./MeshModels/backBelowLogoTextMesh"
import { CodeChartaLogoMesh } from "./MeshModels/codeChartaLogoMesh"
import { CodeChartaTextMesh } from "./MeshModels/codeChartaTextMesh"
import { SecondRowTextMesh } from "./MeshModels/secondRowTextMesh"
import { MetricDescriptionsMesh } from "./MeshModels/metricDescriptionsMesh"
import { GeneralMesh } from "./MeshModels/generalMesh"
import { QrCodeMesh } from "./MeshModels/qrCodeMesh"
import { FrontTextMesh } from "./MeshModels/frontTextMesh"
import { FrontMWLogoMesh } from "./MeshModels/frontMWLogoMesh"
import { CustomLogoMesh } from "./MeshModels/customLogoMesh"
import { MapMesh } from "./MeshModels/mapMesh"
import { TextMesh } from "./MeshModels/textMesh"

export interface GeometryOptions {
    originalMapMesh: Mesh
    width: number
    areaMetricTitle: string
    areaMetricData: NodeMetricData
    heightMetricTitle: string
    heightMetricData: NodeMetricData
    colorMetricTitle: string
    colorMetricData: NodeMetricData
    colorRange: ColorRange
    frontText: string
    secondRowText: string
    qrCodeText: string
    defaultMaterial: ShaderMaterial
    numberOfColors: number
    layerHeight: number
    frontTextSize: number
    secondRowTextSize: number
    secondRowVisible: boolean
    printHeight: number
    mapSideOffset: number
    baseplateHeight: number
    logoSize: number
    backTextSize: number
}

export class Preview3DPrintMesh {
    private font: Font
    private printMesh: Mesh
    private currentSize: Vector3
    private childrenMeshes: Map<string, GeneralMesh>

    constructor(private geometryOptions: GeometryOptions) {
        this.printMesh = new Mesh()
        this.printMesh.name = "PrintMesh"
        this.childrenMeshes = new Map<string, GeneralMesh>()
    }

    async initialize() {
        await this.loadFont()
        await this.createPrintPreviewMesh()
        this.calculateCurrentSize()
    }

    getThreeMesh(): Mesh {
        return this.printMesh
    }

    getMapMesh(): Mesh {
        return this.childrenMeshes.get("Map")
    }

    getSize(): Vector3 {
        return this.currentSize
    }

    async createPrintPreviewMesh() {
        const baseplateMesh = await new BaseplateMesh().init(this.geometryOptions)
        this.printMesh.add(baseplateMesh)
        this.childrenMeshes.set(baseplateMesh.name, baseplateMesh)

        const mapMesh = await new MapMesh().init(this.geometryOptions)
        this.printMesh.add(mapMesh)
        this.childrenMeshes.set(mapMesh.name, mapMesh)

        const frontTextMesh = await new FrontTextMesh(this.font, this.geometryOptions).init(this.geometryOptions)
        this.printMesh.add(frontTextMesh)
        this.childrenMeshes.set(frontTextMesh.name, frontTextMesh)

        const secondRowMesh = await new SecondRowTextMesh(this.font, this.geometryOptions).init(this.geometryOptions)
        this.printMesh.add(secondRowMesh)
        this.childrenMeshes.set(secondRowMesh.name, secondRowMesh)

        const frontMWLogoMesh = await new FrontMWLogoMesh().init(this.geometryOptions)
        this.printMesh.add(frontMWLogoMesh)
        this.childrenMeshes.set(frontMWLogoMesh.name, frontMWLogoMesh)

        const backMWLogoMesh = await new BackMWLogoMesh().init(this.geometryOptions)
        this.printMesh.add(backMWLogoMesh)
        this.childrenMeshes.set(backMWLogoMesh.name, backMWLogoMesh)

        const itsTextMesh = await new BackBelowLogoTextMesh(this.font, this.geometryOptions).init(this.geometryOptions)
        this.printMesh.add(itsTextMesh)
        this.childrenMeshes.set(itsTextMesh.name, itsTextMesh)

        const qrCodeMesh = await new QrCodeMesh().init(this.geometryOptions)
        this.printMesh.add(qrCodeMesh)
        this.childrenMeshes.set(qrCodeMesh.name, qrCodeMesh)

        const codeChartaLogoMesh = await new CodeChartaLogoMesh().init(this.geometryOptions)
        this.printMesh.add(codeChartaLogoMesh)
        this.childrenMeshes.set(codeChartaLogoMesh.name, codeChartaLogoMesh)

        const codeChartaTextMesh = await new CodeChartaTextMesh(this.font, this.geometryOptions).init(this.geometryOptions)
        this.printMesh.add(codeChartaTextMesh)
        this.childrenMeshes.set(codeChartaTextMesh.name, codeChartaTextMesh)

        const metricsMesh = await new MetricDescriptionsMesh(this.font).init(this.geometryOptions)
        this.printMesh.add(metricsMesh)
        this.childrenMeshes.set(metricsMesh.name, metricsMesh)
    }

    async updateSize(wantedWidth: number): Promise<boolean> {
        this.geometryOptions.width = wantedWidth
        const oldWidth = this.currentSize.x

        await Promise.all([...this.childrenMeshes.values()].map(async mesh => mesh.changeSize(this.geometryOptions, oldWidth)))

        this.calculateCurrentSize()
        return this.childrenMeshes.get("QRCode").visible
    }

    updateNumberOfColors(numberOfColors: number) {
        this.geometryOptions.numberOfColors = numberOfColors
        for (const mesh of this.childrenMeshes.values()) {
            mesh.changeColor(numberOfColors)
        }
    }

    async addCustomLogo(dataUrl: string): Promise<void> {
        if (this.childrenMeshes.has("CustomLogo")) {
            this.removeCustomLogo()
        }

        const customLogoMesh = await new CustomLogoMesh(dataUrl).init(this.geometryOptions)
        this.printMesh.add(customLogoMesh)
        this.childrenMeshes.set(customLogoMesh.name, customLogoMesh)
    }

    rotateCustomLogo() {
        const customLogoMesh = this.childrenMeshes.get("CustomLogo") as CustomLogoMesh
        customLogoMesh.rotate()
    }

    flipCustomLogo() {
        const customLogoMesh = this.childrenMeshes.get("CustomLogo") as CustomLogoMesh
        customLogoMesh.flip()
    }

    removeCustomLogo() {
        this.printMesh.remove(this.childrenMeshes.get("CustomLogo"))
        this.childrenMeshes.delete("CustomLogo")
    }

    updateCustomLogoColor(newColor: string) {
        const customLogoMesh = this.childrenMeshes.get("CustomLogo") as CustomLogoMesh
        customLogoMesh.setColor(newColor)
    }

    updateFrontText(frontText: string) {
        this.geometryOptions.frontText = frontText
        const frontTextMesh = this.childrenMeshes.get("FrontText") as FrontTextMesh
        frontTextMesh.updateText(this.geometryOptions)
    }

    updateSecondRowVisibility(isSecondRowVisible: boolean) {
        const baseplateMesh = this.childrenMeshes.get("Baseplate") as BaseplateMesh
        const frontMWLogoMesh = this.childrenMeshes.get("FrontMWLogo") as FrontMWLogoMesh
        const secondRowMesh = this.childrenMeshes.get("SecondRowText") as SecondRowTextMesh
        const customLogoMesh = this.childrenMeshes.get("CustomLogo") as CustomLogoMesh

        if (secondRowMesh.visible === isSecondRowVisible) {
            return
        }
        secondRowMesh.setManualVisibility(isSecondRowVisible)
        this.geometryOptions.secondRowVisible = isSecondRowVisible
        baseplateMesh.changeSize(this.geometryOptions)

        frontMWLogoMesh.changeRelativeSize(this.geometryOptions, isSecondRowVisible)
        customLogoMesh?.changeRelativeSize(this.geometryOptions, isSecondRowVisible)
    }

    updateSecondRowText(secondRowText: string) {
        this.geometryOptions.secondRowText = secondRowText
        ;(this.childrenMeshes.get("SecondRowText") as TextMesh).updateText(this.geometryOptions)
    }

    private async loadFont() {
        const loader = new FontLoader()
        return new Promise<void>((resolve, reject) => {
            loader.load(
                "codeCharta/assets/helvetiker_regular.typeface.json",
                loadedFont => {
                    this.font = loadedFont
                    resolve()
                },
                undefined,
                function (error) {
                    console.error("Error loading font:", error)
                    reject(error)
                }
            )
        })
    }

    private calculateCurrentSize() {
        const mapMesh = this.childrenMeshes.get("Map") as MapMesh
        const baseplateMesh = this.childrenMeshes.get("Baseplate") as BaseplateMesh
        const currentWidth = baseplateMesh.getWidth()
        const currentDepth = baseplateMesh.getDepth()
        const currentHeight = baseplateMesh.getHeight() + mapMesh.getHeight()
        this.currentSize = new Vector3(currentWidth, currentDepth, currentHeight)
    }

    async updateQrCodeText(qrCodeText: string): Promise<void> {
        this.geometryOptions.qrCodeText = qrCodeText
        const qrCodeMesh = this.childrenMeshes.get("QRCode") as QrCodeMesh
        qrCodeMesh.changeText(this.geometryOptions)
    }

    updateQrCodeVisibility(qrCodeVisible: boolean) {
        const qrCodeMesh = this.childrenMeshes.get("QRCode") as QrCodeMesh
        qrCodeMesh.setManualVisibility(qrCodeVisible)
    }
}

export function calculateMaxPossibleWidthForPreview3DPrintMesh(
    maxSize: Vector3,
    mapMesh: Mesh,
    frontTextSize: number,
    baseplateHeight: number,
    mapSideOffset: number
): number {
    const printerWidth = maxSize.x
    const printerDepth = maxSize.y
    const printerHeight = maxSize.z

    const widthFromWidth = printerWidth
    const widthFromDepth = printerDepth - frontTextSize
    if (!mapMesh.geometry.boundingBox) {
        mapMesh.geometry.computeBoundingBox()
    }
    const mapCurrentHeight = mapMesh.geometry.boundingBox.max.z - mapMesh.geometry.boundingBox.min.z
    const widthFromHeight = ((printerHeight - baseplateHeight) * mapMesh.geometry.boundingBox.max.x) / mapCurrentHeight + 2 * mapSideOffset

    return Math.min(widthFromWidth, widthFromDepth, widthFromHeight)
}
