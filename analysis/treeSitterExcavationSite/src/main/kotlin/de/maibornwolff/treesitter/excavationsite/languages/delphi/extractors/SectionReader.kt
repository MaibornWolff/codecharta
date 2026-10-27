package de.maibornwolff.treesitter.excavationsite.languages.delphi.extractors

import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiDeclaration
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiDeclarationKind
import de.maibornwolff.treesitter.excavationsite.languages.delphi.model.DelphiSection
import de.maibornwolff.treesitter.excavationsite.shared.domain.SyntaxNode
import de.maibornwolff.treesitter.excavationsite.shared.domain.orNull

/**
 * The declarations one section of a unit, or a program, makes at its top level: types (with the types declared inside
 * them), routines, constants and variables. A method body (`procedure TCreature.Attack;`) declares nothing, and a
 * forward declaration (`TCreature = class;`) is left to the full one.
 */
internal object SectionReader {
    private const val DECL_TYPES = "declTypes"
    private const val DECL_TYPE = "declType"
    private const val DECL_CONSTS = "declConsts"
    private const val DECL_CONST = "declConst"
    private const val DECL_VARS = "declVars"
    private const val DECL_VAR = "declVar"
    private const val DECL_PROC = "declProc"
    private const val DEF_PROC = "defProc"
    private const val DECL_FIELD = "declField"
    private const val DECL_PROP = "declProp"
    private const val DECL_SECTION = "declSection"
    private const val DECL_CLASS = "declClass"
    private const val DECL_INTF = "declIntf"
    private const val DECL_HELPER = "declHelper"
    private const val DECL_ENUM = "declEnum"
    private const val DECL_ENUM_VALUE = "declEnumValue"
    private const val TYPE = "type"
    private const val TYPEREF = "typeref"
    private const val IDENTIFIER = "identifier"
    private const val GENERIC_TPL = "genericTpl"
    private const val GENERIC_ARG = "genericArg"
    private const val K_RECORD = "kRecord"
    private const val K_END = "kEnd"
    private const val K_FOR = "kFor"
    private const val NAME_FIELD = "name"
    private const val TYPE_FIELD = "type"
    private const val HEADER_FIELD = "header"
    private const val ARGS_FIELD = "args"

    fun read(section: SyntaxNode, sectionKind: DelphiSection): List<DelphiDeclaration> =
        section.children().flatMap { declarationsOf(it, sectionKind) }.toList()

    private fun declarationsOf(child: SyntaxNode, sectionKind: DelphiSection): Sequence<DelphiDeclaration> = when (child.type) {
        DECL_TYPES -> typesOf(child).flatMap { typeDeclarations(it, emptyList(), sectionKind) }
        DECL_CONSTS -> simpleDeclarations(namesOf(child, DECL_CONST), DelphiDeclarationKind.CONSTANT, sectionKind)
        DECL_VARS -> simpleDeclarations(namesOf(child, DECL_VAR), DelphiDeclarationKind.VARIABLE, sectionKind)
        DECL_PROC -> routineOf(child, sectionKind)
        DEF_PROC -> child.getChildByFieldName(HEADER_FIELD).orNull()?.let { routineOf(it, sectionKind) }.orEmpty()
        else -> emptySequence()
    }

    private fun simpleDeclarations(names: List<String>, kind: DelphiDeclarationKind, sectionKind: DelphiSection) =
        names.asSequence().map { DelphiDeclaration(it, kind, sectionKind) }

    private fun routineOf(heading: SyntaxNode, sectionKind: DelphiSection): Sequence<DelphiDeclaration> {
        val name = heading.getChildByFieldName(NAME_FIELD).orNull()?.takeIf { it.type == IDENTIFIER } ?: return emptySequence()
        return sequenceOf(DelphiDeclaration(name.text, DelphiDeclarationKind.ROUTINE, sectionKind))
    }

    private fun typesOf(declTypes: SyntaxNode): Sequence<SyntaxNode> = declTypes.children().filter { it.type == DECL_TYPE }

