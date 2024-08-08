import { BackBelowLogoTextMesh } from "./backBelowLogoTextMesh"
import { TextMesh } from "../textMesh"
import { BackPrintColorChangeStrategy } from "../../ColorChangeStrategies/backPrintColorChangeStrategy"
import helvetiker from "three/examples/fonts/helvetiker_regular.typeface.json"
import { Font } from "three"

jest.mock("../textMesh", () => {
    return {
        TextMesh: jest.fn()
    }
})

describe("BackBelowLogoTextMesh", () => {
    let font: Font

    beforeAll(() => {
        font = new Font(helvetiker)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should initialize with correct geometry options", () => {
        const name = "testTextMesh"
        new BackBelowLogoTextMesh(name, font)

        expect(TextMesh).toHaveBeenCalledWith(name, expect.any(BackPrintColorChangeStrategy), 200, true, {
            font,
            text: "IT Stabilization & Modernization\nmaibornwolff.de/service/it-sanierung",
            side: "back",
            xPosition: 0,
            yPosition: 0.23,
            align: "center"
        })
    })
})
