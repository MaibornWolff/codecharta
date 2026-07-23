import { DomainLensData, DomainWord } from "../../../../model/codeCharta.model"

export type CombineWords = (mergedWord: DomainWord, word: DomainWord) => DomainWord

export class DomainWordBankAccumulator {
    private readonly wordsByTextPerPath = new Map<string, Map<string, DomainWord>>()

    add(path: string, words: DomainWord[], combineWords: CombineWords): void {
        const wordsByText = this.wordsByTextOf(path)
        for (const word of words) {
            const mergedWord = wordsByText.get(word.text)
            wordsByText.set(word.text, mergedWord ? combineWords(mergedWord, word) : { ...word })
        }
    }

    toDomainLensData(): DomainLensData {
        const domainWords: DomainLensData = {}
        for (const [path, wordsByText] of this.wordsByTextPerPath) {
            domainWords[path] = [...wordsByText.values()]
        }
        return domainWords
    }

    private wordsByTextOf(path: string): Map<string, DomainWord> {
        let wordsByText = this.wordsByTextPerPath.get(path)
        if (!wordsByText) {
            wordsByText = new Map()
            this.wordsByTextPerPath.set(path, wordsByText)
        }
        return wordsByText
    }
}
