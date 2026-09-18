import { DomainLensData, DomainWord } from "../../../model/codeCharta.model"
import { sumFrequenciesAndKeepStrongestTfidf } from "../../../util/domainWord.combiners"

const PATH_SEPARATOR = "/"

/**
 * A bank records the words of files. A folder's words are the sum of the files beneath it, derived here
 * on first use and kept, rather than written into the bank: a producer that records them too would make
 * the same project carry its whole vocabulary once per ancestor.
 *
 * A recorded folder entry is ignored for that reason. Loading a file an older producer wrote next to a
 * newer one would otherwise show one folder's numbers as a recorded roll-up and its neighbour's as a sum.
 */
export interface DomainWordIndex {
    readonly pathsWithWords: ReadonlySet<string>
    wordsOf(path: string): DomainWord[]
}

export function createDomainWordIndex(words: DomainLensData): DomainWordIndex {
    const folderPaths = collectFolderPaths(words)
    const filePathsPerFolder = collectFilePathsPerFolder(words, folderPaths)
    const aggregatedWords = new Map<string, DomainWord[]>()

    return {
        pathsWithWords: collectPathsWithWords(words, folderPaths, filePathsPerFolder),
        wordsOf(path: string): DomainWord[] {
            if (!folderPaths.has(path)) {
                return words[path] ?? []
            }
            let aggregate = aggregatedWords.get(path)
            if (!aggregate) {
                aggregate = sumWordsOfFiles(words, filePathsPerFolder.get(path) ?? [])
                aggregatedWords.set(path, aggregate)
            }
            return aggregate
        }
    }
}

const collectFolderPaths = (words: DomainLensData): ReadonlySet<string> => new Set(Object.keys(words).flatMap(ancestorsOf))

function collectFilePathsPerFolder(words: DomainLensData, folderPaths: ReadonlySet<string>): Map<string, string[]> {
    const filePathsPerFolder = new Map<string, string[]>()
    for (const path of filePathsCarryingWords(words, folderPaths)) {
        for (const ancestor of ancestorsOf(path)) {
            const filePaths = filePathsPerFolder.get(ancestor)
            if (filePaths) {
                filePaths.push(path)
            } else {
                filePathsPerFolder.set(ancestor, [path])
            }
        }
    }
    return filePathsPerFolder
}

function collectPathsWithWords(
    words: DomainLensData,
    folderPaths: ReadonlySet<string>,
    filePathsPerFolder: Map<string, string[]>
): ReadonlySet<string> {
    return new Set([...filePathsPerFolder.keys(), ...filePathsCarryingWords(words, folderPaths)])
}

const filePathsCarryingWords = (words: DomainLensData, folderPaths: ReadonlySet<string>): string[] =>
    Object.entries(words).flatMap(([path, wordList]) => (!folderPaths.has(path) && wordList.length > 0 ? [path] : []))

function sumWordsOfFiles(words: DomainLensData, filePaths: string[]): DomainWord[] {
    const wordsByText = new Map<string, DomainWord>()
    for (const filePath of filePaths) {
        for (const word of words[filePath]) {
            const summedWord = wordsByText.get(word.text)
            wordsByText.set(word.text, summedWord ? sumFrequenciesAndKeepStrongestTfidf(summedWord, word) : { ...word })
        }
    }
    return [...wordsByText.values()].sort(byDescendingFrequencyThenText)
}

function byDescendingFrequencyThenText(one: DomainWord, other: DomainWord): number {
    return other.frequency - one.frequency || one.text.localeCompare(other.text)
}

function ancestorsOf(path: string): string[] {
    const segments = path.split(PATH_SEPARATOR)
    const ancestors: string[] = []
    for (let depth = segments.length - 1; depth > 1; depth--) {
        ancestors.push(segments.slice(0, depth).join(PATH_SEPARATOR))
    }
    return ancestors
}
