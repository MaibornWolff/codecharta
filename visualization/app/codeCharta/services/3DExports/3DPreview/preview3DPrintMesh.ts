/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Font, FontLoader, Mesh, MeshBasicMaterial, ShaderMaterial, TextGeometry, Vector3 } from "three"
import { ColorRange, NodeMetricData } from "../../../codeCharta.model"
import { ManualVisibilityMesh } from "./MeshModels/manualVisibilityMesh"
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

    //Front
    private mapMesh: MapMesh
    private baseplateMesh: BaseplateMesh
    private frontTextMesh: FrontTextMesh
    private frontMWLogoMesh: FrontMWLogoMesh
    private secondRowMesh: SecondRowTextMesh
    private customLogoMesh: CustomLogoMesh
    //Back
    private backMWLogoMesh: BackMWLogoMesh
    private itsTextMesh: BackBelowLogoTextMesh
    private qrCodeMesh: QrCodeMesh
    private codeChartaLogoMesh: CodeChartaLogoMesh
    private codeChartaTextMesh: CodeChartaTextMesh
    private metricsMesh: MetricDescriptionsMesh

    constructor(private geometryOptions: GeometryOptions) {
        this.printMesh = new Mesh()
        this.printMesh.name = "PrintMesh"
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

        this.frontTextMesh = await new FrontTextMesh(this.font, this.geometryOptions).init(this.geometryOptions)
        this.printMesh.add(this.frontTextMesh)

        this.secondRowMesh = await new SecondRowTextMesh(this.font, this.geometryOptions).init(this.geometryOptions)
        this.printMesh.add(this.secondRowMesh)

        this.frontMWLogoMesh = await new FrontMWLogoMesh().init(this.geometryOptions)
        this.printMesh.add(this.frontMWLogoMesh)

        this.backMWLogoMesh = await new BackMWLogoMesh().init(this.geometryOptions)
        this.printMesh.add(this.backMWLogoMesh)

        this.itsTextMesh = await new BackBelowLogoTextMesh(this.font, this.geometryOptions).init(this.geometryOptions)
        this.printMesh.add(this.itsTextMesh)

        this.qrCodeMesh = await new QrCodeMesh().init(this.geometryOptions)
        this.printMesh.add(this.qrCodeMesh)

        this.codeChartaLogoMesh = await new CodeChartaLogoMesh().init(this.geometryOptions)
        this.printMesh.add(this.codeChartaLogoMesh)

        this.codeChartaTextMesh = await new CodeChartaTextMesh(this.font, this.geometryOptions).init(this.geometryOptions)
        this.printMesh.add(this.codeChartaTextMesh)

        this.metricsMesh = await new MetricDescriptionsMesh(this.font).init(this.geometryOptions)
        this.printMesh.add(this.metricsMesh)
    }

    async updateSize(wantedWidth: number): Promise<boolean> {
        this.geometryOptions.width = wantedWidth
        const oldWidth = this.currentSize.x

        await this.baseplateMesh.changeSize(this.geometryOptions)
        await this.secondRowMesh.changeSize(this.geometryOptions, oldWidth)
        await this.backMWLogoMesh.changeSize(this.geometryOptions, oldWidth)
        await this.itsTextMesh.changeSize(this.geometryOptions, oldWidth)
        await this.codeChartaLogoMesh.changeSize(this.geometryOptions, oldWidth)
        await this.codeChartaTextMesh.changeSize(this.geometryOptions, oldWidth)
        await this.metricsMesh.changeSize(this.geometryOptions, oldWidth)
        await this.frontTextMesh.changeSize(this.geometryOptions, oldWidth)
        await this.frontMWLogoMesh.changeSize(this.geometryOptions, oldWidth)
        await this.mapMesh.changeSize(this.geometryOptions, oldWidth)

        if (this.customLogoMesh) {
            await this.customLogoMesh.changeSize(this.geometryOptions, oldWidth)
        }

        await this.qrCodeMesh.changeSize(this.geometryOptions)
        const qrCodeVisible = this.qrCodeMesh.visible

        this.calculateCurrentSize()
        return qrCodeVisible
    }

    updateNumberOfColors(mapWithOriginalColors: Mesh, numberOfColors: number) {
        this.printMesh.traverse(child => {
            if (child instanceof Mesh && child.name !== "PrintMesh") {
                if (child instanceof GeneralMesh) {
                    child.changeColor(numberOfColors)
                } else {
                    this.updateColor(child, numberOfColors) //TODO: delete this
                }
            }
        })
    }

    async addCustomLogo(dataUrl: string): Promise<void> {
        this.customLogoMesh = await new CustomLogoMesh(dataUrl).init(this.geometryOptions)
        this.printMesh.add(this.customLogoMesh)
    }

    rotateCustomLogo() {
        this.customLogoMesh.rotate()
    }

    flipCustomLogo() {
        this.customLogoMesh.flip()
    }

    removeCustomLogo() {
        this.printMesh.remove(this.customLogoMesh)
    }

    updateCustomLogoColor(newColor: string) {
        this.customLogoMesh.setColor(newColor)
    }

    updateFrontText(frontText: string) {
        this.frontTextMesh.geometry.dispose()
        this.frontTextMesh.geometry = this.createFrontTextGeometry(frontText, this.currentSize.x, this.geometryOptions.frontTextSize)
    }

    updateSecondRowVisibility(isSecondRowVisible: boolean) {
        if (this.secondRowMesh.visible === isSecondRowVisible) {
            return
        }
        this.secondRowMesh.setManualVisibility(isSecondRowVisible)
        this.geometryOptions.secondRowVisible = isSecondRowVisible
        this.baseplateMesh.changeSize(this.geometryOptions)

        this.updateFrontLogoSize(this.frontMWLogoMesh)
        this.updateFrontLogoSize(this.customLogoMesh)
    }

    updateSecondRowText(secondRowText: string) {
        this.secondRowMesh.geometry.dispose()
        this.secondRowMesh.geometry = this.createFrontTextGeometry(
            secondRowText,
            this.currentSize.x,
            this.geometryOptions.secondRowTextSize,
            this.geometryOptions.frontTextSize + this.geometryOptions.secondRowTextSize / 2
        )
    }

    private updateFrontLogoSize(logoMesh: Mesh) {
        if (logoMesh) {
            const scale = this.secondRowMesh.visible
                ? (this.geometryOptions.frontTextSize + this.geometryOptions.secondRowTextSize) / this.geometryOptions.frontTextSize
                : 1
            logoMesh.scale.x = scale
            logoMesh.scale.y = scale
            logoMesh.translateY(
                this.secondRowMesh.visible ? -this.geometryOptions.secondRowTextSize : this.geometryOptions.secondRowTextSize
            )
        }
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
        this.mapMesh.geometry.computeBoundingBox()
        const boundingBoxMap = this.mapMesh.geometry.boundingBox

        const currentWidth = this.baseplateMesh.getWidth()
        const currentDepth = this.baseplateMesh.getDepth()
        const currentHeight = this.baseplateMesh.getHeight() + boundingBoxMap.max.z - boundingBoxMap.min.z
        this.currentSize = new Vector3(currentWidth, currentDepth, currentHeight)
    }

    private updateColor(mesh: Mesh, numberOfColors: number) {
        if (mesh instanceof ManualVisibilityMesh) {
            mesh.setCurrentNumberOfColors(numberOfColors)
        }

        if (mesh.material instanceof MeshBasicMaterial) {
            const colorArray = this.getColorArray(mesh.name, numberOfColors)
            mesh.material.color.setRGB(colorArray[0], colorArray[1], colorArray[2])
        } else if (mesh.material instanceof ShaderMaterial) {
            mesh.material.defaultAttributeValues.color = this.getColorArray(mesh.name, numberOfColors)
        }
    }

    private getColorArray(partName: string, numberOfColors: number): number[] {
        const getBuildingColor = () => (numberOfColors < 4 ? [1, 1, 1] : [0, 1, 0])
        const getNeutralBuildingColor = () => (numberOfColors < 4 ? [1, 1, 1] : [1, 1, 0])
        const getNegativeBuildingColor = () => (numberOfColors < 4 ? [1, 1, 1] : [1, 0, 0])
        const getBaseplateColor = () => {
            if (numberOfColors === 1) {
                return [1, 1, 1]
            }
            return [0.5, 0.5, 0.5]
        }
        const getFrontPrintAndLogoColor = () => {
            if (numberOfColors < 4) {
                return [1, 1, 1]
            }
            if (numberOfColors === 4) {
                return [1, 1, 0]
            }
            return [1, 1, 1]
        }
        const getBackTextAndLogoColor = () => {
            if (numberOfColors === 1) {
                return [0, 0, 1]
            }
            if (numberOfColors < 4) {
                return [1, 1, 1]
            }
            if (numberOfColors === 4) {
                return [1, 1, 0]
            }
            return [1, 1, 1]
        }
        const getMetricColorTextColor = (colorWhenMoreThan3: number[]) => {
            if (numberOfColors < 4) {
                return [0, 0, 1]
            }
            return colorWhenMoreThan3
        }

        const colorFunctions = {
            "Positive Building": getBuildingColor,
            "Neutral Building": getNeutralBuildingColor,
            "Negative Building": getNegativeBuildingColor,
            Baseplate: getBaseplateColor,
            Area: getBaseplateColor,
            "Front MW Logo": getFrontPrintAndLogoColor,
            "Front Text": getFrontPrintAndLogoColor,
            "Second Row Text": getFrontPrintAndLogoColor,
            "Back MW Logo": getBackTextAndLogoColor,
            "ITS Text": getBackTextAndLogoColor,
            "CodeCharta Logo": getBackTextAndLogoColor,
            "Metric Text": getBackTextAndLogoColor,
            "Metric Text Part 0": getBackTextAndLogoColor,
            "Metric Text Part 1": () => getMetricColorTextColor([0, 1, 0]),
            "Metric Text Part 2": getBackTextAndLogoColor,
            "Metric Text Part 3": () => getMetricColorTextColor([1, 1, 0]),
            "Metric Text Part 4": getBackTextAndLogoColor,
            "Metric Text Part 5": () => getMetricColorTextColor([1, 0, 0]),
            QRCode: getBackTextAndLogoColor
        }

        if (partName in colorFunctions) {
            return colorFunctions[partName]()
        }
        console.warn("Unknown object:", partName, "Did you forget to add it to colorFunctions in the getColorArray method?")
        return [0, 1, 1]
    }

    private createFrontTextGeometry(text: string, wantedWidth: number, textSize: number, yOffset = 0) {
        if (!text) {
            text = ""
        }
        const textGeometry = new TextGeometry(text, {
            font: this.font,
            size: textSize,
            height: this.geometryOptions.printHeight
        })
        textGeometry.center()

        //calculate the bounding box of the text
        textGeometry.computeBoundingBox()
        const textDepth = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y
        textGeometry.translate(
            0,
            -textDepth / 2 - (wantedWidth - this.geometryOptions.mapSideOffset) / 2 - yOffset,
            this.geometryOptions.printHeight / 2
        )
        return textGeometry
    }

    async updateQrCodeText(qrCodeText: string): Promise<void> {
        this.geometryOptions.qrCodeText = qrCodeText
        this.qrCodeMesh.changeText(this.geometryOptions)
    }

    updateQrCodeVisibility(qrCodeVisible: boolean) {
        this.qrCodeMesh.setManualVisibility(qrCodeVisible)
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
