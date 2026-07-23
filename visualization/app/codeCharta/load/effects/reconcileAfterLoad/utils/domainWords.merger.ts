import { CCFile, DomainLensData } from "../../../../model/codeCharta.model"
import { fileRoot } from "../../../../util/fileRoot"
import { getUpdatedPath } from "../../../../util/nodePathHelper"
import { keepLaterWord, sumFrequenciesAndKeepStrongestTfidf } from "./domainWord.combiners"
import { DomainWordBankAccumulator } from "./domainWordBank.accumulator"

export function getMergedDomainWords(inputFiles: CCFile[], withUpdatedPath: boolean): DomainLensData {
    if (inputFiles.length === 1) {
        return inputFiles[0].settings.fileSettings.domainWords
    }

    const accumulator = new DomainWordBankAccumulator()
    for (const inputFile of inputFiles) {
        for (const [path, words] of Object.entries(inputFile.settings.fileSettings.domainWords)) {
            if (!withUpdatedPath) {
                accumulator.add(path, words, keepLaterWord)
                continue
            }

            accumulator.add(getUpdatedPath(inputFile.fileMeta.fileName, path), words, keepLaterWord)
            if (path === fileRoot.rootPath) {
                accumulator.add(fileRoot.rootPath, words, sumFrequenciesAndKeepStrongestTfidf)
            }
        }
    }
    return accumulator.toDomainLensData()
}
