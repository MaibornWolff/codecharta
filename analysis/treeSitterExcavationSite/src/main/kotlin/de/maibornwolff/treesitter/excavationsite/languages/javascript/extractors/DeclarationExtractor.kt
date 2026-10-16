package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType

private const val CLASS_DECLARATION = "class_declaration"
private const val ABSTRACT_CLASS_DECLARATION = "abstract_class_declaration"
private const val INTERFACE_DECLARATION = "interface_declaration"
private const val ENUM_DECLARATION = "enum_declaration"
private const val FUNCTION_DECLARATION = "function_declaration"
private const val FUNCTION_SIGNATURE = "function_signature"
private const val GENERATOR_FUNCTION_DECLARATION = "generator_function_declaration"
private const val LEXICAL_DECLARATION = "lexical_declaration"
private const val VARIABLE_DECLARATION = "variable_declaration"

private const val WILDCARD_REEXPORT = "*"

private const val AMBIENT_DECLARATION = "ambient_declaration"
private const val MODULE_DECLARATION = "module"
private const val INTERNAL_MODULE = "internal_module"
private const val STATEMENT_BLOCK = "statement_block"

private val DECLARATION_NODE_TYPES = setOf(
    CLASS_DECLARATION,
    ABSTRACT_CLASS_DECLARATION,
    INTERFACE_DECLARATION,
    ENUM_DECLARATION,
    FUNCTION_DECLARATION,
    FUNCTION_SIGNATURE,
    GENERATOR_FUNCTION_DECLARATION,
    TYPE_ALIAS_DECLARATION,
    LEXICAL_DECLARATION,
    VARIABLE_DECLARATION,
    INTERNAL_MODULE
)

private fun hasExportClause(node: SyntaxNode): Boolean = node.children().any { it.type == EXPORT_CLAUSE }

private fun hasSource(node: SyntaxNode): Boolean = node.children().any { it.type == STRING }

private fun extractName(node: SyntaxNode): String {
    val nameTypes = when (node.type) {
        CLASS_DECLARATION, ABSTRACT_CLASS_DECLARATION,
        INTERFACE_DECLARATION, TYPE_ALIAS_DECLARATION -> arrayOf(TYPE_IDENTIFIER, IDENTIFIER)
        else -> arrayOf(IDENTIFIER)
    }
    return TreeTraversal.findFirstChildTextByType(node, *nameTypes)?.trim() ?: ""
}

// ── pre-pass helpers ──────────────────────────────────────────────────────────

internal object DeclarationPrepass {
    internal fun buildAliasMap(
        imports: List<de.maibornwolff.treesitter.excavationsite.shared.domain.ImportDeclaration>
    ): Map<String, String> = imports
        .mapNotNull { import ->
            val localName = import.bindingName ?: return@mapNotNull null
            val realName = if (import.isWildcard || import.path.lastOrNull() == DEFAULT_EXPORT) {
                localName
            } else {
                import.path.lastOrNull() ?: return@mapNotNull null
            }
            localName to realName
        }.toMap()

    internal fun extractLocalDeclarationNames(rootNode: SyntaxNode): Set<String> = rootNode
        .children()
        .flatMap { child ->
            when (child.type) {
                EXPORT_STATEMENT -> extractNamesFromExportStatement(child)
                in DECLARATION_NODE_TYPES -> extractNamesFromNode(child)
                else -> emptyList()
            }
        }.filter { it.isNotBlank() }
        .toSet()

    private fun extractNamesFromExportStatement(node: SyntaxNode): List<String> {
        if (hasSource(node)) return emptyList()
        val hasExportClause = hasExportClause(node)
        if (hasExportClause) {
            val clause = node.children().firstOrNull { it.type == EXPORT_CLAUSE } ?: return emptyList()
            return clause
                .children()
                .filter { it.type == EXPORT_SPECIFIER }
                .mapNotNull { specifier ->
                    specifier
                        .children()
                        .filter { it.type == IDENTIFIER }
                        .firstOrNull()
                        ?.text
                        ?.trim()
                }.toList()
        }
        return node
            .children()
            .filter { it.type in DECLARATION_NODE_TYPES }
            .flatMap { extractNamesFromNode(it) }
            .toList()
    }

    private fun extractNamesFromNode(node: SyntaxNode): List<String> {
        if (node.type == LEXICAL_DECLARATION || node.type == VARIABLE_DECLARATION) {
            return node
                .children()
                .filter { it.type == VARIABLE_DECLARATOR }
                .mapNotNull { TreeTraversal.findFirstChildTextByType(it, IDENTIFIER)?.trim() }
                .filter { it.isNotBlank() }
                .toList()
        }
        val name = extractName(node)
        return if (name.isNotBlank()) listOf(name) else emptyList()
    }
}

