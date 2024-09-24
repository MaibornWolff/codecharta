import { FrontLogo } from "./frontLogo"
import { GeometryOptions } from "../../preview3DPrintMesh"
import { FrontPrintColorChangeStrategy } from "../../ColorChangeStrategies/frontPrintColorChangeStrategy"
import { GeneralMesh } from "../generalMesh"

jest.mock("../../ColorChangeStrategies/frontPrintColorChangeStrategy")

describe("FrontLogo", () => {
    let frontLogo: FrontLogo

    beforeEach(() => {
        frontLogo = new (class extends FrontLogo {
            async init(): Promise<GeneralMesh> {
                return undefined
            }
            getWidth() {
                return this.geometry ? this.geometry.boundingBox.max.x - this.geometry.boundingBox.min.x : 0
            }
        })("testLogo", "left")
        frontLogo.translateX = jest.fn()
        frontLogo.translateY = jest.fn()
    })

    it("should initialize with correct properties", () => {
        expect(frontLogo.name).toBe("testLogo")
        expect(frontLogo.colorChangeStrategy).toBeInstanceOf(FrontPrintColorChangeStrategy)
    })

    it("should change relative size and translate correctly when secondRowMesh is visible", () => {
        const geometryOptions: GeometryOptions = {
            frontTextSize: 10,
            secondRowTextSize: 5,
            secondRowVisible: true
        } as unknown as GeometryOptions

        frontLogo.getWidth = jest.fn().mockReturnValueOnce(20).mockReturnValueOnce(30)

        frontLogo.changeRelativeSize(geometryOptions)

        expect(frontLogo.scale.x).toBe((10 + 5) / 10)
        expect(frontLogo.scale.y).toBe((10 + 5) / 10)
        expect(frontLogo.translateY).toHaveBeenCalledWith(-5)
        expect(frontLogo.translateX).toHaveBeenCalled()
    })

    it("should change relative size and translate correctly when secondRowMesh is not visible", () => {
        const geometryOptions: GeometryOptions = {
            frontTextSize: 10,
            secondRowTextSize: 5,
            secondRowVisible: false
        } as unknown as GeometryOptions

        frontLogo.getWidth = jest.fn().mockReturnValueOnce(20).mockReturnValueOnce(20)

        frontLogo.changeRelativeSize(geometryOptions)

        expect(frontLogo.scale.x).toBe(1)
        expect(frontLogo.scale.y).toBe(1)
        expect(frontLogo.translateY).toHaveBeenCalledWith(5)
        expect(frontLogo.translateX).toHaveBeenCalled()
    })

    it("should handle alignment correctly", () => {
        frontLogo = new (class extends FrontLogo {
            async init(): Promise<GeneralMesh> {
                return undefined
            }
            getWidth() {
                return this.geometry ? this.geometry.boundingBox.max.x - this.geometry.boundingBox.min.x : 0
            }
        })("testLogo", "left")
        frontLogo.translateX = jest.fn()
        frontLogo.translateY = jest.fn()

        let geometryOptions: GeometryOptions = {
            frontTextSize: 10,
            secondRowTextSize: 5,
            secondRowVisible: false
        } as unknown as GeometryOptions

        frontLogo.getWidth = jest.fn().mockReturnValueOnce(20).mockReturnValueOnce(20)

        frontLogo.changeRelativeSize(geometryOptions)

        expect(frontLogo.scale.x).toBe(1)
        expect(frontLogo.scale.y).toBe(1)
        expect(frontLogo.translateY).toHaveBeenCalledWith(5)
        expect(frontLogo.translateX).toHaveBeenCalled()

        frontLogo = new (class extends FrontLogo {
            async init(): Promise<GeneralMesh> {
                return undefined
            }
            getWidth() {
                return this.geometry ? this.geometry.boundingBox.max.x - this.geometry.boundingBox.min.x : 0
            }
        })("testLogo", "right")
        frontLogo.translateX = jest.fn()
        frontLogo.translateY = jest.fn()

        geometryOptions = {
            frontTextSize: 10,
            secondRowTextSize: 5,
            secondRowVisible: false
        } as unknown as GeometryOptions

        frontLogo.getWidth = jest.fn().mockReturnValueOnce(20).mockReturnValueOnce(20)

        frontLogo.changeRelativeSize(geometryOptions)

        expect(frontLogo.scale.x).toBe(1)
        expect(frontLogo.scale.y).toBe(1)
        expect(frontLogo.translateY).toHaveBeenCalledWith(5)
        expect(frontLogo.translateX).toHaveBeenCalled()
    })
})
