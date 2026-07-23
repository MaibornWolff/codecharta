import { DomainWord } from "../../../../model/codeCharta.model"

export function keepLaterWord(_mergedWord: DomainWord, word: DomainWord): DomainWord {
    return { ...word }
}

export function sumFrequenciesAndKeepStrongestTfidf(mergedWord: DomainWord, word: DomainWord): DomainWord {
    return {
        ...mergedWord,
        frequency: mergedWord.frequency + word.frequency,
        tfidf: strongestTfidf(mergedWord.tfidf, word.tfidf)
    }
}

function strongestTfidf(mergedTfidf: number | undefined, tfidf: number | undefined): number | undefined {
    if (mergedTfidf === undefined) {
        return tfidf
    }
    return tfidf === undefined ? mergedTfidf : Math.max(mergedTfidf, tfidf)
}
