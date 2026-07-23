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
