package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.joinPath
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.splitPath

object DirectoryWordAggregator {
    fun aggregateDirectories(
        fileWords: Map<String, List<WordFrequency>>,
        tfidfScores: Map<String, Double> = emptyMap()
    ): Map<String, List<WordFrequency>> {
        val result = mutableMapOf<String, MutableMap<String, Int>>()

        // Add all file-level word frequencies
        fileWords.forEach { (filePath, words) ->
            result[filePath] = words.associate { it.text to it.frequency }.toMutableMap()
        }

        // Aggregate words for each directory level
        fileWords.keys.forEach { filePath ->
            val words = fileWords[filePath] ?: emptyList()

            // Get all parent directories
            val directories = getParentDirectories(filePath)

            // Aggregate words to each parent directory
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
        val parts = splitPath(filePath)

        // Build list: root + intermediate directories
        return buildList {
            add(".")
            for (i in 0 until parts.size - 1) {
                add(joinPath(*parts.subList(0, i + 1).toTypedArray()))
            }
        }
    }
}
