import { BufferGeometry } from "three"
import { Font } from "three/examples/jsm/loaders/FontLoader"
import { CreateTextGeometryStrategy, CreateTextGeometryStrategyOptions } from "./createTextGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"
import HelvetikerFont from "three/examples/fonts/helvetiker_regular.typeface.json"

jest.mock("three/examples/jsm/utils/BufferGeometryUtils", () => ({
    BufferGeometryUtils: {
        mergeBufferGeometries: jest.fn(geometries => {
            const merged = new BufferGeometry()
            merged.userData.geometries = geometries // Store original geometries for testing
            return merged
        })
    }
}))

describe("CreateTextGeometryStrategy", () => {
    let strategy: CreateTextGeometryStrategy
    let font: Font

    beforeEach(() => {
        strategy = new CreateTextGeometryStrategy()
        font = new Font(HelvetikerFont)
        jest.clearAllMocks()
    })

    it("should create text geometry with center alignment for front side", async () => {
        const geometryOptions: GeometryOptions = {
            printHeight: 10,
            baseplateHeight: 20
        } as unknown as GeometryOptions

        const createTextGeometryStrategyOptions: CreateTextGeometryStrategyOptions = {
            font,
            text: "Hello\nWorld",
            side: "front",
            xPosition: 0,
            yPosition: 0,
            align: "center",
            textSize: 10
        } as unknown as CreateTextGeometryStrategyOptions

        const geometry = await strategy.create(geometryOptions, createTextGeometryStrategyOptions)

        expect(geometry).toBeInstanceOf(BufferGeometry)
        expect(geometry.attributes).toMatchSnapshot()
    })

    it("should create text geometry with left alignment for back side", async () => {
        const geometryOptions: GeometryOptions = {
            printHeight: 10,
            baseplateHeight: 20
        } as unknown as GeometryOptions

        const createTextGeometryStrategyOptions: CreateTextGeometryStrategyOptions = {
            font,
            text: "Hello World",
            side: "back",
            xPosition: 50,
            yPosition: 50,
            align: "left",
            textSize: 10
        } as unknown as CreateTextGeometryStrategyOptions

        const geometry = await strategy.create(geometryOptions, createTextGeometryStrategyOptions)

        expect(geometry).toBeInstanceOf(BufferGeometry)
        expect(geometry.attributes).toMatchSnapshot()
    })

    it("should create multiline centered text geometry for front side", async () => {
        const geometryOptions: GeometryOptions = {
            printHeight: 10,
            baseplateHeight: 20
        } as unknown as GeometryOptions

        const createTextGeometryStrategyOptions: CreateTextGeometryStrategyOptions = {
            font,
            text: "Hello\nWorld",
            side: "front",
            xPosition: 50,
            yPosition: 50,
            align: "center",
            textSize: 10
        } as unknown as CreateTextGeometryStrategyOptions

        const geometry = await strategy.create(geometryOptions, createTextGeometryStrategyOptions)

        expect(geometry).toBeInstanceOf(BufferGeometry)
        expect(geometry.attributes).toMatchSnapshot()
    })
})
