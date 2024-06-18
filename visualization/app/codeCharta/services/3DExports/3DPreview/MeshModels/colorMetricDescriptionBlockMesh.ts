import { GeometryOptions } from "../preview3DPrintMesh"
import { Font } from "three"
import { DefaultPrintColorChangeStrategy } from "../ColorChangeStrategies/defaultPrintColorChangeStrategy"
import { CreateTextGeometryStrategy, CreateTextGeometryStrategyOptions } from "../CreateGeometryStrategies/createTextGeometryStrategy"
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

    async createTextGeometry(createTextGeometryStrategy: CreateTextGeometryStrategy, text: string, geometryOptions: GeometryOptions) {
        const textGeometry = await createTextGeometryStrategy.create(geometryOptions, {
            font: this.font,
            text,
            side: "back",
            xPosition: 0.05,
            yPosition: 0.015,
            align: "left"
        })
        return textGeometry
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
        let xOffset = 0.05
        for (let index = 0; index < colorTextValueRanges.length; index += 1) {
            const name = `ColorMetricLastLine${index}`
            const createTextGeometryStrategyOptions: CreateTextGeometryStrategyOptions = {
                font: this.font,
                text: colorTextValueRanges[index],
                side: "back",
                xPosition: xOffset,
                yPosition: -0.045,
                align: "left"
            }

            const textMesh = await new TextMesh(name, colorChangeStrategies[index], 200, true, 4, createTextGeometryStrategyOptions).init(
                geometryOptions
            )
            this.changeColor(geometryOptions.numberOfColors) //TODO adjust
            colorTextGeometries.push(textMesh)

            if (index !== colorTextValueRanges.length - 1) {
                xOffset += textMesh.getWidth() + 0.03
            }
        }
        return colorTextGeometries
    }
}
