import { DomainWord } from "../../../model/codeCharta.model"
import { WordCloudSizingMode, wordSizingValue } from "../../../model/wordCloud.model"
import { selectTopWords } from "./topWords"

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

    it("should break ties by the order it was given, so the same words are always picked", () => {
        // Arrange — more equally frequent words than fit, so the tie alone decides the cut-off
        const words: DomainWord[] = [
            { text: "first", frequency: 5 },
            { text: "second", frequency: 5 },
            { text: "third", frequency: 5 },
            { text: "fourth", frequency: 5 }
        ]

        // Act
        const topWords = selectTopWords(words, WordCloudSizingMode.frequency, 2)

        // Assert
        expect(topWords.map(word => word.text)).toEqual(["first", "second"])
    })

    it("should rank a word above an equally frequent one that came later", () => {
        // Arrange
        const words: DomainWord[] = [
            { text: "low", frequency: 1 },
            { text: "early", frequency: 9 },
            { text: "late", frequency: 9 }
        ]

        // Act
        const topWords = selectTopWords(words, WordCloudSizingMode.frequency, 3)

        // Assert
        expect(topWords.map(word => word.text)).toEqual(["early", "late", "low"])
    })

    it("should return nothing when no word is asked for", () => {
        // Arrange
        const words: DomainWord[] = [{ text: "invoice", frequency: 10 }]

        // Act & Assert
        expect(selectTopWords(words, WordCloudSizingMode.frequency, 0)).toEqual([])
    })

    it("should return every word when more are asked for than exist", () => {
        // Arrange
        const words: DomainWord[] = [
            { text: "low", frequency: 1 },
            { text: "high", frequency: 100 }
        ]

        // Act
        const topWords = selectTopWords(words, WordCloudSizingMode.frequency, 10)

        // Assert
        expect(topWords.map(word => word.text)).toEqual(["high", "low"])
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

    it("should pick what a full sort would, from a heap deep enough to sink through", () => {
        // Arrange — the cases above hold at most two words, so a word never sinks more than one level.
        // 200 words over 20 frequencies build a heap several levels deep, full of ties that decide the
        // cut-off; the seed is fixed so a failure is always the same case.
        const nextRandom = seededRandom(20_260_918)
        const words: DomainWord[] = Array.from({ length: 200 }, (_, index) => ({
            text: `word${index}`,
            frequency: Math.floor(nextRandom() * 20)
        }))

        // Act
        const topWords = selectTopWords(words, WordCloudSizingMode.frequency, 25)

        // Assert
        expect(topWords.map(word => word.text)).toEqual(bestBySorting(words, WordCloudSizingMode.frequency, 25))
    })
})

/** What the ranking must agree with: sort everything, keep the order given for equal values, truncate. */
function bestBySorting(words: DomainWord[], sizingMode: WordCloudSizingMode, topN: number): string[] {
    return words
        .map((word, index) => ({ word, value: wordSizingValue(word, sizingMode), index }))
        .sort((one, other) => other.value - one.value || one.index - other.index)
        .slice(0, topN)
        .map(({ word }) => word.text)
}

function seededRandom(seed: number): () => number {
    let state = seed
    return () => {
        state = (state * 1_103_515_245 + 12_345) % 2_147_483_648
        return state / 2_147_483_648
    }
}
