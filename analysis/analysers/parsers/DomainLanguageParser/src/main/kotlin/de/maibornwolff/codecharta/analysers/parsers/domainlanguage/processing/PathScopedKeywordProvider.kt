package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.LanguageKeywords
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.ResourceKeywords
import java.nio.file.Path

/**
 * Provides framework-specific keywords based on file location.
 *
 * Maintains a registry of detected frameworks by path and determines
 * which framework keywords apply to each file based on its location
 * relative to the framework directories.
 */
class PathScopedKeywordProvider(private val frameworksByPath: Map<Path, Set<Framework>>) {
    private val keywordCache = mutableMapOf<Framework, LanguageKeywords>()

    companion object {
        /**
         * A null-object instance that provides no framework keywords.
         * Use this instead of null when no path-scoped filtering is needed.
         */
        val NONE: PathScopedKeywordProvider = PathScopedKeywordProvider(emptyMap())
    }

    fun getFrameworkKeywordsForFile(filePath: Path): List<LanguageKeywords> {
        val applicableFrameworks = findApplicableFrameworks(filePath)
        return applicableFrameworks.mapNotNull { framework ->
            keywordCache.getOrPut(framework) {
                when (framework) {
                    Framework.ANGULAR -> ResourceKeywords("keywords/angular-keywords.txt")
                    Framework.REACT -> ResourceKeywords("keywords/react-keywords.txt")
                    Framework.ASPNET -> ResourceKeywords("keywords/aspnet-keywords.txt")
                    Framework.ENTITYFRAMEWORK -> ResourceKeywords("keywords/entityframework-keywords.txt")
                }
            }
        }
    }

    private fun findApplicableFrameworks(filePath: Path): Set<Framework> {
        for ((frameworkDir, frameworks) in frameworksByPath) {
            if (isFileUnderDirectory(filePath, frameworkDir)) {
                return frameworks
            }
        }
        return emptySet()
    }

    private fun isFileUnderDirectory(filePath: Path, directory: Path): Boolean {
        val normalizedFile = filePath.normalize()
        val normalizedDir = directory.normalize()
        return normalizedFile.startsWith(normalizedDir)
    }
}
