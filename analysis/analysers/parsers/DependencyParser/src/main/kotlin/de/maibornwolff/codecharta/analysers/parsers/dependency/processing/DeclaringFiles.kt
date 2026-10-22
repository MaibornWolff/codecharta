package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.CopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclaringCopy
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.LanguageRules

/**
 * The files that declare each logical path, in scan order, with the name scope of their language. A dependency on a
 * path declared in several files goes to the files of the using file's name scope that the using file can see, as the
 * [CopyRules] of its language pick them. A file-scoped copy is seen only from its own file.
 */
internal class DeclaringFiles private constructor(private val filesByLogicalPath: Map<String, List<DeclaringFile>>) {
    fun filesFor(logicalPath: String, usingFile: FilePath, usingLanguage: SupportedLanguage): List<FilePath> {
        val copies = filesByLogicalPath[logicalPath]
            .orEmpty()
            .filter { it.nameScope == usingLanguage.nameScope && (!it.copy.isFileScoped || it.copy.file == usingFile) }
            .map { it.copy }
        return if (copies.isEmpty()) emptyList() else LanguageRules.copiesOf(usingLanguage).filesFor(copies, usingFile)
    }

    private data class DeclaringFile(val copy: DeclaringCopy, val nameScope: SupportedLanguage)

    companion object {
        fun of(resolvedNodes: Collection<Node>): DeclaringFiles {
            val filesByLogicalPath = LinkedHashMap<String, MutableList<DeclaringFile>>()
            resolvedNodes.forEach { node ->
                val files = filesByLogicalPath.getOrPut(node.pathWithName.withDots()) { mutableListOf() }
                DeclaringFile(DeclaringCopy(FilePath.of(node), node.isFileScoped), node.language.nameScope).let {
                    if (it !in
                        files
                    ) {
                        files.add(it)
                    }
                }
            }
            return DeclaringFiles(filesByLogicalPath)
        }
    }
}
