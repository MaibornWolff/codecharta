import { GeometryOptions } from "../preview3DPrintMesh"
import { CreateBaseplateGeometryStrategy } from "./createBaseplateGeometryStrategy"

describe("CreateBaseplateGeometryStrategy", () => {
    let strategy: CreateBaseplateGeometryStrategy

    beforeEach(() => {
        strategy = new CreateBaseplateGeometryStrategy()
    })

    it("should create geometry with second row visible and default edge radius", async () => {
        const geometryOptions: GeometryOptions = {
            width: 100,
            secondRowVisible: true,
            mapSideOffset: 10,
            baseplateHeight: 20,
            frontTextSize: 5,
            secondRowTextSize: 3
        } as unknown as GeometryOptions

        const geometry = await strategy.create(geometryOptions)
        expect(geometry.attributes).toMatchSnapshot()
    })

    it("should create geometry with second row not visible and adjusted edge radius", async () => {
        const geometryOptions: GeometryOptions = {
            width: 100,
            secondRowVisible: false,
            mapSideOffset: 1,
            baseplateHeight: 20,
            frontTextSize: 5,
            secondRowTextSize: 3
        } as unknown as GeometryOptions

        const geometry = await strategy.create(geometryOptions)
        expect(geometry.attributes).toMatchSnapshot()
    })
})
