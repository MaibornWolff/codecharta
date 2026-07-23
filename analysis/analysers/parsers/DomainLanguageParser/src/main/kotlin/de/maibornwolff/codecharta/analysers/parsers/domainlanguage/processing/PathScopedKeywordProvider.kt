package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.LanguageKeywords
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.ResourceKeywords
import java.nio.file.Path

class PathScopedKeywordProvider(private val frameworksByPath: Map<Path, Set<Framework>>) {
    private val keywordCache = mutableMapOf<Framework, LanguageKeywords>()

    companion object {
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

    private fun findApplicableFrameworks(filePath: Path): Set<Framework> = frameworksByPath
        .filterKeys { frameworkDir -> isFileUnderDirectory(filePath, frameworkDir) }
        .values
        .flatten()
        .toSet()

    private fun isFileUnderDirectory(filePath: Path, directory: Path): Boolean {
        val normalizedFile = filePath.normalize()
        val normalizedDir = directory.normalize()
        return normalizedFile.startsWith(normalizedDir)
    }
}
