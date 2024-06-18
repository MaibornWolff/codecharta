import { GeometryOptions } from "../preview3DPrintMesh"
import { Font } from "three"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"
import { CreateTextGeometryStrategyOptions } from "../CreateGeometryStrategies/createTextGeometryStrategy"
import { ColorRange } from "../../../../codeCharta.model"
import { MetricDescriptionBlockMesh, MetricDescriptionBlockOptions } from "./metricDescriptionBlockMesh"
import { TextMesh } from "./textMesh"
import { PositivePrintColorChangeStrategy } from "../ColorChangeStrategies/positivePrintColorChangeStrategy"
import { NeutralPrintColorChangeStrategy } from "../ColorChangeStrategies/neutralPrintColorChangeStrategy"
import { NegativePrintColorChangeStrategy } from "../ColorChangeStrategies/negativePrintColorChangeStrategy"

interface ColorMetricDescriptionBlockOptions extends MetricDescriptionBlockOptions {
    colorRange: ColorRange
}

export class ColorMetricDescriptionBlockMesh extends MetricDescriptionBlockMesh {
    constructor(colorMetricDescriptionBlockOptions: ColorMetricDescriptionBlockOptions, font: Font, yOffset: number) {
        super(colorMetricDescriptionBlockOptions, font, yOffset, 2)
    }

    async init(geometryOptions: GeometryOptions): Promise<ColorMetricDescriptionBlockMesh> {
        const coloredBackTextChildren = await this.createColoredBackTextChildren(geometryOptions)
        for (const child of coloredBackTextChildren) {
            this.add(child)
        }

        super.init(geometryOptions)

        return this
    }

    getText() {
        const colorTextNameAndTitle =
            `${this.metricDescriptionBlockOptions.nodeMetricData.name}\n` + `${this.metricDescriptionBlockOptions.title}\n`
        return colorTextNameAndTitle
    }

    private async createColoredBackTextChildren(geometryOptions: GeometryOptions) {
        const colorMetricDescriptionBlockOptions = this.metricDescriptionBlockOptions as ColorMetricDescriptionBlockOptions
        const colorTextGeometries = []
        const colorTextValueRanges = [
            `Value ranges:`,
            `${colorMetricDescriptionBlockOptions.nodeMetricData.minValue} - ${colorMetricDescriptionBlockOptions.colorRange.from - 1}`,
            `/`,
            `${colorMetricDescriptionBlockOptions.colorRange.from} - ${colorMetricDescriptionBlockOptions.colorRange.to - 1}`,
            `/`,
            `${colorMetricDescriptionBlockOptions.colorRange.to} - ${colorMetricDescriptionBlockOptions.nodeMetricData.maxValue}`
        ]
        const colorChangeStrategies = [
            new DefaultPrintColorChangeStrategy(),
            new PositivePrintColorChangeStrategy(),
            new DefaultPrintColorChangeStrategy(),
            new NeutralPrintColorChangeStrategy(),
            new DefaultPrintColorChangeStrategy(),
            new NegativePrintColorChangeStrategy()
        ]
        let xOffset = 10
        for (let index = 0; index < colorTextValueRanges.length; index += 1) {
            const name = `Metric Text Part ${index}`
            const createTextGeometryStrategyOptions: CreateTextGeometryStrategyOptions = {
                font: this.font,
                text: colorTextValueRanges[index],
                side: "back",
                xPosition: xOffset,
                yPosition: -12,
                textSize: geometryOptions.backTextSize,
                align: "left"
            }

            const textMesh = await new TextMesh(name, createTextGeometryStrategyOptions, true, 4, 0.8, colorChangeStrategies[index]).init(
                geometryOptions
            )
            this.changeColor(geometryOptions.numberOfColors) //TODO adjust
            colorTextGeometries.push(textMesh)

            if (index !== colorTextValueRanges.length - 1) {
                xOffset += textMesh.getWidth() + 3
            }
        }
        return colorTextGeometries
    }
}
