export function detectProgrammingLanguageByOccurrence(numberOfFilesPerLanguage: Map<string, number>, fileExtension: string) {
	const filesPerLanguage = numberOfFilesPerLanguage.get(fileExtension) ?? 0
	numberOfFilesPerLanguage.set(fileExtension, filesPerLanguage + 1)
}

export function getMostFrequentLanguage(numberOfFilesPerLanguage: Map<string, number>) {
	let language = ""
	if (numberOfFilesPerLanguage.size > 0) {
		let max = -1
		for (const [key, filesPerLanguage] of numberOfFilesPerLanguage) {
			if (max < filesPerLanguage) {
				max = filesPerLanguage
				language = key
			}
		}
	}
	return language
}
