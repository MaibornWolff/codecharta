import {
    Box3,
    BufferGeometry,
    ExtrudeGeometry,
    Float32BufferAttribute,
    Font,
    FontLoader,
    Mesh,
    MeshBasicMaterial,
    ShaderMaterial,
    Shape,
    TextGeometry,
    Vector3
} from "three"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils"
import { ColorRange, NodeMetricData } from "../../codeCharta.model"

const layerHeight = 0.2
const frontTextSize = 12
const frontTextHeight = 1
const mapSideOffset = 10
const baseplateHeight = 1 //should be a multiple of layerHeight
const logoSize = 15
const logoHeight = 1
const backTextSize = 6

export interface GeometryOptions {
    originalMapMesh: Mesh
    wantedWidth: number
    areaMetricTitle: string
    areaMetricData: NodeMetricData
    heightMetricTitle: string
    heightMetricData: NodeMetricData
    colorMetricTitle: string
    colorMetricData: NodeMetricData
    colorRange: ColorRange
    frontText?: string
    defaultMaterial: ShaderMaterial
    numberOfColors: number
}

class CustomVisibilityMesh extends Mesh {
    minScale: number
    visibleBecauseOfColor = true

    constructor(geometry: BufferGeometry, material: MeshBasicMaterial, minScale: number) {
        super(geometry, material)
        this.minScale = minScale
    }

    updateVisibility(): void {
        this.visible = this.scale.x >= this.minScale && this.visibleBecauseOfColor
    }
}

export class Preview3DPrintMesh {
    private font: Font
    private printMesh: Mesh
    private currentSize: Vector3
    private mapScalingFactorForSnappingHeights: number

    //Front
    private mapMesh: Mesh
    private baseplateMesh: Mesh
    private frontTextMesh: Mesh
    private frontMWLogoMesh: Mesh
    private customLogoMesh: Mesh
    //Back
    private backMWLogoMesh: Mesh
    private itsTextMesh: Mesh
    private codeChartaLogoMesh: Mesh
    private metricsMesh: Mesh

