/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    BufferGeometry,
    ExtrudeGeometry,
    Float32BufferAttribute,
    Font,
    FontLoader,
    Mesh,
    MeshBasicMaterial,
    ShaderMaterial,
    TextGeometry,
    Vector3
} from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils"
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
    frontPrintDepth: number
    mapSideOffset: number
    baseplateHeight: number
    logoSize: number
    backTextSize: number
}

export class Preview3DPrintMesh {
    private font: Font
    private printMesh: Mesh
    private currentSize: Vector3
    private mapScalingFactorForSnappingHeights: number

    //Front
    private mapMesh: Mesh
    private baseplateMesh: BaseplateMesh
    private frontTextMesh: Mesh
    private frontMWLogoMesh: Mesh
    private secondRowMesh: SecondRowTextMesh
    private customLogoMesh: Mesh
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
        this.mapScalingFactorForSnappingHeights = 1
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

        this.initMapMesh(this.geometryOptions)
        this.printMesh.add(this.mapMesh)

        this.initFrontText(this.geometryOptions.frontText, this.geometryOptions.width, this.geometryOptions.numberOfColors)
        this.printMesh.add(this.frontTextMesh)

        this.secondRowMesh = await new SecondRowTextMesh(this.font, this.geometryOptions).init(this.geometryOptions)
        this.printMesh.add(this.secondRowMesh)

        await this.initFrontMWLogoMesh(this.geometryOptions.width, this.geometryOptions.numberOfColors)
        this.printMesh.add(this.frontMWLogoMesh)

        await this.initBackMWLogoMesh()
        this.printMesh.add(this.backMWLogoMesh)

        this.itsTextMesh = await new BackBelowLogoTextMesh(this.font).init(this.geometryOptions)
        this.printMesh.add(this.itsTextMesh)

        this.qrCodeMesh = await new QrCodeMesh().init(this.geometryOptions)
        this.printMesh.add(this.qrCodeMesh)

        this.codeChartaLogoMesh = await new CodeChartaLogoMesh().init(this.geometryOptions)
        this.printMesh.add(this.codeChartaLogoMesh)

        this.codeChartaTextMesh = await new CodeChartaTextMesh(this.font).init(this.geometryOptions)
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

        const map = this.mapMesh.geometry
        const scale = (wantedWidth - 2 * this.geometryOptions.mapSideOffset) / (oldWidth - 2 * this.geometryOptions.mapSideOffset)
        map.scale(scale, scale, scale)
        this.snapHeightsToLayerHeight(map)

        this.frontTextMesh.geometry.translate(0, -(wantedWidth - oldWidth) / 2, 0)
        this.updateFrontLogoPosition(this.frontMWLogoMesh, wantedWidth, true)
        if (this.customLogoMesh) {
            this.updateFrontLogoPosition(this.customLogoMesh, wantedWidth, false)
        }

        await this.qrCodeMesh.changeSize(this.geometryOptions)
        const qrCodeVisible = this.qrCodeMesh.visible

