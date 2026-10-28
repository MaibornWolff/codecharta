package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.delphi

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.DelphiDeclarationKind
import de.maibornwolff.treesitter.excavationsite.api.DelphiName

/**
 * The declarations of a Delphi unit or program at the unit name plus their own (`docs/name-resolution/delphi.md`), each
 * name they write looked up as the compiler does and written as the exact path of what it finds, which
 * [DelphiNameRules] takes only as written.
 */
class DelphiAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    private val project by lazy {
        fileInfo.analysisRoot?.let { DelphiProject.of(it, fileInfo.analysedFiles) }
            ?: DelphiProject.ofSingleFile(fileInfo.physicalPath, fileInfo.content)
    }

    override fun analyze(): FileReport {
        val unit = project.unitOf(fileInfo.physicalPath)
        val lookup = DelphiLookup(project, unit)
        val declarations = unit.declarations.mapNotNull { declaration ->
            val nodeType = NODE_TYPES[declaration.kind] ?: return@mapNotNull null
            node(unit.name + declaration.outerTypes + declaration.name, nodeType, declaration.names, lookup)
        }
        val script = unit.script?.let { node(unit.name + (unit.name.last() + SCRIPT_SUFFIX), NodeType.SCRIPT, it.names, lookup) }
        return FileReport(declarations + listOfNotNull(script))
    }

    private fun node(path: List<String>, nodeType: NodeType, names: List<DelphiName>, lookup: DelphiLookup): Node {
        val uses = names.mapNotNull { lookup.resolve(it) }.filter { it != path }.distinct()
        return node(path, nodeType, uses)
    }

    private fun node(path: List<String>, nodeType: NodeType, uses: List<List<String>>) = Node(
        pathWithName = Path(path),
        physicalPath = fileInfo.physicalPath,
        nodeType = nodeType,
        language = SupportedLanguage.DELPHI,
        dependencies = emptySet(),
        usedTypes = uses.map { Type.simple(Path(it).withDots()) }.toSet()
    )

    companion object {
        private const val SCRIPT_SUFFIX = ".script"
        private val NODE_TYPES = mapOf(
            DelphiDeclarationKind.CLASS to NodeType.CLASS,
            DelphiDeclarationKind.RECORD to NodeType.CLASS,
            DelphiDeclarationKind.HELPER to NodeType.CLASS,
            DelphiDeclarationKind.INTERFACE to NodeType.INTERFACE,
            DelphiDeclarationKind.ENUM to NodeType.ENUM,
            DelphiDeclarationKind.TYPE to NodeType.CLASS,
            DelphiDeclarationKind.ROUTINE to NodeType.FUNCTION,
            DelphiDeclarationKind.CONSTANT to NodeType.VARIABLE,
            DelphiDeclarationKind.VARIABLE to NodeType.VARIABLE
        )
    }
}