    private fun typeDeclarations(declType: SyntaxNode, outerTypes: List<String>, sectionKind: DelphiSection): Sequence<DelphiDeclaration> {
        val name = extractDelphiDeclTypeName(declType)?.takeIf { it.isNotBlank() } ?: return emptySequence()
        val type = declType.getChildByFieldName(TYPE_FIELD).orNull() ?: return emptySequence()
        val kind = kindOf(type) ?: return emptySequence()
        val declaration = DelphiDeclaration(
            name = name,
            kind = kind,
            section = sectionKind,
            outerTypes = outerTypes,
            members = membersOf(type),
            baseTypes = baseTypesOf(type),
            genericParameters = genericParametersOf(declType)
        )
        val memberTypes = memberDeclarationsOf(type)
            .filter { it.type == DECL_TYPES }
            .flatMap { typesOf(it) }
            .flatMap { typeDeclarations(it, outerTypes + name, sectionKind) }
        return sequenceOf(declaration) + memberTypes
    }

    private fun kindOf(type: SyntaxNode): DelphiDeclarationKind? = when {
        type.type == DECL_CLASS && isForward(type) -> null
        type.type == DECL_CLASS && type.children().any { it.type == K_RECORD } -> DelphiDeclarationKind.RECORD
        type.type == DECL_CLASS -> DelphiDeclarationKind.CLASS
        type.type == DECL_INTF && isForward(type) -> null
        type.type == DECL_INTF -> DelphiDeclarationKind.INTERFACE
        type.type == DECL_HELPER -> DelphiDeclarationKind.HELPER
        type.type == TYPE && type.children().any { it.type == DECL_ENUM } -> DelphiDeclarationKind.ENUM
        type.type == TYPE -> DelphiDeclarationKind.TYPE
        else -> null
    }

    // `TCreature = class;` is a forward declaration; `EFail = class(Exception);` is a full one without a body.
    private fun isForward(type: SyntaxNode): Boolean = type.children().none { it.type == K_END || it.type == TYPEREF }

    private fun membersOf(type: SyntaxNode): List<String> {
        if (type.type == TYPE) return type.children().filter { it.type == DECL_ENUM }.flatMap { namesOf(it, DECL_ENUM_VALUE) }.toList()
        return memberDeclarationsOf(type).flatMap { memberNamesOf(it) }.distinct().toList()
    }

    private fun memberNamesOf(member: SyntaxNode): Sequence<String> = when (member.type) {
        DECL_FIELD -> extractDelphiMultipleNames(member).asSequence()
        DECL_PROC -> listOfNotNull(extractDelphiDeclProcName(member)).asSequence()
        DECL_PROP -> listOfNotNull(nameOf(member)).asSequence()
        DECL_CONSTS -> namesOf(member, DECL_CONST).asSequence()
        DECL_VARS -> namesOf(member, DECL_VAR).asSequence()
        DECL_TYPES -> typesOf(member).mapNotNull { extractDelphiDeclTypeName(it) }
        else -> emptySequence()
    }

    private fun memberDeclarationsOf(type: SyntaxNode): Sequence<SyntaxNode> =
        type.children().flatMap { if (it.type == DECL_SECTION) it.children() else sequenceOf(it) }

    private fun baseTypesOf(type: SyntaxNode): List<List<String>> {
        val bases = type.children().filter { it.type == TYPEREF }.toList()
        val extended = if (type.type == DECL_HELPER) extendedTypeOf(type) else null
        val ordered = listOfNotNull(extended) + bases.filter { it != extended }
        return ordered.map { TypeNames.segmentsOf(it) }.filter { it.isNotEmpty() }
    }

    private fun extendedTypeOf(helper: SyntaxNode): SyntaxNode? =
        helper.children().dropWhile { it.type != K_FOR }.firstOrNull { it.type == TYPEREF }

    private fun genericParametersOf(declType: SyntaxNode): List<String> {
        val name = declType.getChildByFieldName(NAME_FIELD).orNull()?.takeIf { it.type == GENERIC_TPL } ?: return emptyList()
        val arguments = name.getChildByFieldName(ARGS_FIELD).orNull() ?: return emptyList()
        return arguments.children().filter { it.type == GENERIC_ARG }.mapNotNull { nameOf(it) }.toList()
    }

    // `var A, B: Integer;` lists several names in one declaration; a constant or an enum value has one.
    private fun namesOf(declarations: SyntaxNode, type: String): List<String> {
        val nodes = declarations.children().filter { it.type == type }
        if (type == DECL_VAR) return nodes.flatMap { extractDelphiMultipleNames(it) }.toList()
        return nodes.mapNotNull { nameOf(it) }.toList()
    }

    private fun nameOf(node: SyntaxNode): String? = node.getChildByFieldName(NAME_FIELD).orNull()?.text
}