        this.calculateCurrentSize()
        return qrCodeVisible
    }

    updateNumberOfColors(mapWithOriginalColors: Mesh, numberOfColors: number) {
        this.updateMapColors(mapWithOriginalColors.geometry, this.mapMesh.geometry, numberOfColors)
        this.printMesh.traverse(child => {
            if (child instanceof Mesh && child.name !== "Map" && child.name !== "PrintMesh") {
                if (child instanceof GeneralMesh) {
                    child.changeColor(numberOfColors)
                } else {
                    this.updateColor(child, numberOfColors) //TODO: delete this
                }
            }
        })
    }

    async addCustomLogo(dataUrl: string): Promise<void> {
        this.customLogoMesh = await this.createSvgMesh(dataUrl, this.geometryOptions.frontPrintDepth, this.geometryOptions.logoSize)

        this.updateFrontLogoPosition(this.customLogoMesh, this.currentSize.x, false)
        this.updateFrontLogoSize(this.customLogoMesh)
        this.customLogoMesh.name = "Custom Logo"

        this.printMesh.attach(this.customLogoMesh)
    }

    rotateCustomLogo() {
        this.customLogoMesh.rotateZ(Math.PI / 2) // Rotate 90 degrees
    }

    flipCustomLogo() {
        this.customLogoMesh.rotateY(Math.PI) // Rotate 180 degrees
    }

    removeCustomLogo() {
        this.printMesh.remove(this.customLogoMesh)
    }

    updateCustomLogoColor(newColor: string) {
        if (this.customLogoMesh.material instanceof MeshBasicMaterial) {
            this.customLogoMesh.material.color.set(newColor)
        } else {
            console.error("Custom Logos material is not an instance of MeshBasicMaterial")
        }
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

    private updateFrontLogoPosition(logoMesh: Mesh, wantedWidth: number, rightSide: boolean) {
        logoMesh.geometry.computeBoundingBox()
        const boundingBox = logoMesh.geometry.boundingBox
        const logoWidth = boundingBox.max.x - boundingBox.min.x
        const logoDepth = boundingBox.max.y - boundingBox.min.y
        const xPosition = wantedWidth / 2 - logoWidth - this.geometryOptions.mapSideOffset * (rightSide ? 1 : -1)
        let yPosition = -logoDepth / 2 - wantedWidth / 2 + this.geometryOptions.frontTextSize / 1.75
        yPosition += this.secondRowMesh.visible ? this.geometryOptions.secondRowTextSize / 1.75 : 0
        logoMesh.position.set(xPosition, yPosition, this.geometryOptions.frontPrintDepth / 2)
    }

    private initMapMesh(geometryOptions: GeometryOptions) {
        const newMapGeometry = geometryOptions.originalMapMesh.geometry.clone()
        newMapGeometry.rotateX(Math.PI / 2)
        this.updateMapGeometry(newMapGeometry, geometryOptions.width, geometryOptions.numberOfColors)
        newMapGeometry.rotateZ(-Math.PI / 2)
        const newMapMesh: Mesh = geometryOptions.originalMapMesh.clone() as Mesh
        newMapMesh.clear()
        newMapMesh.geometry = newMapGeometry
        newMapMesh.name = "Map"
        this.mapMesh = newMapMesh
    }

    private updateMapGeometry(map: BufferGeometry, wantedWidth: number, numberOfColors: number): BufferGeometry {
        const width = wantedWidth - 2 * this.geometryOptions.mapSideOffset

        const normalizeFactor = map.boundingBox.max.x
        const scale = width / normalizeFactor
        map.scale(scale, scale, scale)

        map.translate(-width / 2, width / 2, 0)

        this.snapHeightsToLayerHeight(map)
        this.updateMapColors(map, map, numberOfColors)

        return map
    }

    private snapHeightsToLayerHeight(map: BufferGeometry) {
        map.scale(1, 1, 1 / this.mapScalingFactorForSnappingHeights)

        const startHeight = map.attributes.position.getZ(0)

        let smallestHeight = Number.POSITIVE_INFINITY
        for (let index = 0; index < map.attributes.position.count; index++) {
            const height = Math.abs(map.attributes.position.getZ(index) - startHeight)
            if (height !== 0 && height < smallestHeight) {
                smallestHeight = height
            }
        }

        const wantedHeight = Math.ceil(smallestHeight / this.geometryOptions.layerHeight) * this.geometryOptions.layerHeight
        this.mapScalingFactorForSnappingHeights = wantedHeight / smallestHeight

        map.scale(1, 1, this.mapScalingFactorForSnappingHeights)
    }

    private updateMapColors(mapWithOriginalColors: BufferGeometry, previewMap: BufferGeometry, numberOfColors) {
        const newColors = []

        for (let index = 0; index < mapWithOriginalColors.attributes.color.count; index++) {
            const colorR = mapWithOriginalColors.attributes.color.getX(index)
            const colorG = mapWithOriginalColors.attributes.color.getY(index)
            const colorB = mapWithOriginalColors.attributes.color.getZ(index)
            let newColor: number[]

            if (colorR === colorB && colorR === colorG && colorG === colorB) {
                //all grey values
                newColor = this.getColorArray("Area", numberOfColors)
            } else if (colorR > 0.75 && colorG > 0.75) {
                //yellow
                newColor = this.getColorArray("Neutral Building", numberOfColors)
            } else if (colorR > 0.45 && colorG < 0.1) {
                //red
                newColor = this.getColorArray("Negative Building", numberOfColors)
            } else if (colorR < 5 && colorG > 0.6) {
                //green
                newColor = this.getColorArray("Positive Building", numberOfColors)
            } else {
                console.error("Unknown color")
                newColor = [1, 1, 1]
            }
            newColors.push(...newColor)
        }
        previewMap.setAttribute("color", new Float32BufferAttribute(newColors, 3))
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

    private initFrontText(frontText: string, wantedWidth: number, numberOfColors: number) {
        if (frontText === undefined) {
            frontText = "CodeCharta"
        }
        const textGeometry = this.createFrontTextGeometry(frontText, wantedWidth, this.geometryOptions.frontTextSize)

        const material = new MeshBasicMaterial()
        const textMesh = new Mesh(textGeometry, material)
        textMesh.name = "Front Text"
        this.updateColor(textMesh, numberOfColors)
        this.frontTextMesh = textMesh
    }

    private createFrontTextGeometry(text: string, wantedWidth: number, textSize: number, yOffset = 0) {
        if (!text) {
            text = ""
        }
        const textGeometry = new TextGeometry(text, {
            font: this.font,
            size: textSize,
            height: this.geometryOptions.frontPrintDepth
        })
        textGeometry.center()

        //calculate the bounding box of the text
        textGeometry.computeBoundingBox()
        const textDepth = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y
        textGeometry.translate(
            0,
            -textDepth / 2 - (wantedWidth - this.geometryOptions.mapSideOffset) / 2 - yOffset,
            this.geometryOptions.frontPrintDepth / 2
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

    private async initBackMWLogoMesh() {
        this.backMWLogoMesh = new BackMWLogoMesh()
        await this.backMWLogoMesh.init(this.geometryOptions)
    }

    private async initFrontMWLogoMesh(wantedWidth: number, numberOfColors: number) {
        const filePath = `codeCharta/assets/mw_logo.svg`

        const mwLogoMesh = await this.createSvgMesh(filePath, this.geometryOptions.frontPrintDepth, this.geometryOptions.logoSize)

        mwLogoMesh.geometry.computeBoundingBox()
        const boundingBox = mwLogoMesh.geometry.boundingBox
        const logoWidth = boundingBox.max.x - boundingBox.min.x
        const logoDepth = boundingBox.max.y - boundingBox.min.y
        mwLogoMesh.position.set(
            wantedWidth / 2 - logoWidth - this.geometryOptions.mapSideOffset,
            -logoDepth / 2 - (wantedWidth - this.geometryOptions.mapSideOffset) / 2,
            this.geometryOptions.frontPrintDepth / 2
        )

        mwLogoMesh.name = "Front MW Logo"
        this.updateColor(mwLogoMesh, numberOfColors)
        this.frontMWLogoMesh = mwLogoMesh
    }

    private async createSvgMesh(filePath: string, height: number, size: number): Promise<Mesh> {
        const svgGeometry = await this.createSvgGeometry(filePath)
        svgGeometry.center()
        svgGeometry.rotateZ(Math.PI)
        svgGeometry.rotateY(Math.PI)
        svgGeometry.scale(size, size, height)

        const material = new MeshBasicMaterial()
        const svgMesh = new Mesh(svgGeometry, material)
        svgMesh.name = "Unnamed SVG Mesh"
        return svgMesh
    }

    private async createSvgGeometry(filePath: string): Promise<BufferGeometry> {
        //load the svg file
        const loader = new SVGLoader()
        return new Promise((resolve, reject) => {
            loader.load(
                filePath,
                function (data) {
                    const paths = data.paths
                    const geometries: BufferGeometry[] = []

                    for (const path of paths) {
                        const shapes = path.toShapes(false, true)

                        for (const shape of shapes) {
                            const geometry = new ExtrudeGeometry(shape, {
                                depth: 1,
                                bevelEnabled: false
                            })
                            geometries.push(geometry)
                        }
                    }

                    const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries)

                    mergedGeometry.computeBoundingBox()
                    const width = mergedGeometry.boundingBox.max.x - mergedGeometry.boundingBox.min.x
                    const depth = mergedGeometry.boundingBox.max.y - mergedGeometry.boundingBox.min.y
                    const scale = 1 / Math.max(width, depth)
                    mergedGeometry.scale(scale, scale, 1)

                    resolve(mergedGeometry)
                },
                undefined,
                function (error) {
                    console.error(`Error loading ${filePath}`)
                    reject(error)
                }
            )
        })
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
