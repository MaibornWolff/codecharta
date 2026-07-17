package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.output

/**
 * Structured result of a domain-language analysis, ready to be turned into a cc.json `domain` lens.
 *
 * @property filePaths relative paths (from the scan root) of every analyzed file — the leaves of the
 *   files tree.
 * @property wordsByPath the domain words for every file path AND every aggregated directory path
 *   (including the root `"."`), already sorted and limited. Keys line up with [filePaths] for leaves
 *   and with their ancestor directories for folders.
 */
data class DomainAnalysisResult(val filePaths: List<String>, val wordsByPath: Map<String, List<WordFrequency>>)
