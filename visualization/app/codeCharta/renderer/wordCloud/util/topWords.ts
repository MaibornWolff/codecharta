import { DomainWord } from "../../../model/codeCharta.model"
import { WordCloudSizingMode, wordSizingValue } from "../../../model/wordCloud.model"

export function selectTopWords(words: DomainWord[], sizingMode: WordCloudSizingMode, topN: number): DomainWord[] {
    return [...words].sort((a, b) => wordSizingValue(b, sizingMode) - wordSizingValue(a, sizingMode)).slice(0, topN)
}
