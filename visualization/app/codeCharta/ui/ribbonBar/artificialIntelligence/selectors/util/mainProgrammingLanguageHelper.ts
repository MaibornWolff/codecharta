export function getMostFrequentLanguage(numberOfFilesPerLanguage: Map<string, number>): string | undefined {
    let language
    let max = -1
    for (const [key, filesPerLanguage] of numberOfFilesPerLanguage) {
        if (max < filesPerLanguage) {
            max = filesPerLanguage
            language = key
        }
    }
    return language
}
