package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.PathUtils

object DirectoryWordAggregator {
    fun aggregateDirectories(
        fileWords: Map<String, List<WordFrequency>>,
        tfidfScores: Map<String, Double> = emptyMap()
    ): Map<String, List<WordFrequency>> {
        val result = mutableMapOf<String, MutableMap<String, Int>>()

        fileWords.forEach { (filePath, words) ->
            result[filePath] = words.associate { it.text to it.frequency }.toMutableMap()
        }

        fileWords.keys.forEach { filePath ->
            val words = fileWords[filePath] ?: emptyList()

            val directories = getParentDirectories(filePath)

            directories.forEach { dirPath ->
                val dirWords = result.getOrPut(dirPath) { mutableMapOf() }
                words.forEach { word ->
                    dirWords[word.text] = (dirWords[word.text] ?: 0) + word.frequency
                }
            }
        }

        // Convert to List<WordFrequency> with TF-IDF scores (caller handles sorting)
        return result.mapValues { (_, wordMap) ->
            wordMap.map { (text, freq) -> WordFrequency(text = text, frequency = freq, tfidf = tfidfScores[text]) }
        }
    }

    private fun getParentDirectories(filePath: String): List<String> {
        val parts = PathUtils.splitPath(filePath)

        return buildList {
            // "." is the project root node every file also rolls up into.
            add(".")
            for (i in 0 until parts.size - 1) {
                add(PathUtils.joinPath(*parts.subList(0, i + 1).toTypedArray()))
            }
        }
    }
}