// ── main extractor ────────────────────────────────────────────────────────────

internal object DeclarationExtractor {
    internal sealed interface DefaultExport {
        data class Named(val name: String) : DefaultExport // export default class Foo {}

        data class Reexport(val name: String) : DefaultExport // export default Foo;

        data object Anonymous : DefaultExport // export default class {}

        data object Value : DefaultExport // export default { ... } / 42

        data object None : DefaultExport // no export default
    }

    internal fun classifyDefaultExport(rootNode: SyntaxNode): DefaultExport = rootNode
        .children()
        .filter { it.type == EXPORT_STATEMENT }
        .firstNotNullOfOrNull { exportNode ->
            val children = exportNode.children().toList()
            if (!children.any { it.type == DEFAULT_KEYWORD }) return@firstNotNullOfOrNull null
            val identifier = children.firstOrNull { it.type == IDENTIFIER }
            if (identifier != null) {
                return@firstNotNullOfOrNull DefaultExport.Reexport(identifier.text.trim())
            }
            val declarationChild = children.firstOrNull { it.type in DECLARATION_NODE_TYPES }
            if (declarationChild != null) {
                val name = extractName(declarationChild)
                return@firstNotNullOfOrNull if (name.isNotBlank()) DefaultExport.Named(name) else DefaultExport.Anonymous
            }
            DefaultExport.Value
        } ?: DefaultExport.None

    fun extract(rootNode: SyntaxNode): List<Declaration> {
        val imports = ImportExtractor.extract(rootNode)
        val aliasMap = DeclarationPrepass.buildAliasMap(imports)
        val localDeclarationNames = DeclarationPrepass.extractLocalDeclarationNames(rootNode)
        val declarations = rootNode
            .children()
            .flatMap { child ->
                when (child.type) {
                    EXPORT_STATEMENT -> extractFromExportStatement(
                        child,
                        aliasMap = aliasMap,
                        localDeclarationNames = localDeclarationNames
                    )
                    AMBIENT_DECLARATION -> extractFromAmbientDeclaration(
                        child,
                        aliasMap = aliasMap,
                        localDeclarationNames = localDeclarationNames
                    )
                    in DECLARATION_NODE_TYPES -> extractFromNode(
                        child,
                        aliasMap = aliasMap,
                        localDeclarationNames = localDeclarationNames
                    )
                    else -> emptyList()
                }
            }.filter { it.name.isNotBlank() }
            .toList()
        return when (val shape = classifyDefaultExport(rootNode)) {
            is DefaultExport.Reexport -> {
                val resolvedType = declarations.firstOrNull { it.name == shape.name }?.type
                    ?: DeclarationType.REEXPORT
                declarations + Declaration(DEFAULT_EXPORT, resolvedType, setOf(UsedType(shape.name)))
            }
            is DefaultExport.Anonymous, DefaultExport.Value ->
                declarations + Declaration(DEFAULT_EXPORT, DeclarationType.REEXPORT, emptySet())
            is DefaultExport.Named, DefaultExport.None -> declarations
        }
    }

    private fun extractFromAmbientDeclaration(
        node: SyntaxNode,
        aliasMap: Map<String, String>,
        localDeclarationNames: Set<String>
    ): List<Declaration> {
        val moduleNode = node.children().firstOrNull { it.type == MODULE_DECLARATION } ?: return emptyList()
        val moduleName = moduleNode
            .children()
            .firstOrNull { it.type == STRING }
            ?.children()
            ?.firstOrNull { it.type == STRING_FRAGMENT }
            ?.text
            ?.trim()
            ?: return emptyList()
        if (moduleName.contains("*")) return emptyList()
        val parentPath = moduleName.split("/")
        val body = moduleNode.children().firstOrNull { it.type == STATEMENT_BLOCK } ?: return emptyList()
        return body
            .children()
            .flatMap { child ->
                when (child.type) {
                    EXPORT_STATEMENT -> extractFromExportStatement(child, parentPath, aliasMap, localDeclarationNames)
                    in DECLARATION_NODE_TYPES -> extractFromNode(child, parentPath, aliasMap, localDeclarationNames)
                    else -> emptyList()
                }
            }.filter { it.name.isNotBlank() }
            .toList()
    }

    private fun extractFromExportStatement(
        node: SyntaxNode,
        parentPath: List<String> = emptyList(),
        aliasMap: Map<String, String>,
        localDeclarationNames: Set<String>
    ): List<Declaration> = when {
        hasExportClause(node) && hasSource(node) -> extractReexportDeclarations(node)
        hasSource(node) && !hasExportClause(node) ->
            listOf(Declaration(name = WILDCARD_REEXPORT, type = DeclarationType.REEXPORT, usedTypes = emptySet()))

        else -> extractDecoratedDeclarations(node, parentPath, aliasMap, localDeclarationNames)
    }

