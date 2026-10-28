package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.delphi

import de.maibornwolff.treesitter.excavationsite.api.DelphiDeclaration
import de.maibornwolff.treesitter.excavationsite.api.DelphiDeclarationKind
import de.maibornwolff.treesitter.excavationsite.api.DelphiName
import de.maibornwolff.treesitter.excavationsite.api.DelphiSection
import de.maibornwolff.treesitter.excavationsite.api.DelphiUnit

/**
 * The lookup of `docs/name-resolution/delphi.md` for the names one unit writes: inside a type a member of it, of its
 * project ancestors and of the types around it (decision 4); a name qualified by a unit in scope (the longest prefix);
 * the own unit, then the used units, the last listed first, the implementation `uses` before the interface `uses`. A
 * name only means what it finds when every segment on the way is written in its declared case (decision 3). The
 * extractor has left out the names a local declaration hides.
 */
internal class DelphiLookup(private val project: DelphiProject, private val unit: DelphiUnit) {
    private val ownScope = UnitScope(unit.name, unit.declarations)
    private val ownInterfaceScope = UnitScope(unit.name, unit.declarations.filter { it.section == DelphiSection.INTERFACE })
    private val lookupsOfOtherUnits = HashMap<String, DelphiLookup?>()
    private val typesWhoseBasesAreResolving = HashSet<DelphiDeclaration>()

    /** A unit a name sees, and whether the uses entry or qualifier that leads to it has the unit's declared case. */
    private data class SeenUnit(val scope: UnitScope, val isExactCase: Boolean)

    /** A type and the scope of the unit that declares it, where its base types are written. */
    private data class TypeInUnit(val scope: UnitScope, val declaration: DelphiDeclaration)

    /** What a name finds among the members of a type: a member type, its own declaration, or any other member, which hides. */
    private sealed interface MemberHit {
        data class MemberType(val found: Found, val scope: UnitScope) : MemberHit

        data object Hiding : MemberHit
    }

    /** The logical path of the declaration [name] means, or null for a local, member, library or unknown name. */
    fun resolve(name: DelphiName): List<String>? {
        val found = writtenFormsOf(name).firstNotNullOfOrNull { find(it, name) } ?: return null
        return if (found.isExactCase) found.path else null
    }

    // Decision 8: an attribute `[Table]` means `TableAttribute` before `Table`.
    private fun writtenFormsOf(name: DelphiName): List<List<String>> {
        if (!name.isAttribute) return listOf(name.segments)
        return listOf(name.segments.dropLast(1) + (name.segments.last() + ATTRIBUTE_SUFFIX), name.segments)
    }

    private fun find(segments: List<String>, name: DelphiName): Found? = when (val hit = findMember(segments.first(), name.memberScope)) {
        is MemberHit.MemberType -> descend(hit.scope, hit.found, segments.drop(1))
        MemberHit.Hiding -> null
        null -> findQualified(segments, name.section) ?: findSimple(segments, name.section)
    }

    // Rule 2: the type the name stands in, then each type around it, innermost first.
    private fun findMember(written: String, memberScope: List<String>): MemberHit? =
        (memberScope.size downTo 1).firstNotNullOfOrNull { length ->
            ownScope.typeAt(memberScope.take(length))?.let { memberOf(TypeInUnit(ownScope, it), written) }
        }

    private fun memberOf(type: TypeInUnit, written: String): MemberHit? = typeAndAncestors(type).firstNotNullOfOrNull { candidate ->
        if (candidate.declaration.members.none { it.equals(written, ignoreCase = true) }) return@firstNotNullOfOrNull null
        val scope = candidate.scope
        scope.memberTypeOf(candidate.declaration, written)?.let { MemberHit.MemberType(it, scope) } ?: MemberHit.Hiding
    }

    // A helper's first base type is the type it extends, whose members it sees as well.
    private fun typeAndAncestors(start: TypeInUnit): Sequence<TypeInUnit> = sequence {
        val seen = HashSet<List<String>>()
        val pending = ArrayDeque(listOf(start))
        while (pending.isNotEmpty()) {
            val type = pending.removeFirst()
            if (!seen.add(type.scope.name + type.declaration.outerTypes + type.declaration.name)) continue
            yield(type)
            pending.addAll(lookupOf(type.scope.name)?.baseTypesOf(type.declaration).orEmpty())
        }
    }

    // Only the ancestors the project declares are known; a base type is written in the unit of the type that names it.
    private fun baseTypesOf(declaration: DelphiDeclaration): List<TypeInUnit> {
        if (!typesWhoseBasesAreResolving.add(declaration)) return emptyList()
        val bases = declaration.baseTypes.mapNotNull { base ->
            val found = find(base, DelphiName(base, declaration.section, declaration.outerTypes))
            found?.let { lookupOf(it.unitName) }?.let { TypeInUnit(it.ownScope, found.declaration) }
        }
        typesWhoseBasesAreResolving.remove(declaration)
        return bases
    }

    private fun lookupOf(unitName: List<String>): DelphiLookup? {
        val key = DelphiProject.keyOf(unitName)
        if (key == DelphiProject.keyOf(unit.name)) return this
        return lookupsOfOtherUnits.getOrPut(key) { project.unitNamed(unitName)?.let { DelphiLookup(project, it) } }
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
