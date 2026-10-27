package de.maibornwolff.treesitter.excavationsite.languages.rust.extractors

import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustNamespace
import de.maibornwolff.treesitter.excavationsite.languages.rust.model.RustPath
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The paths an item or `impl` writes, in its signature and in its body (`rust.md`, decision 4), each with the namespace
 * the compiler looks it up in: a type position among types, an expression or pattern among values, `m!` among macros.
 * Names that something around them binds locally are left out ([LocalScopes]); a field or a method on a value is no
 * path (decision 10).
 */
internal class PathCollector private constructor() {
    private val scopes = LocalScopes()
    private val patterns = PatternBindings(scopes) { visit(it) }

    companion object {
        /** The paths [item] writes, its own name left out. */
        fun pathsOf(item: SyntaxNode): List<RustPath> = PathCollector().run {
            scopes.within { if (item.type in FUNCTIONS) visitFunction(item) else visitItem(item) }
            scopes.paths
        }

        private const val TYPE_FIELD = "type"
        private const val NAME_FIELD = "name"
        private const val PATTERN_FIELD = "pattern"
        private const val PATH_FIELD = "path"
        private const val MACRO_FIELD = "macro"
        private const val BODY_FIELD = "body"
        private const val FUNCTION_FIELD = "function"
        private const val CONDITION_FIELD = "condition"
        private const val LEFT_FIELD = "left"
        private const val TYPE_PARAMETERS_FIELD = "type_parameters"
        private const val TYPE_IDENTIFIER = "type_identifier"
        private const val SCOPED_TYPE_IDENTIFIER = "scoped_type_identifier"
        private const val IDENTIFIER = "identifier"
        private const val SCOPED_IDENTIFIER = "scoped_identifier"
        private const val GENERIC_FUNCTION = "generic_function"
        private const val MACRO_INVOCATION = "macro_invocation"
        private const val TOKEN_TREE = "token_tree"
        private const val BLOCK = "block"
        private const val CLOSURE_PARAMETERS = "closure_parameters"
        private const val PARAMETERS = "parameters"
        private const val PARAMETER = "parameter"
        private const val LET_DECLARATION = "let_declaration"
        private const val LET_CONDITION = "let_condition"
        private const val MATCH_ARM = "match_arm"
        private const val MATCH_PATTERN = "match_pattern"
        private const val FOR_EXPRESSION = "for_expression"
        private const val TYPE_BINDING = "type_binding"
        private const val CONST_PARAMETER = "const_parameter"
        private const val STRUCT_ITEM = "struct_item"
        private const val FIELD_DECLARATION_LIST = "field_declaration_list"
        private const val USE_DECLARATION = "use_declaration"
        private const val MACRO_DEFINITION = "macro_definition"
        private const val FUNCTION_ITEM = "function_item"

        private val SKIPPED = setOf(
            "attribute_item", "inner_attribute_item", "line_comment", "block_comment", "lifetime", "label", "visibility_modifier",
            USE_DECLARATION, "extern_crate_declaration", MACRO_DEFINITION, "self", "super", "crate", "metavariable", "field_identifier"
        )
        private val PATHS =
            setOf(TYPE_IDENTIFIER, SCOPED_TYPE_IDENTIFIER, IDENTIFIER, SCOPED_IDENTIFIER, GENERIC_FUNCTION, MACRO_INVOCATION)
        private val FUNCTIONS = setOf(FUNCTION_ITEM, "function_signature_item", "closure_expression")
        private val SCOPES = setOf(BLOCK, MATCH_ARM, FOR_EXPRESSION, "if_expression", "while_expression")
        private val BINDINGS = setOf(LET_DECLARATION, LET_CONDITION, TYPE_BINDING)
        private val GENERIC_PARAMETERS = setOf("type_parameter", "constrained_type_parameter", "optional_type_parameter", CONST_PARAMETER)
        private val TYPE_ITEMS = setOf("enum_item", "union_item", "trait_item", "type_item", "mod_item")
        private val VALUE_ITEMS = setOf(FUNCTION_ITEM, "const_item", "static_item")
        private val NAMED_ITEMS = TYPE_ITEMS + VALUE_ITEMS + setOf(STRUCT_ITEM, "enum_variant", "associated_type", "impl_item")
        private val PLAIN_PATH_PREFIXES = setOf(IDENTIFIER, SCOPED_IDENTIFIER, "self", "super", "crate", "metavariable")
    }

