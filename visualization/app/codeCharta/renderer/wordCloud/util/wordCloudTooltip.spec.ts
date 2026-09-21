import { WordCloudDatum } from "./wordCloudOption.model"
import { buildTooltipFormatter } from "./wordCloudTooltip"

const datumOf = (overrides: Partial<WordCloudDatum> = {}): WordCloudDatum => ({
    name: "parser",
    value: 12,
    frequency: 12,
    textStyle: { color: "#000000" },
    ...overrides
})

describe("buildTooltipFormatter", () => {
    it("should show the word and its frequency", () => {
        // Arrange
        const formatTooltip = buildTooltipFormatter()

        // Act
        const tooltip = formatTooltip({ name: "parser", data: datumOf() })

        // Assert
        expect(tooltip).toBe("<b>parser</b><br/>Frequency: 12")
    })

    it("should show the tf-idf when the word carries one", () => {
        // Arrange
        const formatTooltip = buildTooltipFormatter()

        // Act
        const tooltip = formatTooltip({ name: "parser", data: datumOf({ tfidf: 0.123_456 }) })

        // Assert
        expect(tooltip).toBe("<b>parser</b><br/>Frequency: 12<br/>TF-IDF: 0.123")
    })

    it("should escape markup in a word, because the word comes from the loaded file", () => {
        // Arrange
        const formatTooltip = buildTooltipFormatter()
        const word = `<img src=x onerror="alert(1)">`

        // Act
        const tooltip = formatTooltip({ name: word, data: datumOf({ name: word }) })

        // Assert
        expect(tooltip).toBe("<b>&lt;img src=x onerror=&quot;alert(1)&quot;&gt;</b><br/>Frequency: 12")
    })

    it("should escape ampersands so an escaped word cannot be read as markup", () => {
        // Arrange
        const formatTooltip = buildTooltipFormatter()

        // Act
        const tooltip = formatTooltip({ name: "&lt;b&gt;", data: datumOf({ name: "&lt;b&gt;" }) })

        // Assert
        expect(tooltip).toBe("<b>&amp;lt;b&amp;gt;</b><br/>Frequency: 12")
    })
})
