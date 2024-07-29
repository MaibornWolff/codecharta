import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader"
import { CreateSvgGeometryStrategy, CreateSvgGeometryStrategyOptions } from "./createSvgGeometryStrategy"
import { GeometryOptions } from "../preview3DPrintMesh"

describe("CreateSvgGeometryStrategy", () => {
    let strategy: CreateSvgGeometryStrategy

    beforeEach(() => {
        strategy = new CreateSvgGeometryStrategy()
    })

    it("should create geometry from SVG and apply transformations", async () => {
        const geometryOptions: GeometryOptions = {
            printHeight: 10
        } as unknown as GeometryOptions

        const createSvgGeometryStrategyOptions: CreateSvgGeometryStrategyOptions = {
            filePath: "",
            size: 100,
            side: "front"
        } as unknown as CreateSvgGeometryStrategyOptions

        const svgData = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <path d="M10 10 H 90 V 90 H 10 L 10 10" />
            </svg>
        `

        const loader = new SVGLoader()
        const svg = loader.parse(svgData)
        jest.spyOn(SVGLoader.prototype, "load").mockImplementation((url, onLoad) => {
            onLoad(svg)
        })

        const geometry = await strategy.create(geometryOptions, createSvgGeometryStrategyOptions)

        expect(geometry.attributes).toMatchSnapshot()
    })

    it("should create geometry from SVG and apply transformations for back side", async () => {
        const geometryOptions: GeometryOptions = {
            printHeight: 10
        } as unknown as GeometryOptions

        const createSvgGeometryStrategyOptions: CreateSvgGeometryStrategyOptions = {
            filePath: "",
            size: 100,
            side: "back"
        } as unknown as CreateSvgGeometryStrategyOptions

        const svgData = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <path d="M10 10 H 90 V 90 H 10 L 10 10" />
            </svg>
        `

        const loader = new SVGLoader()
        const svg = loader.parse(svgData)
        jest.spyOn(SVGLoader.prototype, "load").mockImplementation((url, onLoad) => {
            onLoad(svg)
        })

        const geometry = await strategy.create(geometryOptions, createSvgGeometryStrategyOptions)

        expect(geometry.attributes).toMatchSnapshot()
    })
})
