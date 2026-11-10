package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.DependencyResolverService
import java.io.File

/**
 * The code files one test names. [isInline] marks the tests inside the code file [test], as Rust's `#[cfg(test)]`; they
 * test their own file too.
 */
data class TestLink(val test: FilePath, val isInline: Boolean, val codeFiles: List<FilePath>)

/** The test files of a run, and per test the code files it names directly; a link to another test file is no link. */
class TestLinks(val testFiles: List<FilePath>, val links: List<TestLink>) {
    companion object {
        val NONE = TestLinks(emptyList(), emptyList())

        /**
         * Resolves the tests together with the code, so a test sees the code as the compiler would; the graph of the code
         * itself comes from a run over the code alone, see [codeReportsOf].
         */
        fun of(fileReports: List<FileReport>, isTestFile: (FilePath) -> Boolean, analysisRoot: File? = null): TestLinks {
            val testFiles = fileReports.flatMap { report -> report.nodes.map { FilePath.of(it) } }.distinct().filter(isTestFile)
            if (fileReports.none { report -> report.nodes.any { isTestCode(it, isTestFile) } }) return NONE
            val resolvedNodes = DependencyResolverService.resolveNodes(fileReports)
            val linker = Linker(isTestFile, DeclaringFiles.of(resolvedNodes, analysisRoot))
            val testCode = resolvedNodes.filter { isTestCode(it, isTestFile) }
            val (inlineTests, testFileNodes) = testCode.partition { !isTestFile(FilePath.of(it)) }
            return TestLinks(testFiles, (linker.linksOf(testFileNodes) + linker.inlineLinksOf(inlineTests)).map { it.sorted() })
        }

        /** The reports without the test code, for the graph of the code. */
        fun codeReportsOf(fileReports: List<FileReport>, isTestFile: (FilePath) -> Boolean): List<FileReport> = fileReports
            .map { report -> FileReport(report.nodes.filterNot { isTestCode(it, isTestFile) }) }
            .filter { it.nodes.isNotEmpty() }

        private fun isTestCode(node: Node, isTestFile: (FilePath) -> Boolean): Boolean = node.isTest || isTestFile(FilePath.of(node))

        private fun TestLink.sorted(): TestLink = copy(codeFiles = codeFiles.distinct().sortedBy { it.graphId })
    }

    private class Linker(private val isTestFile: (FilePath) -> Boolean, private val declaringFiles: DeclaringFiles) {
        fun linksOf(tests: Collection<Node>, isInline: Boolean = false): List<TestLink> = FileLevelAggregator
            .aggregate(tests, declaringFiles = declaringFiles)
            .filter { !isTestFile(it.to) }
            .groupBy({ it.from }, { it.to })
            .map { (test, codeFiles) -> TestLink(test, isInline, codeFiles) }

        // A file leaves the links to itself out, while the tests inside a file test it too
        fun inlineLinksOf(inlineTests: Collection<Node>): List<TestLink> {
            val namedElsewhere = linksOf(inlineTests, isInline = true).associateBy { it.test }
            return inlineTests.map { FilePath.of(it) }.distinct().map { file ->
                TestLink(file, isInline = true, listOf(file) + namedElsewhere[file]?.codeFiles.orEmpty())
            }
        }
    }
}