    // The decorators of an exported class are children of the export statement, not of the class declaration
    private fun extractDecoratedDeclarations(
        node: SyntaxNode,
        parentPath: List<String>,
        aliasMap: Map<String, String>,
        localDeclarationNames: Set<String>
    ): List<Declaration> {
        val decorators = node.children().filter { it.type == DECORATOR }.toList()
        val decoratorUsedTypes = decorators
            .flatMap { UsedTypeExtractor.extract(it, aliasMap, localDeclarationNames).toList() }
            .toSet()
        val angular = AngularDecoratorExtractor.extract(decorators.asSequence())
        return node
            .children()
            .filter { it.type in DECLARATION_NODE_TYPES }
            .flatMap { extractFromNode(it, parentPath, aliasMap, localDeclarationNames) }
            .map { decl -> decl.copy(usedTypes = decl.usedTypes + decoratorUsedTypes, angular = decl.angular ?: angular) }
            .toList()
    }

    private fun extractReexportDeclarations(node: SyntaxNode): List<Declaration> {
        val exportClause = node.children().firstOrNull { it.type == EXPORT_CLAUSE } ?: return emptyList()
        return exportClause
            .children()
            .filter { it.type == EXPORT_SPECIFIER }
            .mapNotNull { specifier ->
                val identifiers = specifier
                    .children()
                    .filter { it.type == IDENTIFIER }
                    .map { it.text.trim() }
                    .toList()
                when (identifiers.size) {
                    1 -> {
                        val name = identifiers[0]
                        Declaration(
                            name = name,
                            type = DeclarationType.REEXPORT,
                            usedTypes = setOf(UsedType(normalizeDefaultKeyword(name)))
                        )
                    }

                    2 -> {
                        val originalName = identifiers[0]
                        val alias = identifiers[1]
                        Declaration(
                            name = alias,
                            type = DeclarationType.REEXPORT,
                            usedTypes = setOf(UsedType(normalizeDefaultKeyword(originalName)))
                        )
                    }

                    else -> null
                }
            }.toList()
    }

    private fun extractFromNode(
        node: SyntaxNode,
        parentPath: List<String> = emptyList(),
        aliasMap: Map<String, String>,
        localDeclarationNames: Set<String>
    ): List<Declaration> = when (node.type) {
        LEXICAL_DECLARATION, VARIABLE_DECLARATION -> extractVariableDeclarations(
            node,
            parentPath,
            aliasMap,
            localDeclarationNames
        )
        INTERNAL_MODULE -> {
            val name = extractName(node)
            listOf(Declaration(name = name, type = DeclarationType.UNKNOWN, usedTypes = emptySet(), parentPath = parentPath))
        }
        else -> {
            val name = extractName(node)
            val type = declarationType(node.type)
            val usedTypes = UsedTypeExtractor.extract(node, aliasMap, localDeclarationNames - name)
            val angular = AngularDecoratorExtractor.extract(node.children().filter { it.type == DECORATOR })
            listOf(Declaration(name = name, type = type, usedTypes = usedTypes, parentPath = parentPath, angular = angular))
        }
    }

    private fun extractVariableDeclarations(
        node: SyntaxNode,
        parentPath: List<String> = emptyList(),
        aliasMap: Map<String, String>,
        localDeclarationNames: Set<String>
    ): List<Declaration> = node
        .children()
        .filter { it.type == VARIABLE_DECLARATOR }
        .mapNotNull { declarator ->
            val name = TreeTraversal.findFirstChildTextByType(declarator, IDENTIFIER)?.trim()
            if (name.isNullOrBlank()) {
                null
            } else {
                Declaration(
                    name = name,
                    type = DeclarationType.VARIABLE,
                    usedTypes = UsedTypeExtractor.extract(declarator, aliasMap, localDeclarationNames - name),
                    parentPath = parentPath
                )
            }
        }.toList()

    private fun declarationType(nodeType: String): DeclarationType = when (nodeType) {
        CLASS_DECLARATION, ABSTRACT_CLASS_DECLARATION, TYPE_ALIAS_DECLARATION -> DeclarationType.CLASS
        INTERFACE_DECLARATION -> DeclarationType.INTERFACE
        ENUM_DECLARATION -> DeclarationType.ENUM
        FUNCTION_DECLARATION, FUNCTION_SIGNATURE, GENERATOR_FUNCTION_DECLARATION -> DeclarationType.FUNCTION
        LEXICAL_DECLARATION, VARIABLE_DECLARATION -> DeclarationType.VARIABLE
        else -> DeclarationType.UNKNOWN
    }
}
