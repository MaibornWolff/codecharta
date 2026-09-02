package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.LanguageKeywords
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.ResourceKeywordLoader
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

    private data class ExclusionScope(val filePath: Path, val language: Language?)

    private val excludedWordsCache = ConcurrentHashMap<ExclusionScope, Set<String>>()

    fun isExcluded(word: String, filePath: Path, language: Language? = null): Boolean =
        isExcludedFrom(word, getExcludedWordsFor(ExclusionScope(filePath, language)))

    private fun isExcludedFrom(word: String, excludedWords: Set<String>): Boolean {
        if (word in excludedWords) return true
        if (word.contains(' ')) {
            return word.split(' ').any { it in excludedWords }
        }
        return false
    }

    private fun getExcludedWordsFor(scope: ExclusionScope): Set<String> = excludedWordsCache.computeIfAbsent(scope) {
        val frameworkKeywords =
            pathScopedKeywordProvider
                .getFrameworkKeywordsForFile(it.filePath)
                .flatMap { keywords -> keywords.getKeywords() }
                .toSet()
        allExcludedWords + frameworkKeywords + (it.language?.keywords?.getKeywords() ?: emptySet())
    }

    fun clearCache() {
        excludedWordsCache.clear()
    }
}
