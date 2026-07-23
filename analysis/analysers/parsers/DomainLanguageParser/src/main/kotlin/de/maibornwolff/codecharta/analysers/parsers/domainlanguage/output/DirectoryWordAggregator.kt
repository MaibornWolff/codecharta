package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.PathUtils

object DirectoryWordAggregator {
    private const val PROJECT_ROOT = "."

    fun aggregateDirectories(
        fileWords: Map<String, List<WordFrequency>>,
        tfidfScores: Map<String, Double> = emptyMap()
    ): Map<String, List<WordFrequency>> {
        val wordCountsByPath = seedWithFileWords(fileWords)
        rollUpIntoParentDirectories(fileWords, wordCountsByPath)

        return wordCountsByPath.mapValues { (_, wordCounts) ->
            wordCounts.map { (text, frequency) -> WordFrequency.withScore(text, frequency, tfidfScores) }
        }
    }

    private fun seedWithFileWords(fileWords: Map<String, List<WordFrequency>>): MutableMap<String, MutableMap<String, Int>> {
        val wordCountsByPath = mutableMapOf<String, MutableMap<String, Int>>()
        fileWords.forEach { (filePath, words) ->
            wordCountsByPath[filePath] = words.associateTo(mutableMapOf()) { it.text to it.frequency }
        }
        return wordCountsByPath
    }

    private fun rollUpIntoParentDirectories(
        fileWords: Map<String, List<WordFrequency>>,
        wordCountsByPath: MutableMap<String, MutableMap<String, Int>>
    ) {
        fileWords.forEach { (filePath, words) ->
            getParentDirectories(filePath).forEach { directoryPath ->
                val directoryWords = wordCountsByPath.getOrPut(directoryPath) { mutableMapOf() }
                words.forEach { word -> directoryWords.merge(word.text, word.frequency, Int::plus) }
            }
        }
    }

    private fun getParentDirectories(filePath: String): List<String> {
        val parts = PathUtils.splitPath(filePath)

        return buildList {
            add(PROJECT_ROOT)
            for (depth in 0 until parts.size - 1) {
                add(PathUtils.joinPath(*parts.subList(0, depth + 1).toTypedArray()))
            }
        }
    }
}
