import {
    Box3,
    BoxGeometry,
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
import * as QRCode from "qrcode"
import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { BackMWLogoMesh } from "./backMWLogoMesh"
import { BaseplateMesh } from "./baseplateMesh"

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
    private secondRowMesh: ManualVisibilityMesh
    private customLogoMesh: Mesh
    //Back
    private backMWLogoMesh: BackMWLogoMesh
    private itsTextMesh: ManualVisibilityMesh
    private qrCodeMesh: ManualVisibilityMesh
    private codeChartaLogoMesh: ManualVisibilityMesh
    private metricsMesh: ManualVisibilityMesh

    private geometryOptions: GeometryOptions

    async initialize(geometryOptions: GeometryOptions) {
        this.printMesh = new Mesh()
        this.printMesh.name = "PrintMesh"
        this.mapScalingFactorForSnappingHeights = 1
        this.geometryOptions = geometryOptions

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
        await this.createBaseplateMesh()

        this.initMapMesh(this.geometryOptions)
        this.printMesh.add(this.mapMesh)

        this.initFrontText(this.geometryOptions.frontText, this.geometryOptions.width, this.geometryOptions.numberOfColors)
        this.printMesh.attach(this.frontTextMesh)

        this.initSecondRowText(this.geometryOptions.secondRowText, this.geometryOptions.width, this.geometryOptions.numberOfColors)
        this.printMesh.attach(this.secondRowMesh)

        await this.initFrontMWLogoMesh(this.geometryOptions.width, this.geometryOptions.numberOfColors)
        this.printMesh.add(this.frontMWLogoMesh)

        await this.initBackMWLogoMesh()
        this.printMesh.add(this.backMWLogoMesh)

        await this.initBackITSTextMesh(this.geometryOptions.width, this.geometryOptions.numberOfColors)
        this.printMesh.add(this.itsTextMesh)

        await this.initQRCodeMesh(this.geometryOptions.qrCodeText, this.geometryOptions.width, this.geometryOptions.numberOfColors)
        this.printMesh.add(this.qrCodeMesh)

        await this.initCodeChartaMesh(this.geometryOptions.width, this.geometryOptions.numberOfColors)
        this.printMesh.add(this.codeChartaLogoMesh)

        await this.initMetricsMesh(this.geometryOptions)
        this.printMesh.add(this.metricsMesh)
    }

    private async createBaseplateMesh() {
        this.baseplateMesh = new BaseplateMesh()
        this.baseplateMesh.init(this.geometryOptions)
        this.printMesh.add(this.baseplateMesh)
    }

    async updateSize(wantedWidth: number): Promise<boolean> {
        this.geometryOptions.width = wantedWidth
        const currentWidth = this.currentSize.x
        let qrCodeVisible = this.qrCodeMesh.manualVisibility

        await this.baseplateMesh.changeSize(this.geometryOptions, currentWidth)

        for (const child of this.printMesh.children) {
            if (child instanceof Mesh) {
                switch (child.name) {
                    case "Map": {
                        const map = child.geometry
                        const scale =
                            (wantedWidth - 2 * this.geometryOptions.mapSideOffset) / (currentWidth - 2 * this.geometryOptions.mapSideOffset)
                        map.scale(scale, scale, scale)
                        this.snapHeightsToLayerHeight(map)
                        break
                    }

                    case "Front Text": {
                        const text = child.geometry
                        text.translate(0, -(wantedWidth - currentWidth) / 2, 0)
                        break
                    }
                    case "Second Row Text": {
                        const text = child.geometry
                        text.translate(0, -(wantedWidth - currentWidth) / 2, 0)
                        break
                    }
                    case "Front MW Logo":
                        this.updateFrontLogoPosition(child, wantedWidth, true)
                        break

                    case "Custom Logo":
                        this.updateFrontLogoPosition(child, wantedWidth, false)
                        break

                    case "Back MW Logo":
                        if (child instanceof ManualVisibilityMesh) {
                            this.backMWLogoMesh.changeSize(this.geometryOptions, currentWidth)
                            this.scaleBacktext(child, wantedWidth / currentWidth)
                        } else {
                            console.error("Back MW Logo is not an instance of ManualVisibilityMesh")
                        }
                        break

                    case "ITS Text":
                        if (child instanceof ManualVisibilityMesh) {
                            this.scaleBacktext(child, wantedWidth / currentWidth)
                        } else {
                            console.error("Back MW Logo is not an instance of ManualVisibilityMesh")
                        }
                        break

                    case "QrCode":
                        if (child instanceof ManualVisibilityMesh) {
                            this.positionQrCodeMesh(child, wantedWidth)
                            if (wantedWidth < 280) {
                                this.qrCodeMesh.manualVisibility = false
                                this.qrCodeMesh.updateVisibility()
                                qrCodeVisible = false
                            }
                        } else {
                            console.error("QrCode is not an instance of ManualVisibilityMesh")
                        }
                        break

                    case "CodeCharta Logo":
                        if (child instanceof ManualVisibilityMesh) {
                            this.scaleBacktext(child, wantedWidth / currentWidth)
                        } else {
                            console.error("CodeCharta Logo is not an instance of ManualVisibilityMesh")
                        }
                        break

                    case "Metric Text":
                        if (child instanceof ManualVisibilityMesh) {
                            this.scaleBacktext(child, wantedWidth / currentWidth)
                            if (child.visible) {
                                this.xCenterMetricsMesh(child)
                            }
                        } else {
                            console.error("Metric Text is not an instance of ManualVisibilityMesh")
                        }
                        break

                    default:
                        break
                }
            }
        }

        this.calculateCurrentSize()
        return qrCodeVisible
    }

    updateNumberOfColors(mapWithOriginalColors: Mesh, numberOfColors: number) {
        this.updateMapColors(mapWithOriginalColors.geometry, this.mapMesh.geometry, numberOfColors)
        this.printMesh.traverse(child => {
            if (child instanceof Mesh && child.name !== "Map" && child.name !== "PrintMesh") {
                this.updateColor(child, numberOfColors)
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

        this.secondRowMesh.manualVisibility = isSecondRowVisible
        this.secondRowMesh.updateVisibility()
        this.geometryOptions.secondRowVisible = isSecondRowVisible
        this.baseplateMesh.changeSize(this.geometryOptions, this.geometryOptions.width)

        this.updateFrontLogoSize(this.frontMWLogoMesh)
        this.updateFrontLogoSize(this.customLogoMesh)
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

    updateSecondRowText(secondRowText: string) {
        this.secondRowMesh.geometry.dispose()
        this.secondRowMesh.geometry = this.createFrontTextGeometry(
            secondRowText,
            this.currentSize.x,
            this.geometryOptions.secondRowTextSize,
            this.geometryOptions.frontTextSize + this.geometryOptions.secondRowTextSize / 2
        )
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
        const newMapGeometry = this.geometryOptions.originalMapMesh.geometry.clone()
        newMapGeometry.rotateX(Math.PI / 2)
        this.updateMapGeometry(newMapGeometry, this.geometryOptions.width, this.geometryOptions.numberOfColors)
        newMapGeometry.rotateZ(-Math.PI / 2)
        const newMapMesh: Mesh = this.geometryOptions.originalMapMesh.clone() as Mesh
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
            mesh.updateVisibilityBecauseOfColor(numberOfColors)
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
            QrCode: getBackTextAndLogoColor
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

    private initSecondRowText(secondRowText: string, wantedWidth: number, numberOfColors: number) {
        const textGeometry = this.createFrontTextGeometry(
            secondRowText,
            wantedWidth,
            this.geometryOptions.secondRowTextSize,
            this.geometryOptions.frontTextSize + this.geometryOptions.secondRowTextSize / 2
        )

        const material = new MeshBasicMaterial()
        const textMesh = new ManualVisibilityMesh(textGeometry, material, 1, false, 1)
        textMesh.name = "Second Row Text"
        this.updateColor(textMesh, numberOfColors)
        this.secondRowMesh = textMesh
    }

    private async initQRCodeMesh(qrCodeText: string, wantedWidth: number, numberOfColors: number) {
        const qrCodeGeometry = await this.createQrCodeGeometry(qrCodeText)
        const qrCodeMesh = new ManualVisibilityMesh(qrCodeGeometry, undefined, 0.1)
        qrCodeMesh.name = "QrCode"
        qrCodeMesh.manualVisibility = false
        this.positionQrCodeMesh(qrCodeMesh, wantedWidth)
        this.updateColor(qrCodeMesh, numberOfColors)
        this.qrCodeMesh = qrCodeMesh
    }

    private positionQrCodeMesh(qrCodeMesh: Mesh, wantedWidth: number) {
        qrCodeMesh.position.x = wantedWidth / 2 - this.geometryOptions.mapSideOffset
        qrCodeMesh.position.y = wantedWidth / 2 - this.geometryOptions.mapSideOffset
    }

    private async createQrCodeGeometry(text: string) {
        if (!text || text.length === 0) {
            return new BufferGeometry()
        }

        const canvas = document.createElement("canvas")
        await QRCode.toCanvas(canvas, text, { errorCorrectionLevel: "M" })

        const context = canvas.getContext("2d")
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        const qrCodeGeometries: BufferGeometry[] = []
        const pixelSize = 50 / imageData.width

        // Loop over each pixel in the image
        for (let y = 0; y < imageData.height; y++) {
            for (let x = 0; x < imageData.width; x++) {
                const index = (y * imageData.width + x) * 4
                if (data[index] !== 0) {
                    const geometry = new BoxGeometry(pixelSize, pixelSize, this.geometryOptions.baseplateHeight / 2)
                    geometry.translate(-x * pixelSize, -y * pixelSize, (-this.geometryOptions.baseplateHeight * 3) / 4)
                    qrCodeGeometries.push(geometry)
                }
            }
        }

        const qrCodeGeometry = BufferGeometryUtils.mergeBufferGeometries(qrCodeGeometries)
        return qrCodeGeometry
    }

    async updateQrCodeText(qrCodeText: string): Promise<void> {
        this.qrCodeMesh.geometry = await this.createQrCodeGeometry(qrCodeText)
        return
    }

    updateQrCodeVisibility(qrCodeVisible: boolean) {
        this.qrCodeMesh.manualVisibility = qrCodeVisible
        this.qrCodeMesh.updateVisibility()
    }

    private async initMetricsMesh(geometryOptions: GeometryOptions) {
        const { areaIcon, areaIconScale, areaText } = this.createAreaAttributes(
            this.geometryOptions.areaMetricTitle,
            this.geometryOptions.areaMetricData
        )
        const { heightIcon, heightIconScale, heightText } = this.createHeightAttributes(
            this.geometryOptions.heightMetricTitle,
            this.geometryOptions.heightMetricData
        )
        const { colorIcon, colorIconScale, colorTextNameAndTitle, colorTextValueRanges } = this.createColorAttributes(
            this.geometryOptions.colorMetricTitle,
            this.geometryOptions.colorMetricData,
            this.geometryOptions.colorRange
        )

        const icons = [areaIcon, heightIcon, colorIcon].map(icon => `codeCharta/assets/${icon}`)
        const iconScales = [areaIconScale, heightIconScale, colorIconScale]
        const whiteTexts = [areaText, heightText, colorTextNameAndTitle]

        const whiteBackGeometries = await this.createWhiteBackGeometries(icons, iconScales, whiteTexts)
        const mergedWhiteBackGeometry = BufferGeometryUtils.mergeBufferGeometries(whiteBackGeometries)

        const material = new MeshBasicMaterial()
        const metricsMesh = new ManualVisibilityMesh(mergedWhiteBackGeometry, material, 1)

        const coloredBackTextGeometries = this.createColoredBackTextGeometries(colorTextValueRanges, this.geometryOptions.numberOfColors)
        for (const colorTextGeometry of coloredBackTextGeometries) {
            metricsMesh.add(colorTextGeometry)
        }
        metricsMesh.name = "Metric Text"
        this.updateColor(metricsMesh, this.geometryOptions.numberOfColors)
        const scaleFactor = (this.geometryOptions.width - this.geometryOptions.mapSideOffset * 2) / 200
        this.scaleBacktext(metricsMesh, scaleFactor)
        if (metricsMesh.visible) {
            this.xCenterMetricsMesh(metricsMesh)
        }
        this.metricsMesh = metricsMesh
    }

    private xCenterMetricsMesh(metricsMesh: Mesh) {
        //compute bounding box of the mesh and center it in the x direction
        let boundingBox = new Box3()
        metricsMesh.traverse(child => {
            if (child instanceof Mesh) {
                child.geometry.computeBoundingBox()
                boundingBox = boundingBox.union(child.geometry.boundingBox)
            }
        })
        metricsMesh.position.x = (Math.abs(boundingBox.max.x - boundingBox.min.x) * metricsMesh.scale.x) / 2
    }

    private createColoredBackTextGeometries(colorTextValueRanges: string[], numberOfColors: number) {
        const colorTextGeometries = []
        let xOffset = -10
        for (let index = 0; index < colorTextValueRanges.length; index += 1) {
            const textGeometry = new TextGeometry(`\n\n${colorTextValueRanges[index]}`, {
                font: this.font,
                size: this.geometryOptions.backTextSize,
                height: this.geometryOptions.baseplateHeight / 2
            })
            textGeometry.rotateY(Math.PI)
            textGeometry.translate(xOffset, -35 * 2 + this.geometryOptions.backTextSize - 20, -this.geometryOptions.baseplateHeight / 2)
            const material = new MeshBasicMaterial()
            const textMesh = new Mesh(textGeometry, material)
            textMesh.name = `Metric Text Part ${index}`
            this.updateColor(textMesh, numberOfColors)
            colorTextGeometries.push(textMesh)

            if (index !== colorTextValueRanges.length - 1) {
                textGeometry.computeBoundingBox()
                xOffset = textGeometry.boundingBox.min.x
            }
        }
        return colorTextGeometries
    }

    private async createWhiteBackGeometries(icons: string[], iconScales: number[], whiteTexts: string[]) {
        const backGeometries = []
        for (const [index, icon] of icons.entries()) {
            const iconGeometry = await this.createSvgGeometry(icon)
            const iconScale = iconScales[index]

            iconGeometry.center()
            iconGeometry.rotateY(Math.PI)
            iconGeometry.rotateX(Math.PI)
            iconGeometry.scale(iconScale, iconScale, this.geometryOptions.baseplateHeight / 2)

            iconGeometry.translate(0, -35 * index - 20, -((this.geometryOptions.baseplateHeight * 3) / 4))
            backGeometries.push(iconGeometry)

            const text = whiteTexts[index]
            const textGeometry = new TextGeometry(text, {
                font: this.font,
                size: this.geometryOptions.backTextSize,
                height: this.geometryOptions.baseplateHeight / 2
            })
            textGeometry.rotateY(Math.PI)

            textGeometry.translate(-10, -35 * index + this.geometryOptions.backTextSize - 20, -this.geometryOptions.baseplateHeight / 2)

            backGeometries.push(textGeometry)
        }
        return backGeometries
    }

    private createColorAttributes(colorMetricTitle: string, colorMetricData: NodeMetricData, colorRange: ColorRange) {
        const colorIcon = "color_icon_for_3D_print.svg"
        const colorIconScale = 10
        const colorTextNameAndTitle = `${colorMetricData.name}\n` + `${colorMetricTitle}\n`
        const colorTextValueRanges = [
            `Value ranges:`,
            ` ${colorMetricData.minValue} - ${colorRange.from - 1}`,
            ` /`,
            ` ${colorRange.from} - ${colorRange.to - 1}`,
            ` /`,
            ` ${colorRange.to} - ${colorMetricData.maxValue}`
        ]
        return { colorIcon, colorIconScale, colorTextNameAndTitle, colorTextValueRanges }
    }

    private createHeightAttributes(heightMetricTitle: string, heightMetricData: NodeMetricData) {
        const heightIcon = "height_icon_for_3D_print.svg"
        const heightIconScale = 12
        const heightText =
            `${heightMetricData.name}\n` +
            `${heightMetricTitle}\n` +
            `Value range: ${heightMetricData.minValue} - ${heightMetricData.maxValue}`
        return { heightIcon, heightIconScale, heightText }
    }

    private createAreaAttributes(areaMetricTitle: string, areaMetricData: NodeMetricData) {
        const areaIcon = "area_icon_for_3D_print.svg"
        const areaIconScale = 10
        const areaText =
            `${areaMetricData.name}\n` + `${areaMetricTitle}\n` + `Value range:  ${areaMetricData.minValue} - ${areaMetricData.maxValue}`
        return { areaIcon, areaIconScale, areaText }
    }

    private scaleBacktext(backTextMesh: ManualVisibilityMesh, scaleFactor: number) {
        backTextMesh.scale.set(backTextMesh.scale.x * scaleFactor, backTextMesh.scale.y * scaleFactor, backTextMesh.scale.z)

        backTextMesh.updateVisibility()
    }

    private async initCodeChartaMesh(wantedWidth: number, numberOfColors: number) {
        const logoGeometry = await this.createCodeChartaLogo()
        const textGeometry = this.createCodeChartaText()
        const logoAndTextGeometry = BufferGeometryUtils.mergeBufferGeometries([logoGeometry, textGeometry])

        const material = new MeshBasicMaterial()

        const codeChartaMesh = new ManualVisibilityMesh(logoAndTextGeometry, material, 0.8)
        codeChartaMesh.name = "CodeCharta Logo"
        this.updateColor(codeChartaMesh, numberOfColors)
        const scaleFactor = (wantedWidth - this.geometryOptions.mapSideOffset * 2) / 200
        this.scaleBacktext(codeChartaMesh, scaleFactor)
        this.codeChartaLogoMesh = codeChartaMesh
    }

    private async createCodeChartaLogo() {
        const logoGeometry = await this.createSvgGeometry("codeCharta/assets/codecharta_logo.svg")
        logoGeometry.center()
        logoGeometry.rotateZ(Math.PI)

        const logoScale = 25
        logoGeometry.scale(logoScale, logoScale, this.geometryOptions.baseplateHeight / 2)
        logoGeometry.translate(0, 20, -((this.geometryOptions.baseplateHeight * 3) / 4))

        return logoGeometry
    }

    private createCodeChartaText() {
        const textGeometry = new TextGeometry("github.com/MaibornWolff/codecharta", {
            font: this.font,
            size: this.geometryOptions.backTextSize,
            height: this.geometryOptions.baseplateHeight / 2
        })
        textGeometry.center()
        textGeometry.rotateY(Math.PI)

        textGeometry.translate(0, 5, -((this.geometryOptions.baseplateHeight * 3) / 4))

        return textGeometry
    }

    private async initBackITSTextMesh(wantedWidth: number, numberOfColors: number) {
        const ITSNameTextGeometry = new TextGeometry("IT Stabilization & Modernization", {
            font: this.font,
            size: this.geometryOptions.backTextSize,
            height: this.geometryOptions.baseplateHeight / 2
        })
        ITSNameTextGeometry.center()

        const ITSUrlTextGeometry = new TextGeometry("maibornwolff.de/service/it-sanierung", {
            font: this.font,
            size: this.geometryOptions.backTextSize,
            height: this.geometryOptions.baseplateHeight / 2
        })
        ITSUrlTextGeometry.center()
        ITSUrlTextGeometry.translate(0, -10, 0)

        const textGeometry = BufferGeometryUtils.mergeBufferGeometries([ITSNameTextGeometry, ITSUrlTextGeometry])
        textGeometry.rotateY(Math.PI)

        textGeometry.translate(0, 55, -((this.geometryOptions.baseplateHeight * 3) / 4))

        const material = new MeshBasicMaterial()

        const itsTextMesh = new ManualVisibilityMesh(textGeometry, material, 0.7)
        itsTextMesh.name = "ITS Text"
        this.updateColor(itsTextMesh, numberOfColors)
        const scaleFactor = (wantedWidth - this.geometryOptions.mapSideOffset * 2) / 200
        this.scaleBacktext(itsTextMesh, scaleFactor)

        this.itsTextMesh = itsTextMesh
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
