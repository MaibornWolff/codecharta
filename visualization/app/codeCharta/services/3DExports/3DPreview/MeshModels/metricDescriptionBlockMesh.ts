import { CustomVisibilityMesh } from "./customVisibilityMesh"
import { CreateSvgGeometryStrategy } from "../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { BufferGeometry, Font, MeshBasicMaterial } from "three"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils"
import { CreateTextGeometryStrategy } from "../CreateGeometryStrategies/createTextGeometryStrategy"
import { NodeMetricData } from "../../../../codeCharta.model"

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
        private yOffset: number,
        minNumberOfColors = 2
    ) {
        super(metricDescriptionBlockOptions.name, new DefaultPrintColorChangeStrategy(), 0.8, true, minNumberOfColors)
        this.createSvgGeometryStrategy = new CreateSvgGeometryStrategy()
        this.createTextGeometryStrategy = new CreateTextGeometryStrategy()
    }

    async init(geometryOptions: GeometryOptions): Promise<MetricDescriptionBlockMesh> {
        const iconGeometry = await this.createIconGeometry(this.createSvgGeometryStrategy, geometryOptions)

        const textGeometry = await this.createTextGeometry(this.createTextGeometryStrategy, this.getText(), geometryOptions)

        this.geometry = BufferGeometryUtils.mergeBufferGeometries([iconGeometry, textGeometry])

        this.material = new MeshBasicMaterial()

        this.position.y = -0.15 + this.yOffset

        this.changeColor(geometryOptions.numberOfColors)

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
