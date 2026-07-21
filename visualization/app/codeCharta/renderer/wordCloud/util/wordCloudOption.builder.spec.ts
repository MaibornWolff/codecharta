import { DomainWord } from "../../../model/codeCharta.model"
import { defaultWordCloudSettings, WordCloudSettings, WordCloudSizingMode } from "../../../model/wordCloud.model"
import { buildWordCloudOption, selectTopWords } from "./wordCloudOption.builder"

// The builder reads its palette from the DOM. Stubbed here so the colour assertions stay
// deterministic without the builder having to accept an injected palette it never gets in production.
jest.mock("./color.util", () => ({
    ...jest.requireActual("./color.util"),
    getWordCloudColors: () => ["#000000", "#ffffff"]
}))

describe("selectTopWords", () => {
    it("should rank by frequency and truncate to the top-N in frequency mode", () => {
        // Arrange
        const words: DomainWord[] = [
            { text: "low", frequency: 1 },
            { text: "high", frequency: 100 },
            { text: "mid", frequency: 50 }
        ]

        // Act
        const topWords = selectTopWords(words, WordCloudSizingMode.frequency, 2)

        // Assert
        expect(topWords.map(word => word.text)).toEqual(["high", "mid"])
    })

    it("should rank by tfidf in tfidf mode so the ranking matches what is drawn", () => {
        // Arrange
        const words: DomainWord[] = [
            { text: "common", frequency: 100, tfidf: 0.1 },
            { text: "distinctive", frequency: 5, tfidf: 0.9 }
        ]

        // Act
        const topWords = selectTopWords(words, WordCloudSizingMode.tfidf, 1)

        // Assert
        expect(topWords.map(word => word.text)).toEqual(["distinctive"])
    })

    it("should not mutate the words it was given", () => {
        // Arrange
        const words: DomainWord[] = [
            { text: "low", frequency: 1 },
            { text: "high", frequency: 100 }
        ]

        // Act
        selectTopWords(words, WordCloudSizingMode.frequency, 2)

        // Assert
        expect(words.map(word => word.text)).toEqual(["low", "high"])
    })
})

