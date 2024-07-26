import { Font, FontLoader, Mesh, ShaderMaterial, Vector3 } from "three"
import { ColorRange, NodeMetricData } from "../../../codeCharta.model"
import { BaseplateMesh } from "./MeshModels/baseplateMesh"
import { GeneralMesh } from "./MeshModels/generalMesh"
import { MapMesh } from "./MeshModels/mapMesh"
import { BackPrintContainerMesh } from "./MeshModels/BackMeshModels/backPrintContainerMesh"
import { FrontPrintContainerMesh } from "./MeshModels/FrontMeshModels/frontPrintContainerMesh"
import font from "three/examples/fonts/helvetiker_regular.typeface.json"

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
}

export class Preview3DPrintMesh {
    //TODO: rename to PrintPreview
    private printMesh: Mesh
    private currentSize: Vector3

    private mapMesh: MapMesh
    private baseplateMesh: BaseplateMesh
    private frontPrintContainerMesh: FrontPrintContainerMesh
    private backPrintContainerMesh: BackPrintContainerMesh

    constructor(private geometryOptions: GeometryOptions) {
        this.printMesh = new Mesh()
        this.printMesh.name = "PrintMesh" //TODO: rename to PrintPreview
    }

    async initialize() {
        await this.createPrintPreviewMesh()
        this.calculateCurrentSize()
    }

    getThreeMesh(): Mesh {
        return this.printMesh
    }

    getMapMesh(): Mesh {
        return this.mapMesh
    }

    getSize(): Vector3 {
        return this.currentSize
    }

    async createPrintPreviewMesh() {
        this.baseplateMesh = await new BaseplateMesh().init(this.geometryOptions)
        this.printMesh.add(this.baseplateMesh)

        this.mapMesh = await new MapMesh().init(this.geometryOptions)
        this.printMesh.add(this.mapMesh)

        this.frontPrintContainerMesh = await new FrontPrintContainerMesh(new Font(font)).init(this.geometryOptions)
        this.printMesh.add(this.frontPrintContainerMesh)

        this.backPrintContainerMesh = await new BackPrintContainerMesh(new Font(font)).init(this.geometryOptions)
        this.printMesh.add(this.backPrintContainerMesh)
    }

    async updateSize(wantedWidth: number): Promise<boolean> {
        this.geometryOptions.width = wantedWidth
        const oldWidth = this.currentSize.x

        await Promise.all(
            [...this.printMesh.children].map(async mesh => {
                if (mesh instanceof GeneralMesh && mesh.isGeneralSizeChangeMesh()) {
                    mesh.changeSize(this.geometryOptions, oldWidth)
                }
            })
        )

        this.calculateCurrentSize()
        return this.backPrintContainerMesh.isQRCodeVisible()
    }

    updateNumberOfColors(numberOfColors: number) {
        this.geometryOptions.numberOfColors = numberOfColors
        for (const mesh of this.printMesh.children) {
            if (mesh instanceof GeneralMesh) {
                mesh.updateColor(numberOfColors)
            }
        }
    }

    async addCustomLogo(dataUrl: string): Promise<void> {
        this.frontPrintContainerMesh.addCustomLogo(dataUrl, this.geometryOptions)
    }

    rotateCustomLogo() {
        this.frontPrintContainerMesh.rotateCustomLogo()
    }

    flipCustomLogo() {
        this.frontPrintContainerMesh.flipCustomLogo()
    }

    removeCustomLogo() {
        this.frontPrintContainerMesh.removeCustomLogo()
    }

    updateCustomLogoColor(newColor: string) {
        this.frontPrintContainerMesh.updateCustomLogoColor(newColor)
    }

    updateFrontText(frontText: string) {
        this.frontPrintContainerMesh.updateFrontText(frontText, this.geometryOptions)
    }

    updateSecondRowVisibility(isSecondRowVisible: boolean) {
        if (this.geometryOptions.secondRowVisible === isSecondRowVisible) {
            return
        }
        this.geometryOptions.secondRowVisible = isSecondRowVisible

        this.frontPrintContainerMesh.updateSecondRowVisibility(this.geometryOptions)
        this.baseplateMesh.changeSize(this.geometryOptions)
    }

    async updateSecondRowText(secondRowText: string) {
        await this.frontPrintContainerMesh.updateSecondRowText(secondRowText, this.geometryOptions)
    }

    private calculateCurrentSize() {
        const currentWidth = this.baseplateMesh.getWidth()
        const currentDepth = this.baseplateMesh.getDepth()
        const currentHeight = this.baseplateMesh.getHeight() + this.mapMesh.getHeight()
        this.currentSize = new Vector3(currentWidth, currentDepth, currentHeight)
    }

    async updateQrCodeText(qrCodeText: string): Promise<void> {
        await this.backPrintContainerMesh.updateQrCodeText(qrCodeText, this.geometryOptions)
    }

    updateQrCodeVisibility(qrCodeVisible: boolean) {
        this.backPrintContainerMesh.updateQrCodeVisibility(qrCodeVisible)
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
