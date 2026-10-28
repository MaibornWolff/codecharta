package de.maibornwolff.codecharta.analysers.parsers.dependency.processing

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.CopyRules
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclaringCopy
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.LanguageRules
import java.io.File

/**
 * The files that declare each logical path, in scan order, with the name scope of their language. A dependency on a
 * path declared in several files goes to the files of the using file's name scope that the using file can see, as the
 * [CopyRules] of its language pick them. A file-scoped copy is seen only from its own file, and a use that can mean some
 * kinds of declaration only sees the copies of these kinds, if there are any.
 */
internal class DeclaringFiles private constructor(
    private val filesByLogicalPath: Map<String, List<DeclaringFile>>,
    private val analysisRoot: File?
) {
    private val copyRulesByLanguage = HashMap<SupportedLanguage, CopyRules>()

    fun filesFor(
        logicalPath: String,
        usingFile: FilePath,
        usingLanguage: SupportedLanguage,
        kinds: Set<String> = emptySet()
    ): List<FilePath> {
        val copies = filesByLogicalPath[logicalPath]
            .orEmpty()
            .filter { it.nameScope == usingLanguage.nameScope && (!it.copy.isFileScoped || it.copy.file == usingFile) }
            .map { it.copy }
        if (copies.isEmpty()) return emptyList()
        val copiesOfKinds = if (kinds.isEmpty()) copies else copies.filter { it.kind == null || it.kind in kinds }.ifEmpty { copies }
        return copyRulesOf(usingLanguage).filesFor(copiesOfKinds, usingFile)
    }

    private fun copyRulesOf(language: SupportedLanguage): CopyRules =
        copyRulesByLanguage.getOrPut(language) { LanguageRules.copiesOf(language, analysisRoot) }

    private data class DeclaringFile(val copy: DeclaringCopy, val nameScope: SupportedLanguage)

    companion object {
        /** [analysisRoot] is the folder the node paths are relative to, where a language may look for its project files. */
        fun of(resolvedNodes: Collection<Node>, analysisRoot: File? = null): DeclaringFiles {
            val filesByLogicalPath = LinkedHashMap<String, MutableList<DeclaringFile>>()
            resolvedNodes.forEach { node ->
                val files = filesByLogicalPath.getOrPut(node.pathWithName.withDots()) { mutableListOf() }
                val declaringFile = DeclaringFile(DeclaringCopy(FilePath.of(node), node.isFileScoped, node.kind), node.language.nameScope)
                if (declaringFile !in files) files.add(declaringFile)
            }
            return DeclaringFiles(filesByLogicalPath, analysisRoot)
        }
    }
}
