import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { CreateSvgGeometryStrategy } from "../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { Font, Mesh, MeshBasicMaterial, TextGeometry } from "three"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"
import { SizeChangeScaleStrategy } from "../SizeChangeStrategies/sizeChangeScaleStrategy"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils"
import { CreateTextGeometryStrategy } from "../CreateGeometryStrategies/createTextGeometryStrategy"
import { ColorRange } from "../../../../codeCharta.model"
import { MetricDescriptionBlockOptions } from "./metricDescriptionBlockMesh"

interface ColorMetricDescriptionBlockOptions extends MetricDescriptionBlockOptions {
    colorRange: ColorRange
}

export class ColorMetricDescriptionBlockMesh extends ManualVisibilityMesh {
    constructor(
        private colorMetricDescriptionBlockOptions: ColorMetricDescriptionBlockOptions,
        private font: Font,
        private yOffset: number
    ) {
        super(new SizeChangeScaleStrategy(), new DefaultPrintColorChangeStrategy(), 0.8, true, 2)
        this.name = colorMetricDescriptionBlockOptions.name
    }

    async init(geometryOptions: GeometryOptions): Promise<ColorMetricDescriptionBlockMesh> {
        const createSvgStrategy = new CreateSvgGeometryStrategy()
        const iconGeometry = await createSvgStrategy.create(geometryOptions, {
            filePath: `codeCharta/assets/${this.colorMetricDescriptionBlockOptions.iconFilename}`,
            size: this.colorMetricDescriptionBlockOptions.iconScale,
            side: "back"
        })

        const createTextGeometryStrategy = new CreateTextGeometryStrategy()
        const text = this.getText()
        const textGeometry = await createTextGeometryStrategy.create(geometryOptions, {
            font: this.font,
            text,
            side: "back",
            xPosition: 10,
            yPosition: 0,
            textSize: geometryOptions.backTextSize,
            align: "left"
        })

        const coloredBackTextChildren = await this.createColoredBackTextChildren(geometryOptions, createTextGeometryStrategy)
        for (const child of coloredBackTextChildren) {
            this.add(child)
        }

        this.geometry = BufferGeometryUtils.mergeBufferGeometries([iconGeometry, textGeometry])

        this.material = new MeshBasicMaterial()

        const xPosition = 0
        const yPosition = -geometryOptions.width / 6.5 + this.yOffset
        const zPosition = -geometryOptions.printHeight * 2
        this.position.set(xPosition, yPosition, zPosition)

        this.changeColor(geometryOptions.numberOfColors)

        return this
    }

    getText() {
        const colorTextNameAndTitle =
            `${this.colorMetricDescriptionBlockOptions.nodeMetricData.name}\n` + `${this.colorMetricDescriptionBlockOptions.title}\n`
        return colorTextNameAndTitle
    }

    private async createColoredBackTextChildren(geometryOptions: GeometryOptions, createTextGeometryStrategy: CreateTextGeometryStrategy) {
        const colorTextGeometries = []
        const colorTextValueRanges = [
            `Value ranges:`,
            `${this.colorMetricDescriptionBlockOptions.nodeMetricData.minValue} - ${this.colorMetricDescriptionBlockOptions.colorRange.from - 1}`,
            `/`,
            `${this.colorMetricDescriptionBlockOptions.colorRange.from} - ${this.colorMetricDescriptionBlockOptions.colorRange.to - 1}`,
            `/`,
            `${this.colorMetricDescriptionBlockOptions.colorRange.to} - ${this.colorMetricDescriptionBlockOptions.nodeMetricData.maxValue}`
        ]
        let xOffset = 10
        for (let index = 0; index < colorTextValueRanges.length; index += 1) {
            const textGeometry = (await createTextGeometryStrategy.create(geometryOptions, {
                font: this.font,
                text: colorTextValueRanges[index],
                side: "back",
                xPosition: xOffset,
                yPosition: -12,
                textSize: geometryOptions.backTextSize,
                align: "left"
            })) as TextGeometry
            const material = new MeshBasicMaterial()
            const textMesh = new Mesh(textGeometry, material)
            textMesh.name = `Metric Text Part ${index}`
            this.changeColor(geometryOptions.numberOfColors) //TODO adjust
            colorTextGeometries.push(textMesh)

            if (index !== colorTextValueRanges.length - 1) {
                textGeometry.computeBoundingBox()
                xOffset += textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x + 3
            }
        }
        return colorTextGeometries
    }
}
