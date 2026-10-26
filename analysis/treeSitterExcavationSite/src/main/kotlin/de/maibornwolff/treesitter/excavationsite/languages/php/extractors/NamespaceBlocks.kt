package de.maibornwolff.treesitter.excavationsite.languages.php.extractors

import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode

/** A namespace of a PHP file with the statements that stand in it; the global namespace is empty. */
internal class NamespaceBlock(val namespace: List<String>, val statements: List<SyntaxNode>) {
    fun holds(node: SyntaxNode): Boolean = statements.any { it.startByte <= node.startByte && node.endByte <= it.endByte }
}

/**
 * The namespace blocks of a PHP file in their order: `namespace A;` opens a block that runs to the next namespace
 * definition, `namespace A { … }` and `namespace { … }` hold their own; statements outside any are global.
 */
internal object NamespaceBlocks {
    private const val NAMESPACE_DEFINITION = "namespace_definition"
    private const val NAME_FIELD = "name"
    private const val BODY_FIELD = "body"

    fun of(program: SyntaxNode): List<NamespaceBlock> {
        val blocks = mutableListOf<NamespaceBlock>()
        var namespace = emptyList<String>()
        var statements = mutableListOf<SyntaxNode>()
        for (statement in program.namedChildren()) {
            if (statement.type != NAMESPACE_DEFINITION) {
                statements.add(statement)
                continue
            }
            blocks.add(NamespaceBlock(namespace, statements))
            val body = statement.getChildByFieldName(BODY_FIELD)
            namespace = namespaceOf(statement)
            statements = mutableListOf()
            if (body.isNull) continue
            blocks.add(NamespaceBlock(namespace, body.namedChildren().toList()))
            namespace = emptyList()
        }
        blocks.add(NamespaceBlock(namespace, statements))
        return blocks.filter { it.statements.isNotEmpty() }
    }

    /** The namespace of the block a node stands in. */
    fun namespaceOf(node: SyntaxNode, blocks: List<NamespaceBlock>): List<String> =
        blocks.firstOrNull { it.holds(node) }?.namespace.orEmpty()

    private fun namespaceOf(definition: SyntaxNode): List<String> {
        val name = definition.getChildByFieldName(NAME_FIELD)
        return if (name.isNull) emptyList() else name.text.split(NamespaceUses.NAMESPACE_SEPARATOR)
    }
}
