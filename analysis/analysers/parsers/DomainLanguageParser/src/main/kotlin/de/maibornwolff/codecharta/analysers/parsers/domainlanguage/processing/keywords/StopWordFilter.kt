package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords

import java.nio.file.Path
import java.util.concurrent.ConcurrentHashMap

class StopWordFilter(
    private val globalKeywords: List<LanguageKeywords> = emptyList(),
    private val customStopWords: Set<String> = emptySet(),
    private val keywordLoader: ResourceKeywordLoader = ResourceKeywordLoader(),
    private val pathScopedKeywordProvider: PathScopedKeywordProvider = PathScopedKeywordProvider.NONE
) {
    private val stopWords: Set<String> by lazy {
        keywordLoader.loadFromResource("stopwords/english-stopwords.txt")
    }

    private val allExcludedWords: Set<String> by lazy {
        val globalKeywordSet = globalKeywords.flatMap { it.getKeywords() }.toSet()
        stopWords + globalKeywordSet + customStopWords
    }

    private data class FileScope(val filePath: Path, val language: Language?)

    private data class ExclusionScope(val frameworkKeywords: List<LanguageKeywords>, val language: Language?)

    // A few scopes hold the excluded words, each shared by the files of the same frameworks and language: a set per
    // file held thousands of copies of the same words until the run ended
    private val excludedWordsByScope = ConcurrentHashMap<ExclusionScope, Set<String>>()
    private val excludedWordsByFile = ConcurrentHashMap<FileScope, Set<String>>()

    fun isExcluded(word: String, filePath: Path, language: Language? = null): Boolean =
        isExcludedFrom(word, getExcludedWordsFor(FileScope(filePath, language)))

    private fun isExcludedFrom(word: String, excludedWords: Set<String>): Boolean {
        if (word in excludedWords) return true
        if (word.contains(' ')) {
            return word.split(' ').any { it in excludedWords }
        }
        return false
    }

    private fun getExcludedWordsFor(fileScope: FileScope): Set<String> = excludedWordsByFile.computeIfAbsent(fileScope) {
        val frameworkKeywords = pathScopedKeywordProvider.getFrameworkKeywordsForFile(it.filePath)
        excludedWordsByScope.computeIfAbsent(ExclusionScope(frameworkKeywords, it.language), ::readExcludedWords)
    }

    private fun readExcludedWords(scope: ExclusionScope): Set<String> {
        val frameworkKeywords = scope.frameworkKeywords.flatMap { keywords -> keywords.getKeywords() }.toSet()
        return allExcludedWords + frameworkKeywords + (scope.language?.keywords?.getKeywords() ?: emptySet())
    }

    fun clearCache() {
        excludedWordsByFile.clear()
        excludedWordsByScope.clear()
    }
}
