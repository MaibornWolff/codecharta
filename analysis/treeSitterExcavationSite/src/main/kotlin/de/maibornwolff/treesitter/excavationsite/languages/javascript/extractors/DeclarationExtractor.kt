package de.maibornwolff.treesitter.excavationsite.languages.javascript.extractors

import de.maibornwolff.treesitter.excavationsite.languages.javascript.DECORATOR
import de.maibornwolff.treesitter.excavationsite.languages.javascript.DEFAULT_EXPORT
import de.maibornwolff.treesitter.excavationsite.languages.javascript.DEFAULT_KEYWORD
import de.maibornwolff.treesitter.excavationsite.languages.javascript.EXPORT_CLAUSE
import de.maibornwolff.treesitter.excavationsite.languages.javascript.EXPORT_SPECIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.EXPORT_STATEMENT
import de.maibornwolff.treesitter.excavationsite.languages.javascript.IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.STRING
import de.maibornwolff.treesitter.excavationsite.languages.javascript.TYPE_ALIAS_DECLARATION
import de.maibornwolff.treesitter.excavationsite.languages.javascript.TYPE_IDENTIFIER
import de.maibornwolff.treesitter.excavationsite.languages.javascript.VARIABLE_DECLARATOR
import de.maibornwolff.treesitter.excavationsite.languages.javascript.normalizeDefaultKeyword
import de.maibornwolff.treesitter.excavationsite.shared.domain.Declaration
import de.maibornwolff.treesitter.excavationsite.shared.domain.DeclarationType
import de.maibornwolff.treesitter.excavationsite.shared.domain.UsedType
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.infrastructure.walker.children
import org.treesitter.TSNode

private const val CLASS_DECLARATION = "class_declaration"
private const val ABSTRACT_CLASS_DECLARATION = "abstract_class_declaration"
private const val INTERFACE_DECLARATION = "interface_declaration"
private const val ENUM_DECLARATION = "enum_declaration"
private const val FUNCTION_DECLARATION = "function_declaration"
private const val FUNCTION_SIGNATURE = "function_signature"
private const val GENERATOR_FUNCTION_DECLARATION = "generator_function_declaration"
private const val LEXICAL_DECLARATION = "lexical_declaration"
private const val VARIABLE_DECLARATION = "variable_declaration"

private const val STRING_FRAGMENT = "string_fragment"
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

private fun hasExportClause(node: TSNode): Boolean = node.children().any { it.type == EXPORT_CLAUSE }

private fun hasSource(node: TSNode): Boolean = node.children().any { it.type == STRING }

