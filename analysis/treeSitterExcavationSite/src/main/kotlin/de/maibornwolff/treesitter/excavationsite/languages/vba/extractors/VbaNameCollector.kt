package de.maibornwolff.treesitter.excavationsite.languages.vba.extractors

import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaName
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.TreeTraversal
import de.maibornwolff.treesitter.excavationsite.shared.domain.TypeUsage
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The names a subtree writes: identifiers, dotted chains and type names, and the forms and reports Access code names
 * by a literal, see [VbaAccessObjects]. The name a declaration gives (a routine, a parameter, a variable, a field, an
 * argument name), labels and a `With` member are no names; a chain ends where a call or a bang (`rs!Quantity`) makes
 * the rest a member of a value. The class of an `Implements` line is an implementation, the class `New` creates an
 * instantiation.
 */
internal object VbaNameCollector {
    private const val IDENTIFIER = "identifier"
    private const val QUALIFIED_MEMBER = "qualified_member_expression"
    private const val CALL_EXPRESSION = "call_expression"
    private const val CALL_STATEMENT = "call_statement"
    private const val TYPE_EXPRESSION = "type_expression"
    private const val DOTTED_TYPE_EXPRESSION = "dotted_type_expression"
    private const val IMPLICIT_MEMBER = "implicit_member_expression"
    private const val LEFT_FIELD = "left"
    private const val RIGHT_FIELD = "right"
    private const val NAME_FIELD = "name"
    private const val RECEIVER_FIELD = "receiver"
    private const val MEMBER_FIELD = "member"
    private const val OPERATOR_FIELD = "operator"
    private const val FUNCTION_FIELD = "function"
    private const val CALLEE_FIELD = "callee"
    private const val ARGUMENTS_FIELD = "arguments"
    private const val DOT = "."
    private const val BANG = "!"

    private val TYPE_NAMES = setOf(TYPE_EXPRESSION, DOTTED_TYPE_EXPRESSION)
    private const val IMPLEMENTS_STATEMENT = "implements_statement"
    private const val NEW_EXPRESSION = "new_expression"
    private const val AS_TYPE_CLAUSE = "as_type_clause"

    // The grammar keeps the `New` of `Dim x As New clsX` out of the tree
    private val AS_NEW = Regex("""^As\s+New\b""", RegexOption.IGNORE_CASE)
    private val ASSIGNMENTS = setOf("assignment_statement", "let_statement")
    private val NOT_WALKED = setOf(
        "comment", "string_literal", "attribute_statement", "option_statement", "def_type_statement", "frm_version_statement",
        "frm_begin_block", "label_statement", "goto_statement", "on_error_statement", "on_goto_statement", "resume_statement",
        "implicit_member_expression", "preprocessor_const"
    )

    // Their `name` is the name they declare.
    private val DECLARING = setOf(
        "sub_declaration", "function_declaration", "property_get_declaration", "property_let_declaration",
        "property_set_declaration", "conditional_sub_declaration", "conditional_function_declaration",
        "conditional_property_declaration", "declare_sub_statement", "declare_function_statement", "event_declaration",
        "variable_declarator", "const_declarator", "parameter", "type_member", "enum_member", "named_argument"
    )

    private data class ChainLink(val operator: String, val member: String)

    fun namesIn(node: SyntaxNode, locals: VbaLocalNames): List<VbaName> {
        val out = mutableListOf<VbaName>()
        walk(node, locals, out)
        return out.distinct()
    }

    private fun walk(node: SyntaxNode, locals: VbaLocalNames, out: MutableList<VbaName>) {
        val usage = usageOf(node)
        when {
            node.type == IDENTIFIER -> add(listOf(node.text), locals, out)
            node.type == QUALIFIED_MEMBER -> walkChain(node, locals, out)
            node.type == CALL_EXPRESSION -> walkCall(node, FUNCTION_FIELD, locals, out)
            node.type == CALL_STATEMENT -> walkCall(node, CALLEE_FIELD, locals, out)
            node.type in ASSIGNMENTS -> walkAssignment(node, locals, out)
            usage != TypeUsage.USAGE -> walkWithUsage(node, usage, locals, out)
            node.type in TYPE_NAMES -> add(TreeTraversal.findAllDescendantsOfType(node, IDENTIFIER).map { it.text }, locals, out)
            node.type in NOT_WALKED -> Unit
            VbaConditionalCode.isConditional(node) -> VbaConditionalCode.codeOf(node).forEach { walk(it, locals, out) }
            else -> walkChildren(node, locals, out)
        }
    }