    private fun visit(node: SyntaxNode) {
        when (node.type) {
            in SKIPPED -> Unit
            in PATHS -> visitPath(node)
            in FUNCTIONS -> scopes.within { visitFunction(node) }
            in SCOPES -> visitScope(node)
            in BINDINGS -> visitBinding(node)
            in GENERIC_PARAMETERS -> visitWithout(node, nameOf(node))
            in NAMED_ITEMS -> scopes.within { visitItem(node) }
            else -> visitChildren(node)
        }
    }

    private fun visitChildren(node: SyntaxNode) = node.children().forEach { visit(it) }

    private fun visitWithout(node: SyntaxNode, skipped: SyntaxNode?) = node.children().filter { it != skipped }.forEach { visit(it) }

    // An item's generic parameters bind inside it; its name is no use
    private fun visitItem(item: SyntaxNode) {
        item.getChildByFieldName(TYPE_PARAMETERS_FIELD).orNull()?.let { bindGenericParameters(it) }
        visitWithout(item, item.getChildByFieldName(NAME_FIELD).orNull())
    }

    private fun visitPath(node: SyntaxNode) {
        when (node.type) {
            TYPE_IDENTIFIER -> scopes.add(listOf(node.text), RustNamespace.TYPE, node.startByte)
            IDENTIFIER -> scopes.add(listOf(node.text), RustNamespace.VALUE, node.startByte)
            SCOPED_TYPE_IDENTIFIER -> addScoped(node, RustNamespace.TYPE)
            SCOPED_IDENTIFIER -> addScoped(node, RustNamespace.VALUE)
            GENERIC_FUNCTION -> visitGenericFunction(node)
            MACRO_INVOCATION -> visitMacroInvocation(node)
        }
    }

    private fun visitScope(node: SyntaxNode) {
        when (node.type) {
            BLOCK -> scopes.within {
                bindBlockItems(node)
                visitChildren(node)
            }
            MATCH_ARM -> scopes.within { visitMatchArm(node) }
            FOR_EXPRESSION -> visitFor(node)
            else -> scopes.within { visitChildren(node) }
        }
    }

    // The value is read before the pattern binds: `let speed = speed + 1;` reads the outer `speed`
    private fun visitBinding(node: SyntaxNode) {
        if (node.type == TYPE_BINDING) return node.getChildByFieldName(TYPE_FIELD).orNull()?.let { visit(it) } ?: Unit
        val pattern = node.getChildByFieldName(PATTERN_FIELD).orNull()
        visitWithout(node, pattern)
        pattern?.let { patterns.bind(it) }
    }

    private fun visitFunction(function: SyntaxNode) {
        function.getChildByFieldName(TYPE_PARAMETERS_FIELD).orNull()?.let { bindGenericParameters(it) }
        val name = function.getChildByFieldName(NAME_FIELD).orNull()
        function.children().filter { it != name }.forEach { child ->
            if (child.type == PARAMETERS ||
                child.type == CLOSURE_PARAMETERS
            ) {
                child.namedChildren().forEach { visitParameter(it) }
            } else {
                visit(child)
            }
        }
    }

    private fun visitParameter(parameter: SyntaxNode) {
        if (parameter.type != PARAMETER) return patterns.bind(parameter)
        parameter.getChildByFieldName(TYPE_FIELD).orNull()?.let { visit(it) }
        parameter.getChildByFieldName(PATTERN_FIELD).orNull()?.let { patterns.bind(it) }
    }

