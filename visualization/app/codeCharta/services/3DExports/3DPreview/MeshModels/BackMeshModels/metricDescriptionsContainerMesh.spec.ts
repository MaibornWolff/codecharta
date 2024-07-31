import { BoxGeometry, Font, Mesh } from "three"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { BackPrintColorChangeStrategy } from "../../ColorChangeStrategies/backPrintColorChangeStrategy"
import { MetricDescriptionBlockMesh } from "./metricDescriptionBlockMesh"
import { ColorMetricDescriptionBlockMesh } from "./colorMetricDescriptionBlockMesh"
import { MetricDescriptionsContainerMesh } from "./metricDescriptionsContainerMesh"
import helvetiker from "three/examples/fonts/helvetiker_regular.typeface.json"

jest.mock("./metricDescriptionBlockMesh", () => ({
    MetricDescriptionBlockMesh: jest.fn().mockImplementation(() => ({
        init: jest.fn().mockResolvedValue(new Mesh(new BoxGeometry(2, 2, 2)))
    }))
}))

jest.mock("./colorMetricDescriptionBlockMesh", () => ({
    ColorMetricDescriptionBlockMesh: jest.fn().mockImplementation(() => ({
        init: jest.fn().mockResolvedValue(new Mesh(new BoxGeometry(2, 2, 2)))
    }))
}))

describe("MetricDescriptionsContainerMesh", () => {
    let font: Font
    let geometryOptions: GeometryOptions

    beforeEach(() => {
        font = new Font(helvetiker)
        geometryOptions = {
            heightMetricTitle: "Height",
            heightMetricData: {
                name: "Height",
                minValue: 0,
                maxValue: 100,
                values: []
            },
            areaMetricData: {
                name: "Area",
                minValue: 0,
                maxValue: 100,
                values: []
            },
            colorMetricData: {
                name: "Color",
                minValue: 0,
                maxValue: 100,
                values: []
            },
            colorRange: { from: 0, to: 100 },
            areaMetricTitle: "Area",
            colorMetricTitle: "Color"
        } as GeometryOptions
    })

    it("should initialize and add metric blocks", async () => {
        const containerMesh = new MetricDescriptionsContainerMesh("TestContainer", font)
        await containerMesh.init(geometryOptions)

        expect(containerMesh.children.length).toBe(3)
        expect(MetricDescriptionBlockMesh).toHaveBeenCalledTimes(2)
        expect(ColorMetricDescriptionBlockMesh).toHaveBeenCalledTimes(1)
    })

    it("should correctly set position after centering metrics in X direction", async () => {
        const containerMesh = new MetricDescriptionsContainerMesh("TestContainer", font)
        await containerMesh.init(geometryOptions)

        for (const child of containerMesh.children) {
            ;(child as any).geometry.boundingBox = { min: { x: -1 }, max: { x: 1 } }
        }

        expect(containerMesh.position.x).toBe(1)
    })

    it("should use BackPrintColorChangeStrategy by default", () => {
        const containerMesh = new MetricDescriptionsContainerMesh("TestContainer", font)
        expect(containerMesh.colorChangeStrategy).toBeInstanceOf(BackPrintColorChangeStrategy)
    })
})
