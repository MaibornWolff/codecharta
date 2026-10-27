package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.delphi

import de.maibornwolff.treesitter.excavationsite.api.DelphiDeclarationKind
import de.maibornwolff.treesitter.excavationsite.api.DelphiName
import de.maibornwolff.treesitter.excavationsite.api.DelphiSection
import de.maibornwolff.treesitter.excavationsite.api.DelphiUnit

/**
 * The lookup of `docs/name-resolution/delphi.md` for the names one unit writes: a member type of the type around the
 * name, a name qualified by a unit in scope (the longest prefix), the own unit, then the used units, the last listed
 * first, the implementation `uses` before the interface `uses`. A name only means what it finds when every segment on
 * the way is written in its declared case (decision 3). The extractor has left out the names a local declaration hides.
 */
internal class DelphiLookup(private val project: DelphiProject, private val unit: DelphiUnit) {
    private val ownScope = UnitScope(unit.name, unit.declarations)
    private val ownInterfaceScope = UnitScope(unit.name, unit.declarations.filter { it.section == DelphiSection.INTERFACE })

    /** A unit a name sees, and whether the uses entry or qualifier that leads to it has the unit's declared case. */
    private data class SeenUnit(val scope: UnitScope, val isExactCase: Boolean)

    /** The logical path of the declaration [name] means, or null for a local, library or unknown name. */
    fun resolve(name: DelphiName): List<String>? {
        val found = writtenFormsOf(name).firstNotNullOfOrNull { find(it, name) } ?: return null
        return if (found.isExactCase) found.path else null
    }

    // Decision 8: an attribute `[Table]` means `TableAttribute` before `Table`.
    private fun writtenFormsOf(name: DelphiName): List<List<String>> {
        if (!name.isAttribute) return listOf(name.segments)
        return listOf(name.segments.dropLast(1) + (name.segments.last() + ATTRIBUTE_SUFFIX), name.segments)
    }

    private fun find(segments: List<String>, name: DelphiName): Found? = findMemberType(segments, name.memberScope)
        ?: findQualified(segments, name.section)
        ?: findSimple(segments, name.section)

    // Rule 2: inside a type, a member type of it or of a type around it, innermost first.
    private fun findMemberType(segments: List<String>, memberScope: List<String>): Found? =
        (memberScope.size downTo 1).firstNotNullOfOrNull { length ->
            val outer = ownScope.typeAt(memberScope.take(length))
            outer?.let { ownScope.memberTypeOf(it, segments.first()) }?.let { descend(ownScope, it, segments.drop(1)) }
        }

    private fun findQualified(segments: List<String>, section: DelphiSection): Found? =
        (segments.size - 1 downTo 1).firstNotNullOfOrNull { length ->
            qualifiedUnitOf(segments.take(length), section)?.let { findIn(it, segments.drop(length)) }
        }

    private fun findSimple(segments: List<String>, section: DelphiSection): Found? =
        unitsSeenFrom(section).firstNotNullOfOrNull { findIn(it, segments) }

    private fun findIn(seen: SeenUnit, segments: List<String>): Found? {
        val found = seen.scope.find(segments.first()) ?: return null
        return descend(seen.scope, found.copy(isExactCase = found.isExactCase && seen.isExactCase), segments.drop(1))
    }

    // Below a type a segment is a member type of it, its own declaration, or any other member, which means the type.
    private fun descend(scope: UnitScope, found: Found, rest: List<String>): Found {
        if (rest.isEmpty() || found.declaration.kind !in TYPES_WITH_MEMBER_TYPES) return found
        val memberType = scope.memberTypeOf(found.declaration, rest.first()) ?: return found
        return descend(scope, memberType.copy(isExactCase = memberType.isExactCase && found.isExactCase), rest.drop(1))
    }

    /** The units a name in [section] sees, in lookup order. */
    private fun unitsSeenFrom(section: DelphiSection): List<SeenUnit> = listOf(SeenUnit(ownScopeFor(section), true)) +
        usesOf(section).reversed().mapNotNull { usedUnitOf(it) }

    private fun qualifiedUnitOf(qualifier: List<String>, section: DelphiSection): SeenUnit? {
        if (DelphiProject.keyOf(qualifier) == DelphiProject.keyOf(unit.name)) return SeenUnit(ownScopeFor(section), qualifier == unit.name)
        val entry = usesOf(section).lastOrNull { DelphiProject.keyOf(it) == DelphiProject.keyOf(qualifier) } ?: return null
        return usedUnitOf(entry)?.let { it.copy(isExactCase = it.isExactCase && qualifier == it.scope.name) }
    }

    private fun ownScopeFor(section: DelphiSection): UnitScope = if (section == DelphiSection.INTERFACE) ownInterfaceScope else ownScope

    private fun usedUnitOf(entry: List<String>): SeenUnit? = project.exportedScopeOf(entry)?.let { SeenUnit(it, entry == it.name) }

    private fun usesOf(section: DelphiSection): List<List<String>> =
        if (section == DelphiSection.INTERFACE) unit.interfaceUses else unit.interfaceUses + unit.implementationUses

    companion object {
        private const val ATTRIBUTE_SUFFIX = "Attribute"
        private val TYPES_WITH_MEMBER_TYPES = setOf(DelphiDeclarationKind.CLASS, DelphiDeclarationKind.RECORD, DelphiDeclarationKind.HELPER)
    }
}
