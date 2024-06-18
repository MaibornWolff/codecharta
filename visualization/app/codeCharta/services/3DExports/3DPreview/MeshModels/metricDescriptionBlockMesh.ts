import { ManualVisibilityMesh } from "./manualVisibilityMesh"
import { CreateSvgGeometryStrategy } from "../CreateGeometryStrategies/createSvgGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import { Font, MeshBasicMaterial } from "three"
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

export class MetricDescriptionBlockMesh extends ManualVisibilityMesh {
    constructor(
        public metricDescriptionBlockOptions: MetricDescriptionBlockOptions,
        public font: Font,
        private yOffset: number,
        minNumberOfColors = 2
    ) {
        super(metricDescriptionBlockOptions.name, new DefaultPrintColorChangeStrategy(), 0.8, true, minNumberOfColors)
    }

    async init(geometryOptions: GeometryOptions): Promise<MetricDescriptionBlockMesh> {
        const createSvgStrategy = new CreateSvgGeometryStrategy()
        const iconGeometry = await createSvgStrategy.create(geometryOptions, {
            filePath: `codeCharta/assets/${this.metricDescriptionBlockOptions.iconFilename}`,
            size: this.metricDescriptionBlockOptions.iconScale,
            side: "back"
        })
        iconGeometry.translate(0, 0, -geometryOptions.baseplateHeight + geometryOptions.printHeight / 2)

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

        this.geometry = BufferGeometryUtils.mergeBufferGeometries([iconGeometry, textGeometry])

        this.material = new MeshBasicMaterial()

        const xPosition = 0
        const yPosition = -geometryOptions.width / 6.5 + this.yOffset
        const zPosition = 0
        this.position.set(xPosition, yPosition, zPosition)

        this.changeColor(geometryOptions.numberOfColors)

        return this
    }

    getText() {
        const text =
            `${this.metricDescriptionBlockOptions.nodeMetricData.name}\n` +
            `${this.metricDescriptionBlockOptions.title}\n` +
            `Value range: ${this.metricDescriptionBlockOptions.nodeMetricData.minValue} - ${this.metricDescriptionBlockOptions.nodeMetricData.maxValue}`
        return text
    }
}