    async initialize(geometryOptions: GeometryOptions) {
        this.printMesh = new Mesh()
        this.printMesh.name = "PrintMesh"
        this.mapScalingFactorForSnappingHeights = 1

        await this.loadFont()
        await this.createPrintPreviewMesh(geometryOptions)
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

    async createPrintPreviewMesh(geometryOptions: GeometryOptions) {
        this.initBaseplateMesh(geometryOptions.wantedWidth, geometryOptions.defaultMaterial, geometryOptions.numberOfColors)
        this.printMesh.add(this.baseplateMesh)

        this.initMapMesh(geometryOptions)
        this.printMesh.add(this.mapMesh)

        if (geometryOptions.frontText) {
            try {
                this.initFrontText(geometryOptions.frontText, geometryOptions.wantedWidth, geometryOptions.numberOfColors)
                this.printMesh.attach(this.frontTextMesh)
            } catch (error) {
                console.error("Error creating text:", error)
            }
        }

        await this.initFrontMWLogoMesh(geometryOptions.wantedWidth, geometryOptions.numberOfColors)
        this.printMesh.add(this.frontMWLogoMesh)

        await this.initBackMWLogoMesh(geometryOptions.wantedWidth, geometryOptions.numberOfColors)
        this.printMesh.add(this.backMWLogoMesh)

        await this.initBackITSTextMesh(geometryOptions.wantedWidth, geometryOptions.numberOfColors)
        this.printMesh.add(this.itsTextMesh)

        await this.initCodeChartaMesh(geometryOptions.wantedWidth, geometryOptions.numberOfColors)
        this.printMesh.add(this.codeChartaLogoMesh)

        await this.initMetricsMesh(geometryOptions)
        this.printMesh.add(this.metricsMesh)
    }

    updateSize(wantedWidth: number) {
        const currentWidth = this.currentSize.x

        for (const child of this.printMesh.children) {
            if (child instanceof Mesh) {
                switch (child.name) {
                    case "Map": {
                        const map = child.geometry
                        const scale = (wantedWidth - 2 * mapSideOffset) / (currentWidth - 2 * mapSideOffset)
                        map.scale(scale, scale, scale)
                        this.snapHeightsToLayerHeight(map)
                        break
                    }
                    case "Baseplate":
                        child.geometry = this.createBaseplateGeometry(wantedWidth)
                        break

                    case "Front Text": {
                        const text = child.geometry
                        text.translate(0, -(wantedWidth - currentWidth) / 2, 0)
                        break
                    }
                    case "Front MW Logo": {
                        const logo = child.geometry
                        logo.translate((wantedWidth - currentWidth) / 2, -(wantedWidth - currentWidth) / 2, 0)
                        break
                    }
                    case "Custom Logo":
                        this.updateCustomLogoPosition(child, wantedWidth)
                        break

                    case "Back MW Logo":
                        if (child instanceof CustomVisibilityMesh) {
                            this.scaleBacktext(child, wantedWidth / currentWidth)
                        } else {
                            console.error("Back MW Logo is not an instance of CustomVisibilityMesh")
                        }
                        break

                    case "ITS Text":
                        if (child instanceof CustomVisibilityMesh) {
                            this.scaleBacktext(child, wantedWidth / currentWidth)
                        } else {
                            console.error("Back MW Logo is not an instance of CustomVisibilityMesh")
                        }
                        break

                    case "CodeCharta Logo":
                        if (child instanceof CustomVisibilityMesh) {
                            this.scaleBacktext(child, wantedWidth / currentWidth)
                        } else {
                            console.error("CodeCharta Logo is not an instance of CustomVisibilityMesh")
                        }
                        break

                    case "Metric Text":
                        if (child instanceof CustomVisibilityMesh) {
                            this.scaleBacktext(child, wantedWidth / currentWidth)
                            if (child.visible) {
                                this.xCenterMetricsMesh(child)
                            }
                        } else {
                            console.error("Metric Text is not an instance of CustomVisibilityMesh")
                        }
                        break

                    default:
                        console.warn("Unknown object:", child.name, "Did you forget to add it to the updateMapSize method?")
                        break
                }
            }
        }

        this.calculateCurrentSize()
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
        this.customLogoMesh = await this.createSvgMesh(dataUrl, logoHeight, logoSize)

        this.updateCustomLogoPosition(this.customLogoMesh, this.currentSize.x)
        this.customLogoMesh.name = "Custom Logo"

        this.printMesh.attach(this.customLogoMesh)
    }

    rotateCustomLogo() {
        this.customLogoMesh.rotateZ(Math.PI / 2) // Rotate 90 degrees
    }

    flipCustomLogo() {
        this.customLogoMesh.rotateY(Math.PI) // Rotate 180 degrees
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
        this.frontTextMesh.geometry = this.createFrontTextGeometry(frontText, this.currentSize.x)
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
        this.baseplateMesh.geometry.computeBoundingBox()
        const boundingBoxBaseplate = this.baseplateMesh.geometry.boundingBox

        this.mapMesh.geometry.computeBoundingBox()
        const boundingBoxMap = this.mapMesh.geometry.boundingBox

        const currentWidth = boundingBoxBaseplate.max.x - boundingBoxBaseplate.min.x
        const currentDepth = boundingBoxBaseplate.max.y - boundingBoxBaseplate.min.y
        const currentHeight = boundingBoxBaseplate.max.z - boundingBoxBaseplate.min.z + boundingBoxMap.max.z - boundingBoxMap.min.z
        this.currentSize = new Vector3(currentWidth, currentDepth, currentHeight)
    }

    private updateCustomLogoPosition(customLogoMesh: Mesh, wantedWidth: number) {
        customLogoMesh.geometry.computeBoundingBox()
        const boundingBox = customLogoMesh.geometry.boundingBox
        const logoWidth = boundingBox.max.x - boundingBox.min.x
        const logoDepth = boundingBox.max.y - boundingBox.min.y
        customLogoMesh.position.set(
            -wantedWidth / 2 + logoWidth + mapSideOffset,
            -logoDepth / 2 - (wantedWidth - mapSideOffset) / 2,
            logoHeight / 2
        )
    }

    private initMapMesh(geometryOptions: GeometryOptions) {
        const newMapGeometry = geometryOptions.originalMapMesh.geometry.clone()
        newMapGeometry.rotateX(Math.PI / 2)
        this.updateMapGeometry(newMapGeometry, geometryOptions.wantedWidth, geometryOptions.numberOfColors)
        newMapGeometry.rotateZ(-Math.PI / 2)
        const newMapMesh: Mesh = geometryOptions.originalMapMesh.clone() as Mesh
        newMapMesh.clear()
        newMapMesh.geometry = newMapGeometry
        newMapMesh.name = "Map"
        this.mapMesh = newMapMesh
    }

    private updateMapGeometry(map: BufferGeometry, wantedWidth: number, numberOfColors: number): BufferGeometry {
        const width = wantedWidth - 2 * mapSideOffset

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

        const wantedHeight = Math.ceil(smallestHeight / layerHeight) * layerHeight
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
        if (mesh instanceof CustomVisibilityMesh) {
            mesh.visibleBecauseOfColor = numberOfColors > 1
            mesh.updateVisibility()
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
        const getFrontTextAndLogoColor = () => {
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
            "Front MW Logo": getFrontTextAndLogoColor,
            "Front Text": getFrontTextAndLogoColor,
            "Back MW Logo": getBackTextAndLogoColor,
            "ITS Text": getBackTextAndLogoColor,
            "CodeCharta Logo": getBackTextAndLogoColor,
            "Metric Text": getBackTextAndLogoColor,
            "Metric Text Part 0": getBackTextAndLogoColor,
            "Metric Text Part 1": () => getMetricColorTextColor([0, 1, 0]),
            "Metric Text Part 2": getBackTextAndLogoColor,
            "Metric Text Part 3": () => getMetricColorTextColor([1, 1, 0]),
            "Metric Text Part 4": getBackTextAndLogoColor,
            "Metric Text Part 5": () => getMetricColorTextColor([1, 0, 0])
        }

        if (partName in colorFunctions) {
            return colorFunctions[partName]()
        }
        console.warn("Unknown object:", partName, "Did you forget to add it to colorFunctions in the getColorArray method?")
        return [0, 1, 1]
    }

    private initBaseplateMesh(wantedWidth: number, defaultMaterial: ShaderMaterial, numberOfColors: number) {
        const geometry = this.createBaseplateGeometry(wantedWidth)
        //at the moment we use a workaround, so we don't need to calculate color, delta, deltaColor and isHeight
        //the downside of this workaround is that there can only be one default color for all objects
        //if its needed that all objects have ShaderMaterial have a look at geometryGenerator.ts
        const shaderMaterial = new ShaderMaterial()
        shaderMaterial.copy(defaultMaterial)
        shaderMaterial.polygonOffset = true
        shaderMaterial.polygonOffsetUnits = 1
        shaderMaterial.polygonOffsetFactor = 0.1
        const baseplateMesh = new Mesh(geometry, shaderMaterial)
        baseplateMesh.name = "Baseplate"
        this.updateColor(baseplateMesh, numberOfColors)
        this.baseplateMesh = baseplateMesh
    }

    private createBaseplateGeometry(wantedWidth: number): BufferGeometry {
        let edgeRadius = 5 // Adjust this value to change the roundness of the corners
        const maxRoundRadius = Math.sqrt(2 * Math.pow(mapSideOffset, 2)) / (Math.sqrt(2) - 1) - 1
        if (maxRoundRadius < edgeRadius) {
            edgeRadius = maxRoundRadius
        }

        // Create the shape
        const shape = new Shape()
        const width = wantedWidth
        const depth = wantedWidth + frontTextSize

        shape.absarc(width - edgeRadius, edgeRadius, edgeRadius, Math.PI * 1.5, Math.PI * 2, false)
        shape.absarc(width - edgeRadius, depth - edgeRadius, edgeRadius, 0, Math.PI * 0.5, false)
        shape.absarc(edgeRadius, depth - edgeRadius, edgeRadius, Math.PI * 0.5, Math.PI, false)
        shape.absarc(edgeRadius, edgeRadius, edgeRadius, Math.PI, Math.PI * 1.5, false)

        // Create the geometry
        const geometry = new ExtrudeGeometry(shape, { depth: baseplateHeight, bevelEnabled: false })
        geometry.translate(-width / 2, -width / 2 - frontTextSize, -baseplateHeight)

        return geometry
    }

    private initFrontText(frontText: string, wantedWidth: number, numberOfColors: number) {
        const textGeometry = this.createFrontTextGeometry(frontText, wantedWidth)

        const material = new MeshBasicMaterial()
        const textMesh = new Mesh(textGeometry, material)
        textMesh.name = "Front Text"
        this.updateColor(textMesh, numberOfColors)
        this.frontTextMesh = textMesh
    }

    private createFrontTextGeometry(frontText: string, wantedWidth: number) {
        const textGeometry = new TextGeometry(frontText, {
            font: this.font,
            size: frontTextSize,
            height: frontTextHeight
        })
        textGeometry.center()

        //calculate the bounding box of the text
        textGeometry.computeBoundingBox()
        const textDepth = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y
        textGeometry.translate(0, -textDepth / 2 - (wantedWidth - mapSideOffset) / 2, logoHeight / 2)
        return textGeometry
    }

    private async initMetricsMesh(geometryOptions: GeometryOptions) {
        const { areaIcon, areaIconScale, areaText } = this.createAreaAttributes(
            geometryOptions.areaMetricTitle,
            geometryOptions.areaMetricData
        )
        const { heightIcon, heightIconScale, heightText } = this.createHeightAttributes(
            geometryOptions.heightMetricTitle,
            geometryOptions.heightMetricData
        )
        const { colorIcon, colorIconScale, colorTextNameAndTitle, colorTextValueRanges } = this.createColorAttributes(
            geometryOptions.colorMetricTitle,
            geometryOptions.colorMetricData,
            geometryOptions.colorRange
        )

        const icons = [areaIcon, heightIcon, colorIcon].map(icon => `codeCharta/assets/${icon}`)
        const iconScales = [areaIconScale, heightIconScale, colorIconScale]
        const whiteTexts = [areaText, heightText, colorTextNameAndTitle]

        const whiteBackGeometries = await this.createWhiteBackGeometries(icons, iconScales, whiteTexts)
        const mergedWhiteBackGeometry = BufferGeometryUtils.mergeBufferGeometries(whiteBackGeometries)

        const material = new MeshBasicMaterial()
        const metricsMesh = new CustomVisibilityMesh(mergedWhiteBackGeometry, material, 1)

        const coloredBackTextGeometries = this.createColoredBackTextGeometries(colorTextValueRanges, geometryOptions.numberOfColors)
        for (const colorTextGeometry of coloredBackTextGeometries) {
            metricsMesh.add(colorTextGeometry)
        }
        metricsMesh.name = "Metric Text"
        this.updateColor(metricsMesh, geometryOptions.numberOfColors)
        const scaleFactor = (geometryOptions.wantedWidth - mapSideOffset * 2) / 200
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
                size: backTextSize,
                height: baseplateHeight / 2
            })
            textGeometry.rotateY(Math.PI)
            textGeometry.translate(xOffset, -35 * 2 + backTextSize - 20, -baseplateHeight / 2)
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
            iconGeometry.scale(iconScale, iconScale, baseplateHeight / 2)

            iconGeometry.translate(0, -35 * index - 20, -((baseplateHeight * 3) / 4))
            backGeometries.push(iconGeometry)

            const text = whiteTexts[index]
            const textGeometry = new TextGeometry(text, {
                font: this.font,
                size: backTextSize,
                height: baseplateHeight / 2
            })
            textGeometry.rotateY(Math.PI)

            textGeometry.translate(-10, -35 * index + backTextSize - 20, -baseplateHeight / 2)

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

    private scaleBacktext(backTextMesh: CustomVisibilityMesh, scaleFactor: number) {
        backTextMesh.scale.set(backTextMesh.scale.x * scaleFactor, backTextMesh.scale.y * scaleFactor, backTextMesh.scale.z)

        backTextMesh.updateVisibility()
    }

    private async initCodeChartaMesh(wantedWidth: number, numberOfColors: number) {
        const logoGeometry = await this.createCodeChartaLogo()
        const textGeometry = this.createCodeChartaText()
        const logoAndTextGeometry = BufferGeometryUtils.mergeBufferGeometries([logoGeometry, textGeometry])

        const material = new MeshBasicMaterial()

        const codeChartaMesh = new CustomVisibilityMesh(logoAndTextGeometry, material, 0.8)
        codeChartaMesh.name = "CodeCharta Logo"
        this.updateColor(codeChartaMesh, numberOfColors)
        const scaleFactor = (wantedWidth - mapSideOffset * 2) / 200
        this.scaleBacktext(codeChartaMesh, scaleFactor)
        this.codeChartaLogoMesh = codeChartaMesh
    }

    private async createCodeChartaLogo() {
        const logoGeometry = await this.createSvgGeometry("codeCharta/assets/codecharta_logo.svg")
        logoGeometry.center()
        logoGeometry.rotateZ(Math.PI)

        const logoScale = 25
        logoGeometry.scale(logoScale, logoScale, baseplateHeight / 2)
        logoGeometry.translate(0, 20, -((baseplateHeight * 3) / 4))

        return logoGeometry
    }

    private createCodeChartaText() {
        const textGeometry = new TextGeometry("github.com/MaibornWolff/codecharta", {
            font: this.font,
            size: backTextSize,
            height: baseplateHeight / 2
        })
        textGeometry.center()
        textGeometry.rotateY(Math.PI)

        textGeometry.translate(0, 5, -((baseplateHeight * 3) / 4))

        return textGeometry
    }

    private async initBackITSTextMesh(wantedWidth: number, numberOfColors: number) {
        const ITSNameTextGeometry = new TextGeometry("IT Stabilization & Modernization", {
            font: this.font,
            size: backTextSize,
            height: baseplateHeight / 2
        })
        ITSNameTextGeometry.center()

        const ITSUrlTextGeometry = new TextGeometry("maibornwolff.de/service/it-sanierung", {
            font: this.font,
            size: backTextSize,
            height: baseplateHeight / 2
        })
        ITSUrlTextGeometry.center()
        ITSUrlTextGeometry.translate(0, -10, 0)

        const textGeometry = BufferGeometryUtils.mergeBufferGeometries([ITSNameTextGeometry, ITSUrlTextGeometry])
        textGeometry.rotateY(Math.PI)

        textGeometry.translate(0, 55, -((baseplateHeight * 3) / 4))

        const material = new MeshBasicMaterial()

        const itsTextMesh = new CustomVisibilityMesh(textGeometry, material, 0.7)
        itsTextMesh.name = "ITS Text"
        this.updateColor(itsTextMesh, numberOfColors)
        const scaleFactor = (wantedWidth - mapSideOffset * 2) / 200
        this.scaleBacktext(itsTextMesh, scaleFactor)

        this.itsTextMesh = itsTextMesh
    }

    private async initBackMWLogoMesh(wantedWidth: number, numberOfColors: number) {
        const mwLogoGeometry = await this.createSvgGeometry("codeCharta/assets/mw_logo_text.svg")
        mwLogoGeometry.center()
        mwLogoGeometry.rotateZ(Math.PI)
        const mwBackLogoScale = (3 * (wantedWidth - mapSideOffset * 2)) / 10
        mwLogoGeometry.scale(mwBackLogoScale, mwBackLogoScale, baseplateHeight / 2)
        mwLogoGeometry.translate(0, wantedWidth / 2 - mwBackLogoScale / 2 + 5, -((baseplateHeight * 3) / 4))

        const material = new MeshBasicMaterial()

        const backMWMesh = new CustomVisibilityMesh(mwLogoGeometry, material, 0.3)
        backMWMesh.name = "Back MW Logo"

        this.updateColor(backMWMesh, numberOfColors)

        this.backMWLogoMesh = backMWMesh
    }

    private async initFrontMWLogoMesh(wantedWidth: number, numberOfColors: number) {
        const filePath = `codeCharta/assets/mw_logo.svg`

        const mwLogoMesh = await this.createSvgMesh(filePath, logoHeight, logoSize)

        mwLogoMesh.geometry.computeBoundingBox()
        const boundingBox = mwLogoMesh.geometry.boundingBox
        const logoWidth = boundingBox.max.x - boundingBox.min.x
        const logoDepth = boundingBox.max.y - boundingBox.min.y
        mwLogoMesh.position.set(
            wantedWidth / 2 - logoWidth - mapSideOffset,
            -logoDepth / 2 - (wantedWidth - mapSideOffset) / 2,
            logoHeight / 2
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

export function calculateMaxPossibleWidthForPreview3DPrintMesh(maxSize: Vector3, mapMesh: Mesh): number {
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
