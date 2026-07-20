import { CCFile, DomainLensData, DomainWord } from "../../../../model/codeCharta.model"
import { fileRoot } from "../../../../util/fileRoot"
import { getUpdatedPath } from "../../../../util/nodePathHelper"

/** How two banks resolve a word they both carry. */
type CombineWords = (mergedWord: DomainWord, word: DomainWord) => DomainWord

/**
 * Combines the path-keyed domain word banks of all visible files into one.
 *
 * In multiple mode the aggregated tree re-roots every file under `/root/<fileName>`, so each file's
 * paths are re-keyed the same way the dependency edges are (see `util/edges/edges.merger.ts`) —
 * otherwise no merged path would match a node of the aggregated map. That tree also gains a synthetic
 * root above the per-file subtrees which carries no bank of its own, so the per-file root banks are
 * additionally aggregated onto it, the way `AggregationGenerator` aggregates the root attributes.
 * Without that the default cloud — the one the root path seeds while nothing is selected — would be
 * empty for every multi-file map.
 *
 * In delta mode the paths are left alone, so reference and comparison collide on every shared path.
 * There the later file wins per word, the way the edges merger overwrites the attributes of an equal
 * edge: summing two revisions of the same map would invent counts that belong to neither of them.
 * Words that only one file carries are kept either way, so no file's bank is silently dropped.
 */
export function getMergedDomainWords(inputFiles: CCFile[], withUpdatedPath: boolean): DomainLensData {
    if (inputFiles.length === 1) {
        return inputFiles[0].settings.fileSettings.domainWords
    }

    const mergedWordsByPath = new Map<string, Map<string, DomainWord>>()
    for (const inputFile of inputFiles) {
        for (const [path, words] of Object.entries(inputFile.settings.fileSettings.domainWords)) {
            if (!withUpdatedPath) {
                addWords(mergedWordsByPath, path, words, keepLaterWord)
                continue
            }

            addWords(mergedWordsByPath, getUpdatedPath(inputFile.fileMeta.fileName, path), words, keepLaterWord)
            if (path === fileRoot.rootPath) {
                addWords(mergedWordsByPath, fileRoot.rootPath, words, aggregateWords)
            }
        }
    }

    const mergedDomainWords: DomainLensData = {}
    for (const [path, wordsByText] of mergedWordsByPath) {
        mergedDomainWords[path] = [...wordsByText.values()]
    }
    return mergedDomainWords
}

function addWords(
    mergedWordsByPath: Map<string, Map<string, DomainWord>>,
    path: string,
    words: DomainWord[],
    combineWords: CombineWords
): void {
    let wordsByText = mergedWordsByPath.get(path)
    if (!wordsByText) {
        wordsByText = new Map()
        mergedWordsByPath.set(path, wordsByText)
    }

    for (const word of words) {
        const mergedWord = wordsByText.get(word.text)
        wordsByText.set(word.text, mergedWord ? combineWords(mergedWord, word) : { ...word })
    }
}

/** The whole record of the later file wins, so its `frequency` and `tfidf` keep describing one file. */
function keepLaterWord(_mergedWord: DomainWord, word: DomainWord): DomainWord {
    return { ...word }
}

/**
 * The synthetic aggregated root spans files that describe disjoint code bases: their `frequency`
 * counts are additive. `tfidf` is a per-file normalized score that cannot be summed or recomputed
 * here, so the strongest signal wins — which, unlike picking a file, does not depend on the file order.
 */
function aggregateWords(mergedWord: DomainWord, word: DomainWord): DomainWord {
    return {
        ...mergedWord,
        frequency: mergedWord.frequency + word.frequency,
        tfidf: maxTfidf(mergedWord.tfidf, word.tfidf)
    }
}

function maxTfidf(mergedTfidf: number | undefined, tfidf: number | undefined): number | undefined {
    if (mergedTfidf === undefined) {
        return tfidf
    }
    return tfidf === undefined ? mergedTfidf : Math.max(mergedTfidf, tfidf)
}
