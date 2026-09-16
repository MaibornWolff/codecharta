import { DomainWord } from "../../../model/codeCharta.model"
import { WordCloudSizingMode } from "../../../model/wordCloud.model"
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
})
