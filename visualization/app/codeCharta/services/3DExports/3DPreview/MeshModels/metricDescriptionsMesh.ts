import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { GeometryOptions } from "../preview3DPrintMesh"
import { Box3, Font, Mesh, MeshBasicMaterial, TextGeometry } from "three"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils"
import { ColorRange, NodeMetricData } from "../../../../codeCharta.model"
import { CreateSvgGeometryStrategy } from "../CreateGeometryStrategies/createSvgGeometryStrategy"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"

export class MetricDescriptionsMesh extends ManualVisibilityMesh {

    constructor(public font: Font) {
        super(new DefaultPrintColorChangeStrategy(), true, 2, 1)
        this.name = "Metric Text"
    }

    async init(geometryOptions: GeometryOptions): Promise<MetricDescriptionsMesh> {
        this.material = new MeshBasicMaterial()

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

        const whiteBackGeometries = await this.createWhiteBackGeometries(geometryOptions, icons, iconScales, whiteTexts)

        const coloredBackTextGeometries = this.createColoredBackTextGeometries(geometryOptions, colorTextValueRanges)
        for (const colorTextGeometry of coloredBackTextGeometries) {
            this.add(colorTextGeometry)
        }

        const mergedWhiteBackGeometry = BufferGeometryUtils.mergeBufferGeometries(whiteBackGeometries)
        this.geometry = mergedWhiteBackGeometry

        console.log(this)
        this.changeColor(geometryOptions.numberOfColors)

        const scaleFactor = 200 * geometryOptions.width / (geometryOptions.width - geometryOptions.mapSideOffset * 2)
        this.changeSize(geometryOptions, scaleFactor)
        if (this.visible) {
            this.xCenterMetricsMesh(this)
        }

        return this
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

    private createColoredBackTextGeometries(geometryOptions: GeometryOptions, colorTextValueRanges: string[]) {
        const colorTextGeometries = []
        let xOffset = -10
        for (let index = 0; index < colorTextValueRanges.length; index += 1) {
            const textGeometry = new TextGeometry(`\n\n${colorTextValueRanges[index]}`, {
                font: this.font,
                size: geometryOptions.backTextSize,
                height: geometryOptions.baseplateHeight / 2
            })
            textGeometry.rotateY(Math.PI)
            textGeometry.translate(xOffset, -35 * 2 + geometryOptions.backTextSize - 20, -geometryOptions.baseplateHeight / 2)
            const material = new MeshBasicMaterial()
            const textMesh = new Mesh(textGeometry, material)
            textMesh.name = `Metric Text Part ${index}`
            this.changeColor(geometryOptions.numberOfColors) //TODO adjust
            colorTextGeometries.push(textMesh)

            if (index !== colorTextValueRanges.length - 1) {
                textGeometry.computeBoundingBox()
                xOffset = textGeometry.boundingBox.min.x
            }
        }
        return colorTextGeometries
    }

    private async createWhiteBackGeometries(geometryOptions: GeometryOptions, icons: string[], iconScales: number[], whiteTexts: string[]) {
        const backGeometries = []
        for (const [index, icon] of icons.entries()) {
            const createSvgGeometryStrategy = new CreateSvgGeometryStrategy(icon)
            const iconGeometry = await createSvgGeometryStrategy.create(geometryOptions)
            const iconScale = iconScales[index]

            iconGeometry.center()
            iconGeometry.rotateY(Math.PI)
            iconGeometry.rotateX(Math.PI)
            iconGeometry.scale(iconScale, iconScale, geometryOptions.baseplateHeight / 2)

            iconGeometry.translate(0, -35 * index - 20, -((geometryOptions.baseplateHeight * 3) / 4))
            backGeometries.push(iconGeometry)

            const text = whiteTexts[index]
            const textGeometry = new TextGeometry(text, {
                font: this.font,
                size: geometryOptions.backTextSize,
                height: geometryOptions.baseplateHeight / 2
            })
            textGeometry.rotateY(Math.PI)

            textGeometry.translate(-10, -35 * index + geometryOptions.backTextSize - 20, -geometryOptions.baseplateHeight / 2)

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
}
