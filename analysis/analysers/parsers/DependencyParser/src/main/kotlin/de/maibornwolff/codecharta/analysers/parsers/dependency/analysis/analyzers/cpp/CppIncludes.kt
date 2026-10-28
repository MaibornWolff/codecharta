package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp

import java.io.File
import java.util.concurrent.ConcurrentHashMap

/**
 * The files an `#include` means and the include closure of a file, by "Include paths" and "Visibility" of
 * `docs/name-resolution/cpp.md`, over every file below the analysis root, as an include may name a header without an
 * extension or a fragment such as `.inc`. A file is its path below the root in segments. The include lines are read
 * as text, as only the text tells `"p"` from `<p>`.
 */
internal class CppIncludes private constructor(private val analysisRoot: File, private val allFiles: List<List<String>>) {
    private val fileSet = allFiles.toHashSet()
    private val filesByName: Map<String, List<List<String>>> = allFiles.groupBy { it.last() }
    private val includedByFile = ConcurrentHashMap<List<String>, List<List<String>>>()
    private val closureByFile = ConcurrentHashMap<List<String>, Set<List<String>>>()

    /** [file] and every file it includes, directly or through other included files, in the order the compiler reads them. */
    fun closureOf(file: List<String>): Set<List<String>> = closureByFile.computeIfAbsent(file) {
        val closure = LinkedHashSet<List<String>>()
        val pending = ArrayDeque(listOf(file))
        while (pending.isNotEmpty()) {
            val next = pending.removeLast()
            if (closure.add(next)) pending.addAll(includedBy(next).asReversed())
        }
        closure
    }

    private fun includedBy(file: List<String>): List<List<String>> = includedByFile.computeIfAbsent(file) {
        val source = analysisRoot.resolve(file.joinToString(File.separator))
        if (!source.isFile) return@computeIfAbsent emptyList()
        source.readText().replace(LINE_CONTINUATION, "").lines().mapNotNull { INCLUDE_LINE.matchEntire(it) }.mapNotNull { line ->
            fileOf(line.groupValues[INCLUDE_PATH].split(SEPARATOR).filter { it.isNotEmpty() }, line.groupValues[OPENING] == ANGLE, file)
        }
    }

    private fun fileOf(includePath: List<String>, isAngle: Boolean, includingFile: List<String>): List<String>? {
        if (includePath.isEmpty()) return null
        if (!isAngle) besideFile(includePath, includingFile)?.let { return it }
        return filesByName[includePath.last()]
            .orEmpty()
            .filter { it.size >= includePath.size && it.takeLast(includePath.size) == includePath }
            .maxByOrNull { sharedFolderCount(it, includingFile) }
    }

    private fun besideFile(includePath: List<String>, includingFile: List<String>): List<String>? {
        val resolved = ArrayDeque(includingFile.dropLast(1))
        for (segment in includePath) {
            when (segment) {
                CURRENT_FOLDER -> Unit
                PARENT_FOLDER -> if (resolved.isEmpty()) return null else resolved.removeLast()
                else -> resolved.addLast(segment)
            }
        }
        return resolved.toList().takeIf { it in fileSet }
    }

    private fun sharedFolderCount(file: List<String>, includingFile: List<String>): Int =
        file.dropLast(1).zip(includingFile.dropLast(1)).takeWhile { (first, second) -> first == second }.size

    companion object {
        private val INCLUDE_LINE = Regex("""\s*#\s*include\s*([<"])([^>"]+)[>"].*""")
        private val LINE_CONTINUATION = Regex("""\\\s*\n\s*""")
        private const val OPENING = 1
        private const val INCLUDE_PATH = 2
        private const val ANGLE = "<"
        private const val SEPARATOR = "/"
        private const val CURRENT_FOLDER = "."
        private const val PARENT_FOLDER = ".."
        private const val HIDDEN_PREFIX = "."
        private val SKIPPED_FOLDERS = setOf("node_modules")
        private val includesByRoot = ConcurrentHashMap<String, CppIncludes>()

        /** The includes of [analysisRoot], read once per root, as every C and C++ file of an analysis asks for them. */
        fun of(analysisRoot: File): CppIncludes = includesByRoot.computeIfAbsent(analysisRoot.absolutePath) { read(analysisRoot) }

        // Sorted, so of equally near files the first in path order wins
        private fun read(analysisRoot: File): CppIncludes {
            val files = analysisRoot
                .walkTopDown()
                .onEnter { folder -> folder == analysisRoot || !(folder.name.startsWith(HIDDEN_PREFIX) || folder.name in SKIPPED_FOLDERS) }
                .filter { it.isFile }
                .map { it.relativeTo(analysisRoot).invariantSeparatorsPath.split(SEPARATOR) }
                .sortedBy { it.joinToString(SEPARATOR) }
                .toList()
            return CppIncludes(analysisRoot, files)
        }
    }
}
