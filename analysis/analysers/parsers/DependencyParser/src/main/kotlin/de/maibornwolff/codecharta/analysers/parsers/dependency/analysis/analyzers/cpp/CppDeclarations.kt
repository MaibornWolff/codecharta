package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp

import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.DependencyResult
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import java.io.File
import java.util.concurrent.ConcurrentHashMap

/**
 * What every C and C++ file below the analysis root declares, read once per file, and the names each file sees through
 * its include closure. A file is its path below the root in segments, as [CppIncludes] writes it.
 */
internal class CppDeclarations private constructor(private val analysisRoot: File, private val includes: CppIncludes) {
    private val factsByFile = ConcurrentHashMap<List<String>, CppFileFacts>()
    private val parsesByFile = ConcurrentHashMap<List<String>, ParsedFile>()
    private val visibleNamesByFile = ConcurrentHashMap<List<String>, CppVisibleNames>()

    /** The names [file] sees, with the bases of a class looked up in the file that declares its body. */
    fun visibleNamesOf(file: List<String>): CppVisibleNames = visibleNamesByFile[file] ?: run {
        val closureFiles = includes.closureOf(file)
        val names =
            CppVisibleNames(
                closureFiles.map { factsOf(it) },
                { classPath -> bodyFileIn(closureFiles, classPath)?.let { visibleNamesOf(it) } }
            )
        visibleNamesByFile.putIfAbsent(file, names) ?: names
    }

    /**
     * The parse of [file] with the text [text]: the one its include closure reads from the file, unless the text differs
     * from the file, as without the byte order mark the scanner drops.
     */
    fun parseOf(file: List<String>, text: String): DependencyResult {
        val parsed = runCatching { parsedFileOf(file) }.getOrNull()
        return if (parsed != null && parsed.hasText(text)) parsed.result else parse(text)
    }

    private fun bodyFileIn(closureFiles: Set<List<String>>, classPath: List<String>): List<String>? =
        closureFiles.firstOrNull { closureFile -> factsOf(closureFile).declarations.any { it.path == classPath && it.hasBody } }

    // Only C and C++ files declare anything, as the run analyses no other (cpp.md, decision 13)
    private fun factsOf(file: List<String>): CppFileFacts = factsByFile[file] ?: run {
        val facts = if (isCppFile(file)) readFacts(file) else NO_FACTS
        factsByFile.putIfAbsent(file, facts) ?: facts
    }

    private fun readFacts(file: List<String>): CppFileFacts = CppFileFacts.of(parsedFileOf(file).result)

    private fun parsedFileOf(file: List<String>): ParsedFile = parsesByFile.computeIfAbsent(file) {
        val text = analysisRoot.resolve(file.joinToString(File.separator)).readText()
        ParsedFile(text.length, text.hashCode(), parse(text))
    }

    private fun parse(text: String): DependencyResult = TreeSitterDependencies.analyze(text, Language.CPP)

    private fun isCppFile(file: List<String>): Boolean = SupportedLanguage.ofFileName(file.last()) == SupportedLanguage.CPP

    private class ParsedFile(private val textLength: Int, private val textHash: Int, val result: DependencyResult) {
        fun hasText(text: String): Boolean = text.length == textLength && text.hashCode() == textHash
    }

    companion object {
        private val NO_FACTS = CppFileFacts(emptyList(), emptyList(), emptyList())
        private val declarationsByRoot = ConcurrentHashMap<String, CppDeclarations>()

        /** The declarations of [analysisRoot], read once per root, as every C and C++ file of an analysis asks for them. */
        fun of(analysisRoot: File): CppDeclarations =
            declarationsByRoot.computeIfAbsent(analysisRoot.absolutePath) { CppDeclarations(analysisRoot, CppIncludes.of(analysisRoot)) }
    }
}
