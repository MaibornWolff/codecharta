package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.delphi

import de.maibornwolff.treesitter.excavationsite.api.DelphiDeclaration
import de.maibornwolff.treesitter.excavationsite.api.DelphiDeclarationKind

/**
 * A declaration a written name found at [path], and whether every segment on the way was written in its declared case
 * (decision 3).
 */
internal data class Found(val declaration: DelphiDeclaration, val path: List<String>, val isExactCase: Boolean)

/**
 * What a unit offers by name, ignoring case as the compiler does: its top-level declarations and the values of its
 * enums, which mean the enum (decision 6), and the member types below its types.
 */
internal class UnitScope(val name: List<String>, declarations: List<DelphiDeclaration>) {
    private val topLevel = declarations.filter { it.outerTypes.isEmpty() }
    private val byName = topLevel.groupBy { it.name.lowercase() }.mapValues { it.value.first() }
    private val enumsByValue = topLevel
        .filter { it.kind == DelphiDeclarationKind.ENUM }
        .flatMap { enum -> enum.members.map { it to enum } }
        .groupBy { it.first.lowercase() }
        .mapValues { it.value.first() }
    private val memberTypes = declarations.filter { it.outerTypes.isNotEmpty() }.groupBy { key(it.outerTypes + it.name) }
    private val byPath = declarations.groupBy { key(it.outerTypes + it.name) }

    fun find(written: String): Found? {
        byName[written.lowercase()]?.let { return Found(it, pathOf(it), it.name == written) }
        val (value, enum) = enumsByValue[written.lowercase()] ?: return null
        return Found(enum, pathOf(enum), value == written)
    }

    /** The member type [written] of [outer], declared below it in this unit. */
    fun memberTypeOf(outer: DelphiDeclaration, written: String): Found? {
        val memberType = memberTypes[key(outer.outerTypes + outer.name + written)]?.first() ?: return null
        return Found(memberType, pathOf(memberType), memberType.name == written)
    }

    /** The type of this unit at [path] below the unit, a member type included. */
    fun typeAt(path: List<String>): DelphiDeclaration? = byPath[key(path)]?.first()

    private fun pathOf(declaration: DelphiDeclaration): List<String> = name + declaration.outerTypes + declaration.name

    private fun key(path: List<String>): String = path.joinToString(".") { it.lowercase() }
}