    private fun usageOf(node: SyntaxNode): TypeUsage = when {
        node.type == IMPLEMENTS_STATEMENT -> TypeUsage.IMPLEMENTATION
        node.type == NEW_EXPRESSION || (node.type == AS_TYPE_CLAUSE && AS_NEW.containsMatchIn(node.text)) -> TypeUsage.INSTANTIATION
        else -> TypeUsage.USAGE
    }

    private fun walkWithUsage(node: SyntaxNode, usage: TypeUsage, locals: VbaLocalNames, out: MutableList<VbaName>) {
        val names = mutableListOf<VbaName>()
        walkChildren(node, locals, names)
        out.addAll(names.map { it.copy(usage = usage) })
    }

    private fun walkChildren(node: SyntaxNode, locals: VbaLocalNames, out: MutableList<VbaName>) {
        val declaredName = if (node.type in DECLARING) node.getChildByFieldName(NAME_FIELD).orNull() else null
        node.children().filterNot { isSameNode(it, declaredName) }.forEach { walk(it, locals, out) }
    }

    private fun isSameNode(node: SyntaxNode, other: SyntaxNode?): Boolean =
        other != null && node.startByte == other.startByte && node.type == other.type

    private fun walkAssignment(assignment: SyntaxNode, locals: VbaLocalNames, out: MutableList<VbaName>) {
        val property = assignment.getChildByFieldName(LEFT_FIELD).orNull()?.let { assignedPropertyOf(it) }
        val value = assignment.getChildByFieldName(RIGHT_FIELD).orNull()
        if (property != null && value != null) VbaAccessObjects.assignedTo(property, value)?.let { out.add(it) }
        walkChildren(assignment, locals, out)
    }

    private fun assignedPropertyOf(target: SyntaxNode): String? = when (target.type) {
        IDENTIFIER -> target.text
        QUALIFIED_MEMBER, IMPLICIT_MEMBER -> target.getChildByFieldName(MEMBER_FIELD).orNull()?.text
        else -> null
    }

    private fun walkCall(call: SyntaxNode, calleeField: String, locals: VbaLocalNames, out: MutableList<VbaName>) {
        val callee = call.getChildByFieldName(calleeField).orNull()
        val arguments = call.getChildByFieldName(ARGUMENTS_FIELD).orNull()
        val accessObject = callee?.let { VbaAccessObjects.openedBy(chainOf(it), arguments) }
        if (accessObject != null) out.add(accessObject) else callee?.let { walk(it, locals, out) }
        arguments?.let { walk(it, locals, out) }
    }

    private fun walkChain(node: SyntaxNode, locals: VbaLocalNames, out: MutableList<VbaName>) {
        val links = mutableListOf<ChainLink>()
        var head = node
        while (head.type == QUALIFIED_MEMBER) {
            links.add(0, ChainLink(operatorOf(head), head.getChildByFieldName(MEMBER_FIELD).text))
            head = head.getChildByFieldName(RECEIVER_FIELD).orNull() ?: return
        }
        if (head.type != IDENTIFIER) return walk(head, locals, out)
        val collectionMember = links.firstOrNull()?.takeIf { it.operator == BANG }?.member
        val accessObject = collectionMember?.let { VbaAccessObjects.namedBy(head.text, it) }
        if (accessObject == null) {
            add(listOf(head.text) + links.takeWhile { it.operator == DOT }.map { it.member }, locals, out)
        } else {
            out.add(accessObject)
        }
    }

    // The VB6 grammar keeps the `.` of a member out of the tree.
    private fun operatorOf(member: SyntaxNode): String = member.getChildByFieldName(OPERATOR_FIELD).orNull()?.text ?: DOT

    /** The identifiers of a plain dotted chain such as `Application.DoCmd.OpenForm`, empty for anything else. */
    private fun chainOf(node: SyntaxNode): List<String> = when (node.type) {
        IDENTIFIER -> listOf(node.text)
        QUALIFIED_MEMBER -> {
            val receiver = chainOf(node.getChildByFieldName(RECEIVER_FIELD).orNull() ?: return emptyList())
            if (receiver.isEmpty() || operatorOf(node) != DOT) emptyList() else receiver + node.getChildByFieldName(MEMBER_FIELD).text
        }
        else -> emptyList()
    }

    private fun add(segments: List<String>, locals: VbaLocalNames, out: MutableList<VbaName>) {
        if (segments.isEmpty() || locals.hides(segments.first())) return
        out.add(VbaName(segments))
    }
}