describe("buildWordCloudOption", () => {
    const context = {}

    function settings(overrides: Partial<WordCloudSettings> = {}): WordCloudSettings {
        return { ...defaultWordCloudSettings, ...overrides }
    }

    it("should map each word to an ECharts datum keyed by text and frequency", () => {
        // Arrange
        const words: DomainWord[] = [{ text: "invoice", frequency: 12 }]

        // Act
        const option = buildWordCloudOption(words, settings(), context)

        // Assert
        expect(option.series[0].data[0].name).toBe("invoice")
        expect(option.series[0].data[0].value).toBe(12)
    })

    it("should use tfidf as the value when the sizing mode is tfidf", () => {
        // Arrange
        const words: DomainWord[] = [{ text: "invoice", frequency: 12, tfidf: 0.8 }]

        // Act
        const option = buildWordCloudOption(words, settings({ sizingMode: WordCloudSizingMode.tfidf }), context)

        // Assert
        expect(option.series[0].data[0].value).toBe(0.8)
    })

    it("should fall back to frequency when tfidf is missing in tfidf mode", () => {
        // Arrange
        const words: DomainWord[] = [{ text: "invoice", frequency: 7 }]

        // Act
        const option = buildWordCloudOption(words, settings({ sizingMode: WordCloudSizingMode.tfidf }), context)

        // Assert
        expect(option.series[0].data[0].value).toBe(7)
    })

    it("should keep only the top-N words ranked by value", () => {
        // Arrange
        const words: DomainWord[] = [
            { text: "low", frequency: 1 },
            { text: "high", frequency: 100 },
            { text: "mid", frequency: 50 }
        ]

        // Act
        const option = buildWordCloudOption(words, settings({ topN: 2 }), context)

        // Assert
        expect(option.series[0].data.map(datum => datum.name)).toEqual(["high", "mid"])
    })

    it("should not mutate the input words array when sorting", () => {
        // Arrange
        const words: DomainWord[] = [
            { text: "a", frequency: 1 },
            { text: "b", frequency: 100 }
        ]

        // Act
        buildWordCloudOption(words, settings(), context)

        // Assert
        expect(words.map(word => word.text)).toEqual(["a", "b"])
    })

    it("should paint each word a gradient stop derived from its text", () => {
        // Arrange — "a" hashes to the gradient position 0.097
        const words: DomainWord[] = [{ text: "a", frequency: 3 }]

        // Act
        const option = buildWordCloudOption(words, settings(), context)

        // Assert — 9.7% of the way from #000000 to #ffffff is 25 per channel
        expect(option.series[0].data[0].textStyle.color).toBe("#191919")
    })

    it("should give a word the same color on every build so an unrelated setting change does not recolor it", () => {
        // Arrange
        const words: DomainWord[] = [{ text: "invoice", frequency: 12 }]

        // Act
        const first = buildWordCloudOption(words, settings({ gridSize: 4 }), context)
        const second = buildWordCloudOption(words, settings({ gridSize: 32 }), context)

        // Assert
        expect(second.series[0].data[0].textStyle.color).toBe(first.series[0].data[0].textStyle.color)
    })

    it("should carry the layout settings onto the series", () => {
        // Act
        const option = buildWordCloudOption([], settings({ gridSize: 16, rotationStep: 30 }), context)

        // Assert
        const series = option.series[0]
        expect(series.type).toBe("wordCloud")
        expect(series.shape).toBe(defaultWordCloudSettings.shape)
        expect(series.gridSize).toBe(16)
        expect(series.rotationStep).toBe(30)
        expect(series.drawOutOfBound).toBe(false)
    })

    it("should let words render outside the bounds when draw out of bound is enabled", () => {
        // Act
        const option = buildWordCloudOption([], settings({ drawOutOfBound: true }), context)

        // Assert
        expect(option.series[0].drawOutOfBound).toBe(true)
    })

    it("should keep the configured size range when draw out of bound is enabled", () => {
        // Arrange — this word would force a clamped range in a container this narrow
        const words: DomainWord[] = [{ text: "averylongdomainidentifier", frequency: 10 }]

        // Act
        const option = buildWordCloudOption(words, settings({ sizeRange: [12, 60], drawOutOfBound: true }), {
            ...context,
            containerWidth: 100
        })

        // Assert — nothing is dropped with drawOutOfBound on, so no clamp is needed
        expect(option.series[0].sizeRange).toEqual([12, 60])
    })

    it("should shrink words that do not fit when fitting all words is enabled", () => {
        // Act
        const option = buildWordCloudOption([], settings({ shrinkToFit: true }), context)

        // Assert — with drawOutOfBound false, shrinkToFit is what keeps the rendered count at the top-N
        expect(option.series[0].shrinkToFit).toBe(true)
    })

    it("should leave words that do not fit out when fitting all words is disabled", () => {
        // Act
        const option = buildWordCloudOption([], settings({ shrinkToFit: false }), context)

        // Assert
        expect(option.series[0].shrinkToFit).toBe(false)
    })

    it("should never collapse the min font size below one for a long word in a narrow container", () => {
        // Arrange — this word at any readable size dwarfs a 20px container
        const words: DomainWord[] = [{ text: "internationalizationconfiguration", frequency: 12 }]

        // Act
        const option = buildWordCloudOption(words, settings({ sizeRange: [12, 60] }), { ...context, containerWidth: 20 })

        // Assert
        const [minSize, maxSize] = option.series[0].sizeRange
        expect(minSize).toBeGreaterThanOrEqual(1)
        expect(maxSize).toBeGreaterThanOrEqual(minSize)
    })

    it("should produce an empty data set when there are no words", () => {
        // Act
        const option = buildWordCloudOption([], settings(), context)

        // Assert
        expect(option.series[0].data).toEqual([])
    })

    it("should enable the accessible representation and the value tooltip", () => {
        // Act
        const option = buildWordCloudOption([], settings(), context)

        // Assert
        expect(option.aria.enabled).toBe(true)
        expect(option.tooltip.show).toBe(true)
    })

    it("should report both metrics in the tooltip, with the word emphasized", () => {
        // Arrange
        const option = buildWordCloudOption([], settings(), context)

        // Act
        const tooltip = option.tooltip.formatter({
            name: "invoice",
            data: { name: "invoice", value: 42, frequency: 42, tfidf: 0.8125, textStyle: { color: "#000000" } }
        })

        // Assert
        expect(tooltip).toBe("<b>invoice</b><br/>Frequency: 42<br/>TF-IDF: 0.813")
    })

    it("should report both metrics in the tooltip regardless of the sizing mode", () => {
        // Arrange
        const option = buildWordCloudOption([], settings({ sizingMode: WordCloudSizingMode.tfidf }), context)

        // Act
        const tooltip = option.tooltip.formatter({
            name: "invoice",
            data: { name: "invoice", value: 0.8125, frequency: 42, tfidf: 0.8125, textStyle: { color: "#000000" } }
        })

        // Assert
        expect(tooltip).toBe("<b>invoice</b><br/>Frequency: 42<br/>TF-IDF: 0.813")
    })

    it("should omit the tf-idf row when the word carries no score", () => {
        // Arrange
        const option = buildWordCloudOption([], settings(), context)

        // Act
        const tooltip = option.tooltip.formatter({
            name: "invoice",
            data: { name: "invoice", value: 42, frequency: 42, textStyle: { color: "#000000" } }
        })

        // Assert
        expect(tooltip).toBe("<b>invoice</b><br/>Frequency: 42")
    })

    it("should carry both metrics on each datum so the tooltip can report them", () => {
        // Act
        const option = buildWordCloudOption([{ text: "invoice", frequency: 42, tfidf: 0.8125 }], settings(), context)

        // Assert
        expect(option.series[0].data[0]).toMatchObject({ name: "invoice", frequency: 42, tfidf: 0.8125 })
    })

    it("should animate the layout by default", () => {
        // Act
        const option = buildWordCloudOption([], settings(), context)

        // Assert
        expect(option.series[0].layoutAnimation).toBe(true)
    })

    it("should disable the layout animation when the caller asks for reduced motion", () => {
        // Act
        const option = buildWordCloudOption([], settings(), { ...context, layoutAnimation: false })

        // Assert
        expect(option.series[0].layoutAnimation).toBe(false)
    })

    it("should shrink the max font size so the longest word still fits a narrow container", () => {
        // Arrange — "internationalization" at 120px would be far wider than a 300px container
        const words: DomainWord[] = [{ text: "internationalization", frequency: 12 }]

        // Act
        const option = buildWordCloudOption(words, settings({ sizeRange: [12, 120] }), { ...context, containerWidth: 300 })

        // Assert
        expect(option.series[0].sizeRange[1]).toBeLessThan(120)
    })

    it("should keep the requested size range when the container is wide enough", () => {
        // Arrange
        const words: DomainWord[] = [{ text: "invoice", frequency: 12 }]

        // Act
        const option = buildWordCloudOption(words, settings({ sizeRange: [12, 60] }), { ...context, containerWidth: 2000 })

        // Assert
        expect(option.series[0].sizeRange).toEqual([12, 60])
    })

    it("should highlight rather than black out the other words on hover", () => {
        // Act
        const option = buildWordCloudOption([], settings(), context)

        // Assert
        expect(option.series[0].blur.textStyle.opacity).toBeGreaterThan(0.5)
    })
})
