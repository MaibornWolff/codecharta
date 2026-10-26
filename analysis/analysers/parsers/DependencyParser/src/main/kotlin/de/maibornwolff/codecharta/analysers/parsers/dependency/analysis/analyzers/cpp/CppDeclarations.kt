package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp

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
    private val visibleNamesByFile = ConcurrentHashMap<List<String>, CppVisibleNames>()
    private val bodyFilesByPath: Map<List<String>, List<List<String>>> by lazy { readBodyFiles() }

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

    /** The files of the closure of [file] that declare the body of [path], in include order. */
    fun bodyFilesInClosure(file: List<String>, path: List<String>): List<List<String>> =
        includes.closureOf(file).filter { closureFile -> factsOf(closureFile).declarations.any { it.path == path && it.hasBody } }

    /** Every file below the root that declares the body of [path], in path order. */
    fun bodyFilesOf(path: List<String>): List<List<String>> = bodyFilesByPath[path].orEmpty()

    private fun bodyFileIn(closureFiles: Set<List<String>>, classPath: List<String>): List<String>? =
        closureFiles.firstOrNull { closureFile -> factsOf(closureFile).declarations.any { it.path == classPath && it.hasBody } }

    private fun factsOf(file: List<String>): CppFileFacts = factsByFile[file] ?: run {
        val source = analysisRoot.resolve(file.joinToString(File.separator))
        val facts = CppFileFacts.of(TreeSitterDependencies.analyze(source.readText(), Language.CPP))
        factsByFile.putIfAbsent(file, facts) ?: facts
    }

    private fun readBodyFiles(): Map<List<String>, List<List<String>>> = includes.files
        .flatMap { file -> factsOf(file).declarations.filter { it.hasBody }.map { it.path to file } }
        .groupBy({ it.first }, { it.second })
        .mapValues { (_, files) -> files.distinct() }

    companion object {
        private val declarationsByRoot = ConcurrentHashMap<String, CppDeclarations>()

        /** The declarations of [analysisRoot], read once per root, as every C and C++ file of an analysis asks for them. */
        fun of(analysisRoot: File): CppDeclarations =
            declarationsByRoot.computeIfAbsent(analysisRoot.absolutePath) { CppDeclarations(analysisRoot, CppIncludes.of(analysisRoot)) }
    }
}
