package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_DEFAULT_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.resolveImportPath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.stripSourceFileExtension
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.common.utils.withoutFileSuffix
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.defaultImportPath
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies

/**
 * A Vue file is one node named after the file. It depends on what its script blocks import and on the components
 * its template uses, which are resolved by name like any used type.
 */
class VueAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    override fun analyze(): FileReport {
        val result = TreeSitterDependencies.analyze(fileInfo.content, Language.VUE)
        val templateComponents = result.declarations.flatMap { it.usedTypes }.map { it.name }
        val scriptDependencies = result.imports.map { import ->
            Dependency(path = Path(resolveImportPath(import.defaultImportPath(), fileInfo)), isWildcard = import.isWildcard)
        }
        val templateDependencies = templateComponents.map { Dependency(path = Path.fromStringWithDots(it)) }
        val componentNode = Node(
            pathWithName = fileInfo.physicalPathAsPath().withoutFileSuffix(VUE_SUFFIX),
            physicalPath = fileInfo.physicalPath,
            language = fileInfo.language,
            nodeType = NodeType.CLASS,
            dependencies = scriptDependencies.toSet() + templateDependencies,
            usedTypes = templateComponents.map { Type.simple(it) }.toSet() + result.imports.mapNotNull { importedName(it) }
        )
        return FileReport(nodes = listOf(componentNode))
    }

    private fun importedName(import: ImportDeclaration): Type? {
        if (import.isWildcard || import.path.isEmpty()) return null
        val name = import.defaultImportPath().last().stripSourceFileExtension()
        return if (name.isEmpty() || name == TSE_DEFAULT_EXPORT_NAME) null else Type.simple(name)
    }

    companion object {
        private const val VUE_SUFFIX = "vue"
    }
}