    private fun visitMatchArm(arm: SyntaxNode) {
        arm.children().forEach { child ->
            if (child.type != MATCH_PATTERN) return@forEach visit(child)
            val condition = child.getChildByFieldName(CONDITION_FIELD).orNull()
            child.namedChildren().filter { it != condition }.forEach { patterns.bind(it) }
            condition?.let { visit(it) }
        }
    }

    private fun visitFor(loop: SyntaxNode) {
        val pattern = loop.getChildByFieldName(PATTERN_FIELD).orNull()
        val body = loop.getChildByFieldName(BODY_FIELD).orNull()
        loop.children().filter { it != pattern && it != body }.forEach { visit(it) }
        scopes.within {
            pattern?.let { patterns.bind(it) }
            body?.let { visit(it) }
        }
    }

    private fun visitGenericFunction(node: SyntaxNode) {
        val function = node.getChildByFieldName(FUNCTION_FIELD).orNull()
        function?.let { visit(it) }
        visitWithout(node, function)
    }

    private fun visitMacroInvocation(invocation: SyntaxNode) {
        val name = invocation.getChildByFieldName(MACRO_FIELD).orNull() ?: invocation.namedChildren().firstOrNull()
        name?.let { scopes.add(UseTree.segmentsOf(it), RustNamespace.MACRO, it.startByte) }
        invocation.children().filter { it.type == TOKEN_TREE }.forEach { tokens -> MacroTokens.read(tokens, scopes::add) }
    }

    // `Vec::<Speed>::new`: the type arguments of the path part are uses of their own
    private fun addScoped(node: SyntaxNode, namespace: RustNamespace) {
        val prefix = node.getChildByFieldName(PATH_FIELD).orNull()
        if (prefix == null || prefix.type in PLAIN_PATH_PREFIXES) return scopes.add(UseTree.segmentsOf(node), namespace, node.startByte)
        visit(prefix)
        val base = TypePaths.basePathOf(prefix) ?: return
        scopes.add(base.segments + listOfNotNull(node.getChildByFieldName(NAME_FIELD).orNull()?.text), namespace, node.startByte)
    }

    private fun bindGenericParameters(parameters: SyntaxNode) {
        parameters.namedChildren().forEach { parameter ->
            val name = nameOf(parameter)
            when {
                parameter.type == CONST_PARAMETER -> name?.let { scopes.bindValue(it.text) }
                name?.type == TYPE_IDENTIFIER -> scopes.bindType(name.text)
                parameter.type == TYPE_IDENTIFIER -> scopes.bindType(parameter.text)
            }
        }
    }

    private fun nameOf(parameter: SyntaxNode): SyntaxNode? =
        parameter.getChildByFieldName(NAME_FIELD).orNull() ?: parameter.getChildByFieldName(LEFT_FIELD).orNull()

    // The items of a block are visible in all of it, its `use` declarations bind there
    private fun bindBlockItems(block: SyntaxNode) {
        block.namedChildren().forEach { child ->
            val name = child.getChildByFieldName(NAME_FIELD).orNull()?.text
            when (child.type) {
                STRUCT_ITEM -> name?.let { bindStruct(child, it) }
                in TYPE_ITEMS -> name?.let { scopes.bindType(it) }
                in VALUE_ITEMS -> name?.let { scopes.bindValue(it) }
                MACRO_DEFINITION -> name?.let { scopes.bindMacro(it) }
                USE_DECLARATION -> UseTree.bindingsOf(child).forEach { binding ->
                    if (binding.isGlob) scopes.bindGlob(binding.path) else binding.name?.let { scopes.bindUse(it, binding.path) }
                }
            }
        }
    }

    // A tuple or unit struct is also its constructor
    private fun bindStruct(struct: SyntaxNode, name: String) {
        scopes.bindType(name)
        if (struct.getChildByFieldName(BODY_FIELD).orNull()?.type != FIELD_DECLARATION_LIST) scopes.bindValue(name)
    }
}
