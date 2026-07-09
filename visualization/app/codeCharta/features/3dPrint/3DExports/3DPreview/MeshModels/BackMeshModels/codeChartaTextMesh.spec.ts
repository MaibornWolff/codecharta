import { Font } from "three/addons/loaders/FontLoader.js"
import helvetiker from "three/examples/fonts/helvetiker_regular.typeface.json"
import { BackPrintColorChangeStrategy } from "../../ColorChangeStrategies/backPrintColorChangeStrategy"
import { TextMesh } from "../textMesh"
import { CodeChartaTextMesh } from "./codeChartaTextMesh"

jest.mock("../textMesh", () => {
    return {
        TextMesh: jest.fn()
    }
})

describe("CodeChartaTextMesh", () => {
    let font: Font

    beforeAll(() => {
        font = new Font(helvetiker)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should initialize with correct geometry options", () => {
        const name = "testTextMesh"
        new CodeChartaTextMesh(name, font)

        expect(TextMesh).toHaveBeenCalledWith(name, expect.any(BackPrintColorChangeStrategy), 200, true, {
            font,
            text: "github.com/MaibornWolff/codecharta",
            side: "back",
            xPosition: 0,
            yPosition: 0,
            align: "center"
        })
    })
})