private fun extractName(node: TSNode, sourceCode: String): String {
    val nameTypes = when (node.type) {
        CLASS_DECLARATION, ABSTRACT_CLASS_DECLARATION,
        INTERFACE_DECLARATION, TYPE_ALIAS_DECLARATION -> arrayOf(TYPE_IDENTIFIER, IDENTIFIER)
        else -> arrayOf(IDENTIFIER)
    }
    return TreeTraversal.findFirstChildTextByType(node, sourceCode, *nameTypes)?.trim() ?: ""
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

    internal fun extractLocalDeclarationNames(rootNode: TSNode, sourceCode: String): Set<String> = rootNode
        .children()
        .flatMap { child ->
            when (child.type) {
                EXPORT_STATEMENT -> extractNamesFromExportStatement(child, sourceCode)
                in DECLARATION_NODE_TYPES -> extractNamesFromNode(child, sourceCode)
                else -> emptyList()
            }
        }.filter { it.isNotBlank() }
        .toSet()

    private fun extractNamesFromExportStatement(node: TSNode, sourceCode: String): List<String> {
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
                        ?.let { TreeTraversal.getNodeText(it, sourceCode).trim() }
                }.toList()
        }
        return node
            .children()
            .filter { it.type in DECLARATION_NODE_TYPES }
            .flatMap { extractNamesFromNode(it, sourceCode) }
            .toList()
    }

    private fun extractNamesFromNode(node: TSNode, sourceCode: String): List<String> {
        if (node.type == LEXICAL_DECLARATION || node.type == VARIABLE_DECLARATION) {
            return node
                .children()
                .filter { it.type == VARIABLE_DECLARATOR }
                .mapNotNull { TreeTraversal.findFirstChildTextByType(it, sourceCode, IDENTIFIER)?.trim() }
                .filter { it.isNotBlank() }
                .toList()
        }
        val name = extractName(node, sourceCode)
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

    internal fun classifyDefaultExport(rootNode: TSNode, sourceCode: String): DefaultExport = rootNode
        .children()
        .filter { it.type == EXPORT_STATEMENT }
        .firstNotNullOfOrNull { exportNode ->
            val children = exportNode.children().toList()
            if (!children.any { it.type == DEFAULT_KEYWORD }) return@firstNotNullOfOrNull null
            val identifier = children.firstOrNull { it.type == IDENTIFIER }
            if (identifier != null) {
                return@firstNotNullOfOrNull DefaultExport.Reexport(TreeTraversal.getNodeText(identifier, sourceCode).trim())
            }
            val declarationChild = children.firstOrNull { it.type in DECLARATION_NODE_TYPES }
            if (declarationChild != null) {
                val name = extractName(declarationChild, sourceCode)
                return@firstNotNullOfOrNull if (name.isNotBlank()) DefaultExport.Named(name) else DefaultExport.Anonymous
            }
            DefaultExport.Value
        } ?: DefaultExport.None

    fun extract(rootNode: TSNode, sourceCode: String): List<Declaration> {
        val imports = ImportExtractor.extract(rootNode, sourceCode)
        val aliasMap = DeclarationPrepass.buildAliasMap(imports)
        val localDeclarationNames = DeclarationPrepass.extractLocalDeclarationNames(rootNode, sourceCode)
        val declarations = rootNode
            .children()
            .flatMap { child ->
                when (child.type) {
                    EXPORT_STATEMENT -> extractFromExportStatement(
                        child,
                        sourceCode,
                        aliasMap = aliasMap,
                        localDeclarationNames = localDeclarationNames
                    )
                    AMBIENT_DECLARATION -> extractFromAmbientDeclaration(
                        child,
                        sourceCode,
                        aliasMap = aliasMap,
                        localDeclarationNames = localDeclarationNames
                    )
                    in DECLARATION_NODE_TYPES -> extractFromNode(
                        child,
                        sourceCode,
                        aliasMap = aliasMap,
                        localDeclarationNames = localDeclarationNames
                    )
                    else -> emptyList()
                }
            }.filter { it.name.isNotBlank() }
            .toList()
        return when (val shape = classifyDefaultExport(rootNode, sourceCode)) {
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
        node: TSNode,
        sourceCode: String,
        aliasMap: Map<String, String>,
        localDeclarationNames: Set<String>
    ): List<Declaration> {
        val moduleNode = node.children().firstOrNull { it.type == MODULE_DECLARATION } ?: return emptyList()
        val moduleName = moduleNode
            .children()
            .firstOrNull { it.type == STRING }
            ?.children()
            ?.firstOrNull { it.type == STRING_FRAGMENT }
            ?.let { TreeTraversal.getNodeText(it, sourceCode).trim() }
            ?: return emptyList()
        if (moduleName.contains("*")) return emptyList()
        val parentPath = moduleName.split("/")
        val body = moduleNode.children().firstOrNull { it.type == STATEMENT_BLOCK } ?: return emptyList()
        return body
            .children()
            .flatMap { child ->
                when (child.type) {
                    EXPORT_STATEMENT -> extractFromExportStatement(child, sourceCode, parentPath, aliasMap, localDeclarationNames)
                    in DECLARATION_NODE_TYPES -> extractFromNode(child, sourceCode, parentPath, aliasMap, localDeclarationNames)
                    else -> emptyList()
                }
            }.filter { it.name.isNotBlank() }
            .toList()
    }

    private fun extractFromExportStatement(
        node: TSNode,
        sourceCode: String,
        parentPath: List<String> = emptyList(),
        aliasMap: Map<String, String>,
        localDeclarationNames: Set<String>
    ): List<Declaration> = when {
        hasExportClause(node) && hasSource(node) -> extractReexportDeclarations(node, sourceCode)
        hasSource(node) && !hasExportClause(node) ->
            listOf(Declaration(name = WILDCARD_REEXPORT, type = DeclarationType.REEXPORT, usedTypes = emptySet()))

        else -> {
            val decoratorUsedTypes = node
                .children()
                .filter { it.type == DECORATOR }
                .flatMap { UsedTypeExtractor.extract(it, sourceCode, aliasMap, localDeclarationNames).toList() }
                .toSet()
            node
                .children()
                .filter { it.type in DECLARATION_NODE_TYPES }
                .flatMap { extractFromNode(it, sourceCode, parentPath, aliasMap, localDeclarationNames) }
                .map { decl -> if (decoratorUsedTypes.isEmpty()) decl else decl.copy(usedTypes = decl.usedTypes + decoratorUsedTypes) }
                .toList()
        }
    }

    private fun extractReexportDeclarations(node: TSNode, sourceCode: String): List<Declaration> {
        val exportClause = node.children().firstOrNull { it.type == EXPORT_CLAUSE } ?: return emptyList()
        return exportClause
            .children()
            .filter { it.type == EXPORT_SPECIFIER }
            .mapNotNull { specifier ->
                val identifiers = specifier
                    .children()
                    .filter { it.type == IDENTIFIER }
                    .map { TreeTraversal.getNodeText(it, sourceCode).trim() }
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
        node: TSNode,
        sourceCode: String,
        parentPath: List<String> = emptyList(),
        aliasMap: Map<String, String>,
        localDeclarationNames: Set<String>
    ): List<Declaration> = when (node.type) {
        LEXICAL_DECLARATION, VARIABLE_DECLARATION -> extractVariableDeclarations(
            node,
            sourceCode,
            parentPath,
            aliasMap,
            localDeclarationNames
        )
        INTERNAL_MODULE -> {
            val name = extractName(node, sourceCode)
            listOf(Declaration(name = name, type = DeclarationType.UNKNOWN, usedTypes = emptySet(), parentPath = parentPath))
        }
        else -> {
            val name = extractName(node, sourceCode)
            val type = declarationType(node.type)
            val usedTypes = UsedTypeExtractor.extract(node, sourceCode, aliasMap, localDeclarationNames - name)
            listOf(Declaration(name = name, type = type, usedTypes = usedTypes, parentPath = parentPath))
        }
    }

    private fun extractVariableDeclarations(
        node: TSNode,
        sourceCode: String,
        parentPath: List<String> = emptyList(),
        aliasMap: Map<String, String>,
        localDeclarationNames: Set<String>
    ): List<Declaration> = node
        .children()
        .filter { it.type == VARIABLE_DECLARATOR }
        .mapNotNull { declarator ->
            val name = TreeTraversal.findFirstChildTextByType(declarator, sourceCode, IDENTIFIER)?.trim()
            if (name.isNullOrBlank()) {
                null
            } else {
                Declaration(
                    name = name,
                    type = DeclarationType.VARIABLE,
                    usedTypes = UsedTypeExtractor.extract(declarator, sourceCode, aliasMap, localDeclarationNames - name),
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
