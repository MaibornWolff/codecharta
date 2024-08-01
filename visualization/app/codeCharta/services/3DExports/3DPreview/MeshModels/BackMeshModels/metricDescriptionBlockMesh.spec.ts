import { BufferGeometry, Font } from "three"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { CreateSvgGeometryStrategy } from "../../CreateGeometryStrategies/createSvgGeometryStrategy"
import { CreateTextGeometryStrategy } from "../../CreateGeometryStrategies/createTextGeometryStrategy"
import { MetricDescriptionBlockMesh, MetricDescriptionBlockOptions } from "./metricDescriptionBlockMesh"
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils"

jest.mock("../../CreateGeometryStrategies/createSvgGeometryStrategy")
jest.mock("../../CreateGeometryStrategies/createTextGeometryStrategy")
jest.mock("three/examples/jsm/utils/BufferGeometryUtils")

describe("MetricDescriptionBlockMesh", () => {
    let font: Font
    let geometryOptions: GeometryOptions
    let metricDescriptionBlockOptions: MetricDescriptionBlockOptions

    beforeEach(() => {
        font = {} as Font
        geometryOptions = {
            baseplateHeight: 0.1,
            printHeight: 0.2,
            numberOfColors: 5
        } as GeometryOptions

        metricDescriptionBlockOptions = {
            name: "TestMetricBlock",
            title: "Test Title",
            iconFilename: "test_icon.svg",
            iconScale: 0.1,
            nodeMetricData: {
                name: "Test Metric",
                minValue: 0,
                maxValue: 100,
                values: []
            }
        }
        ;(CreateSvgGeometryStrategy.prototype.create as jest.Mock).mockResolvedValue(new BufferGeometry())
        ;(CreateTextGeometryStrategy.prototype.create as jest.Mock).mockResolvedValue(new BufferGeometry())
        ;(BufferGeometryUtils.mergeBufferGeometries as jest.Mock).mockReturnValue(new BufferGeometry())
    })

    it("should initialize and set geometry and position", async () => {
        const yOffset = 0.05
        const metricDescriptionBlockMesh = new MetricDescriptionBlockMesh(metricDescriptionBlockOptions, font, yOffset)

        await metricDescriptionBlockMesh.init(geometryOptions)

        expect(BufferGeometryUtils.mergeBufferGeometries).toHaveBeenCalled()
        expect(metricDescriptionBlockMesh.geometry).toBeInstanceOf(BufferGeometry)
        expect(metricDescriptionBlockMesh.position.y).toBe(-0.15 + yOffset)
    })

    it("should call createIconGeometry and createTextGeometry with correct arguments", async () => {
        const yOffset = 0.05
        const metricDescriptionBlockMesh = new MetricDescriptionBlockMesh(metricDescriptionBlockOptions, font, yOffset)

        await metricDescriptionBlockMesh.init(geometryOptions)

        expect(CreateSvgGeometryStrategy.prototype.create).toHaveBeenCalledWith(geometryOptions, {
            filePath: `codeCharta/assets/${metricDescriptionBlockOptions.iconFilename}`,
            size: metricDescriptionBlockOptions.iconScale,
            side: "back"
        })

        expect(CreateTextGeometryStrategy.prototype.create).toHaveBeenCalledWith(geometryOptions, {
            font,
            text: metricDescriptionBlockMesh.getText(),
            side: "back",
            xPosition: 0.05,
            yPosition: 0,
            align: "left"
        })
    })

    it("should return correct text from getText", () => {
        const yOffset = 0.05
        const metricDescriptionBlockMesh = new MetricDescriptionBlockMesh(metricDescriptionBlockOptions, font, yOffset)
        const expectedText = `Test Metric\nTest Title\nValue range: 0 - 100`

        expect(metricDescriptionBlockMesh.getText()).toBe(expectedText)
    })
})
