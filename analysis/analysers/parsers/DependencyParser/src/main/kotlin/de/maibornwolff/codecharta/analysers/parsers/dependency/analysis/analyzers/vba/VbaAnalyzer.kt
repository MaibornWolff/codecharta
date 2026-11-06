package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vba

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.LanguageAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.VbaDeclarationKind

/**
 * The declarations of a VBA module (`docs/name-resolution/vba.md`): each declaration of a standard module at the module
 * name plus its own, a class module as one declaration. Each name they write is looked up as the compiler does and
 * written as the exact path of what it finds, which [VbaNameRules] takes only as written. The code module of a form or
 * report also uses its layout.
 */
class VbaAnalyzer(private val fileInfo: FileInfo) : LanguageAnalyzer {
    private val project by lazy {
        fileInfo.analysisRoot?.let { VbaProject.of(it, fileInfo.analysedFiles) }
            ?: VbaProject.ofSingleFile(fileInfo.physicalPath, fileInfo.content)
    }

    override fun analyze(): FileReport {
        val module = project.moduleOf(fileInfo.physicalPath)
        val lookup = VbaLookup(project, module, module.filePath)
        if (module.isClass) {
            val names = module.module.declarations.flatMap { it.names } + module.module.names
            val uses = names.mapNotNull { lookup.resolve(it) } + listOfNotNull(layoutOf(module))
            return FileReport(listOf(node(listOf(module.name), NodeType.CLASS, uses)))
        }
        val nodes = module.module.declarations.map { declaration ->
            node(module.pathOf(declaration), NODE_TYPES.getValue(declaration.kind), declaration.names.mapNotNull { lookup.resolve(it) })
        }
        return FileReport(nodes)
    }

    // The code module of a form or report depends on its layout, as an Angular component on its template
    private fun layoutOf(module: VbaModuleFile): List<String>? {
        val (objectName, kind) = AccessObjectFiles.objectOfModule(module.name) ?: return null
        return project.objectNamed(objectName, kind)
    }

    private fun node(path: List<String>, nodeType: NodeType, resolvedUses: List<List<String>>): Node {
        val uses = resolvedUses.filter { it != path }.distinct()
        return Node(
            pathWithName = Path(path),
            physicalPath = fileInfo.physicalPath,
            nodeType = nodeType,
            language = SupportedLanguage.VBA,
            dependencies = emptySet(),
            usedTypes = uses.map { Type.simple(Path(it).withDots()) }.toSet()
        )
    }

    companion object {
        private val NODE_TYPES = mapOf(
            VbaDeclarationKind.ROUTINE to NodeType.FUNCTION,
            VbaDeclarationKind.CONSTANT to NodeType.VARIABLE,
            VbaDeclarationKind.VARIABLE to NodeType.VARIABLE,
            VbaDeclarationKind.TYPE to NodeType.CLASS,
            VbaDeclarationKind.ENUM to NodeType.ENUM
        )
    }
}
