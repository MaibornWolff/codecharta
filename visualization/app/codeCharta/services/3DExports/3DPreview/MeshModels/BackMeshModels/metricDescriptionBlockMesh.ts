import { CustomVisibilityMesh } from "../customVisibilityMesh"
import { CreateSvgGeometryStrategy } from "../../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { BufferGeometry } from "three"
import { Font } from "three/examples/jsm/loaders/FontLoader"
import { BackPrintColorChangeStrategy } from "../../ColorChangeStrategies/backPrintColorChangeStrategy"
import { CreateTextGeometryStrategy } from "../../CreateGeometryStrategies/createTextGeometryStrategy"
import { NodeMetricData } from "../../../../../codeCharta.model"
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js"

export interface MetricDescriptionBlockOptions {
    name: string
    title: string
    iconFilename: string
    iconScale: number
    nodeMetricData: NodeMetricData
}

export class MetricDescriptionBlockMesh extends CustomVisibilityMesh {
    private readonly createSvgGeometryStrategy: CreateSvgGeometryStrategy
    private readonly createTextGeometryStrategy: CreateTextGeometryStrategy

    constructor(
        public metricDescriptionBlockOptions: MetricDescriptionBlockOptions,
        public font: Font,
        private yOffset: number
    ) {
        super(metricDescriptionBlockOptions.name, new BackPrintColorChangeStrategy(), 200, true)
        this.createSvgGeometryStrategy = new CreateSvgGeometryStrategy()
        this.createTextGeometryStrategy = new CreateTextGeometryStrategy()
    }

    async init(geometryOptions: GeometryOptions): Promise<MetricDescriptionBlockMesh> {
        const iconGeometry = await this.createIconGeometry(this.createSvgGeometryStrategy, geometryOptions)

        const textGeometry = await this.createTextGeometry(this.createTextGeometryStrategy, this.getText(), geometryOptions)

        this.geometry = BufferGeometryUtils.mergeGeometries([iconGeometry, textGeometry])

        this.position.y = -0.15 + this.yOffset

        this.updateColor(geometryOptions.numberOfColors)

        return this
    }

    async createTextGeometry(
        createTextGeometryStrategy: CreateTextGeometryStrategy,
        text: string,
        geometryOptions: GeometryOptions
    ): Promise<BufferGeometry> {
        return createTextGeometryStrategy.create(geometryOptions, {
            font: this.font,
            text,
            side: "back",
            xPosition: 0.05,
            yPosition: 0,
            align: "left"
        })
    }

    private async createIconGeometry(
        createSvgGeometryStrategy: CreateSvgGeometryStrategy,
        geometryOptions: GeometryOptions
    ): Promise<BufferGeometry> {
        const iconGeometry = await createSvgGeometryStrategy.create(geometryOptions, {
            filePath: `codeCharta/assets/${this.metricDescriptionBlockOptions.iconFilename}`,
            size: this.metricDescriptionBlockOptions.iconScale,
            side: "back"
        })
        iconGeometry.translate(0, 0, -geometryOptions.baseplateHeight + geometryOptions.printHeight / 2)
        return iconGeometry
    }

    getText(): string {
        return (
            `${this.metricDescriptionBlockOptions.nodeMetricData.name}\n` +
            `${this.metricDescriptionBlockOptions.title}\n` +
            `Value range: ${this.metricDescriptionBlockOptions.nodeMetricData.minValue} - ${this.metricDescriptionBlockOptions.nodeMetricData.maxValue}`
        )
    }
}
