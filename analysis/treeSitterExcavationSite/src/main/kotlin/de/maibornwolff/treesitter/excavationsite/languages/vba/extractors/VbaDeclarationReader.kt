package de.maibornwolff.treesitter.excavationsite.languages.vba.extractors

import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.vba.model.VbaDeclarationKind
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The module-level declarations of one item of a module: a routine (`Sub`, `Function`, a property accessor, a
 * `Declare`), each variable and constant of a `Dim` or `Const` line, a `Type` and an `Enum`. Without a visibility a
 * routine, a type and an enum are public, a variable and a constant private, as the compiler takes them.
 */
internal object VbaDeclarationReader {
    private const val VARIABLE_DECLARATION = "variable_declaration"
    private const val VARIABLE_DECLARATOR = "variable_declarator"
    private const val CONST_DECLARATION = "const_declaration"
    private const val CONST_DECLARATOR = "const_declarator"
    private const val TYPE_DECLARATION = "type_declaration"
    private const val TYPE_MEMBER = "type_member"
    private const val ENUM_DECLARATION = "enum_declaration"
    private const val ENUM_MEMBER = "enum_member"
    private const val VISIBILITY = "visibility"
    private const val IDENTIFIER = "identifier"
    private const val NAME_FIELD = "name"

    private val ROUTINES = setOf(
        "sub_declaration",
        "function_declaration",
        "property_get_declaration",
        "property_let_declaration",
        "property_set_declaration",
        "conditional_sub_declaration",
        "conditional_function_declaration",
        "conditional_property_declaration",
        "declare_sub_statement",
        "declare_function_statement"
    )
    private val DECLARATIONS = ROUTINES + setOf(VARIABLE_DECLARATION, CONST_DECLARATION, TYPE_DECLARATION, ENUM_DECLARATION)
    private val PUBLIC_VISIBILITIES = setOf("public", "global", "friend")

    fun isDeclaration(item: SyntaxNode): Boolean = item.type in DECLARATIONS

    fun read(item: SyntaxNode): List<VbaDeclaration> = when (item.type) {
        in ROUTINES -> listOfNotNull(routineOf(item))
        VARIABLE_DECLARATION -> declaratorsOf(item, VARIABLE_DECLARATOR, VbaDeclarationKind.VARIABLE)
        CONST_DECLARATION -> declaratorsOf(item, CONST_DECLARATOR, VbaDeclarationKind.CONSTANT)
        TYPE_DECLARATION -> listOfNotNull(withMembers(item, TYPE_MEMBER, VbaDeclarationKind.TYPE))
        ENUM_DECLARATION -> listOfNotNull(withMembers(item, ENUM_MEMBER, VbaDeclarationKind.ENUM))
        else -> emptyList()
    }

    private fun routineOf(routine: SyntaxNode): VbaDeclaration? {
        val name = nameOf(routine) ?: return null
        val names = VbaNameCollector.namesIn(routine, VbaLocalNames.of(routine))
        return VbaDeclaration(name, VbaDeclarationKind.ROUTINE, isPublic(routine, isPublicByDefault = true), names = names)
    }

    private fun declaratorsOf(line: SyntaxNode, declaratorType: String, kind: VbaDeclarationKind): List<VbaDeclaration> {
        val isPublic = isPublic(line, isPublicByDefault = false)
        return line
            .children()
            .filter { it.type == declaratorType }
            .mapNotNull { declarator -> declarationOf(declarator, kind, isPublic) }
            .toList()
    }

    private fun declarationOf(declarator: SyntaxNode, kind: VbaDeclarationKind, isPublic: Boolean): VbaDeclaration? {
        val name = nameOf(declarator) ?: return null
        return VbaDeclaration(name, kind, isPublic, names = VbaNameCollector.namesIn(declarator, VbaLocalNames.MODULE))
    }

    private fun withMembers(declaration: SyntaxNode, memberType: String, kind: VbaDeclarationKind): VbaDeclaration? {
        val name = nameOf(declaration) ?: return null
        val members = declaration.children().filter { it.type == memberType }.toList()
        val names = members.flatMap { VbaNameCollector.namesIn(it, VbaLocalNames.MODULE) }.distinct()
        return VbaDeclaration(name, kind, isPublic(declaration, isPublicByDefault = true), members.mapNotNull { nameOf(it) }, names)
    }

    private fun nameOf(declaration: SyntaxNode): String? =
        (declaration.getChildByFieldName(NAME_FIELD).orNull() ?: declaration.children().firstOrNull { it.type == IDENTIFIER })?.text

    private fun isPublic(declaration: SyntaxNode, isPublicByDefault: Boolean): Boolean {
        val visibility = declaration.children().firstOrNull { it.type == VISIBILITY } ?: return isPublicByDefault
        return visibility.text.lowercase() in PUBLIC_VISIBILITIES
    }
}
