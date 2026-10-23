package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vue

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_DEFAULT_EXPORT_NAME
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_GLOBAL_SEGMENT
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.toType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.typescript.TypescriptAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.DeclarationType
import de.maibornwolff.treesitter.excavationsite.api.EmbeddedDeclarations
import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.ImportKind
import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.UsedType

/**
 * A Vue component by "Vue components" of `docs/name-resolution/typescript.md`: a TypeScript module whose plain
 * `<script>` is its top level (decision 11) and whose default export is the component, named after the file. The
 * component uses what its template's tags name, what the plain script's default export uses, and what its
 * `<script setup>` and the template's expressions use (decision 12), without the names `<script setup>` declares, which
 * are part of it.
 */
class VueAnalyzer(fileInfo: FileInfo) : TypescriptAnalyzer(fileInfo) {
    override val language = SupportedLanguage.VUE
    private val setupDeclarations = LinkedHashSet<Declaration>()
    private var fileImports: List<ImportDeclaration> = emptyList()

    override fun tseLanguage(): Language = Language.VUE

    override fun buildPathWithName(packagePath: List<String>, declaration: Declaration): Path =
        if (declaration.name == TSE_DEFAULT_EXPORT_NAME) physicalFilePath else super.buildPathWithName(packagePath, declaration)

    override fun selectUsedTypes(declaration: Declaration, imports: List<ImportDeclaration>): Set<UsedType> {
        fileImports = imports
        return super.selectUsedTypes(declaration, imports)
    }

    override fun nodesOf(declaration: Declaration, node: Node, embedded: List<EmbeddedDeclarations>): List<Node> {
        embedded.forEach { setupDeclarations.addAll(it.declarations) }
        return super.nodesOf(declaration, node, embedded)
    }

    override fun declaredNodes(): List<Node> {
        val nodes = super.declaredNodes()
        val componentName = declarationExportedAsDefault(nodes)
        val (components, others) = nodes.partition { it.pathWithName == physicalFilePath || isOwn(it) && it.name() == componentName }
        val plainNames = others.filter { isOwn(it) }.mapTo(HashSet()) { it.name() }
        val usedTypes = (components.flatMap { it.usedTypes } + setupUses(plainNames + setOfNotNull(componentName)))
            .map { ownNameInFull(it, plainNames, componentName) }
            .filter { it.name != physicalFilePath.withDots() }
        val component = components.first().copy(
            dependencies = components.flatMapTo(LinkedHashSet()) { it.dependencies },
            usedTypes = usedTypes.toSet()
        )
        return listOf(component) + others
    }

    // `export default class Comp` or `export default Comp` in the plain script names the declaration that is the component
    private fun declarationExportedAsDefault(nodes: List<Node>): String? = nodes
        .firstOrNull { it.pathWithName == physicalFilePath && it.nodeType == NodeType.REEXPORT }
        ?.usedTypes
        ?.singleOrNull()
        ?.name

    private fun isOwn(node: Node) = node.pathWithName.withoutName() == physicalFilePath.parts

    // `<script setup>` runs inside the component's `setup()`: its own names hide every other, and a name only the plain
    // script binds is free in it, though the compiler lets it see that name
    private fun setupUses(plainNames: Set<String>): List<Type> {
        val visibleNames = plainNames + fileImports.mapNotNull { bindingOf(it) }
        val setupNames = setupDeclarations
            .filter { it.parentPath.isEmpty() || it.parentPath == listOf(TSE_GLOBAL_SEGMENT) }
            .filter { it.type != DeclarationType.SCRIPT }
            .mapTo(HashSet()) { it.name }
        return setupDeclarations.flatMap { declaration ->
            val usedTypes = declaration.usedTypes.mapNotNullTo(LinkedHashSet()) { use ->
                when {
                    firstSegmentOf(use.name) in setupNames -> null
                    use.isFree() && firstSegmentOf(use.name) in visibleNames -> use.copy(namespacePrefix = emptyList())
                    else -> use
                }
            }
            super.selectUsedTypes(declaration.copy(usedTypes = usedTypes), fileImports).map { it.toType() }
        }
    }

    private fun ownNameInFull(type: Type, plainNames: Set<String>, componentName: String?): Type = when (type.name) {
        componentName -> type.copy(name = physicalFilePath.withDots())
        in plainNames -> type.copy(name = (physicalFilePath + type.name).withDots())
        else -> type
    }

    private fun bindingOf(import: ImportDeclaration): String? = when {
        import.bindingName != null -> import.bindingName
        import.kind == ImportKind.MEMBER && !import.isWildcard -> import.path.lastOrNull()
        else -> null
    }

    private fun UsedType.isFree() = namespacePrefix == listOf(TSE_GLOBAL_SEGMENT)

    private fun firstSegmentOf(name: String) = name.substringBefore(SEPARATOR)

    companion object {
        private const val SEPARATOR = "."
    }
}
