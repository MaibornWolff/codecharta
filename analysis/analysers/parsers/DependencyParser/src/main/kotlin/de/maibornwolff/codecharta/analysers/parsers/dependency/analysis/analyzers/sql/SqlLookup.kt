package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.sql

import de.maibornwolff.treesitter.excavationsite.api.SqlName
import de.maibornwolff.treesitter.excavationsite.api.SqlNameKind
import de.maibornwolff.treesitter.excavationsite.api.SqlObjectKind

/**
 * The lookup of `docs/name-resolution/sql.md` for the names one object writes in [ownSchema] (null for none), inside
 * [ownPackage] if it is a package or one of its members: a member of the own package (rule 2), the own schema (rule
 * 3), the default schema (rule 4), the one other schema that has the name (rule 5, decision 3); a qualified name
 * through a package or a schema. Each position asks for its kinds of object (decision 6), a call for a routine before an
 * object type, a type position for a type or domain before the row type of a table. The extractor has left out the
 * names locals hide.
 */
internal class SqlLookup(private val project: SqlProject, private val ownSchema: String?, private val ownPackage: PackageScope?) {
    /** What a name means: the path of a declaration and the kinds of copy that path can mean, empty for any. */
    data class Found(val path: List<String>, val kinds: Set<String>)

    /** A package a name is written in, with the members a name inside it can mean. */
    class PackageScope(val path: List<String>, val members: Set<String>)

    fun resolve(name: SqlName): Found? = when (name.kind) {
        SqlNameKind.BARE -> ownPackage?.let { memberOf(it.path, it.members, name.parts.single()) }
        SqlNameKind.MEMBER -> packageMember(name.parts)
        else -> objectNamed(name.parts, name.kind)
    }

    private fun objectNamed(parts: List<String>, kind: SqlNameKind): Found? {
        if (parts.size == 1) {
            val ownMember = ownPackage?.takeIf { kind in PACKAGE_MEMBER_KINDS }?.let { memberOf(it.path, it.members, parts.single()) }
            return ownMember ?: unqualified(parts.single(), kindsAskedFor(kind))
        }
        packageMember(parts)?.let { return it }
        if (parts.size > 2) return objectNamed(parts.drop(1), kind)
        if (packageNamed(parts.dropLast(1)) != null) return null
        return inSchema(parts.first(), parts.last(), kind)
    }

    private fun unqualified(name: String, kindsInOrder: List<Set<SqlObjectKind>>): Found? = kindsInOrder.firstNotNullOfOrNull { kinds ->
        val candidates = project.objectsNamed(name).filter { it.kind in kinds }.map { it.path }.distinct()
        val inOwnSchema = ownSchema?.let { schema -> candidates.find { it == listOf(schema, name) } }
        val path = inOwnSchema ?: candidates.find { it.size == 1 } ?: candidates.singleOrNull { it.size > 1 }
        path?.let { Found(it, namesOf(kinds)) }
    }

    // A schema the project does not create objects in may be the default schema under its own name (decision 12)
    private fun inSchema(schema: String, name: String, kind: SqlNameKind): Found? = kindsAskedFor(kind).firstNotNullOfOrNull { kinds ->
        val candidates = project.objectsNamed(name).filter { it.kind in kinds }.map { it.path }
        val path = candidates.find { it == listOf(schema, name) } ?: candidates.find { it.size == 1 }
        path?.let { Found(it, namesOf(kinds)) }
    }

    private fun packageMember(parts: List<String>): Found? {
        if (parts.size < 2) return null
        val packagePath = packageNamed(parts.dropLast(1)) ?: return parts.takeIf { it.size > 2 }?.let { packageMember(it.drop(1)) }
        val members = project.packageMembersOf(packagePath) + ownPackage?.takeIf { it.path == packagePath }?.members.orEmpty()
        return memberOf(packagePath, members, parts.last())
    }

    private fun packageNamed(qualifier: List<String>): List<String>? {
        if (qualifier.size == 1) return unqualified(qualifier.single(), listOf(PACKAGES))?.path
        val packages = project.objectsNamed(qualifier.last()).filter { it.kind == SqlObjectKind.PACKAGE }.map { it.path }
        return packages.find { it == qualifier.takeLast(2) }
    }

    private fun memberOf(packagePath: List<String>, members: Set<String>, name: String): Found? =
        if (name in members) Found(packagePath + name, emptySet()) else null

    companion object {
        private val RELATIONS = setOf(SqlObjectKind.TABLE, SqlObjectKind.VIEW, SqlObjectKind.SYNONYM)
        private val PACKAGES = setOf(SqlObjectKind.PACKAGE)
        private val PACKAGE_MEMBER_KINDS = setOf(SqlNameKind.ROUTINE, SqlNameKind.TYPE, SqlNameKind.ANY)
        private val KINDS_ASKED_FOR = mapOf(
            SqlNameKind.RELATION to listOf(RELATIONS),
            SqlNameKind.ROUTINE to listOf(setOf(SqlObjectKind.ROUTINE, SqlObjectKind.SYNONYM), setOf(SqlObjectKind.TYPE)),
            SqlNameKind.TYPE to listOf(setOf(SqlObjectKind.TYPE, SqlObjectKind.DOMAIN, SqlObjectKind.SYNONYM), RELATIONS),
            SqlNameKind.SEQUENCE to listOf(setOf(SqlObjectKind.SEQUENCE, SqlObjectKind.SYNONYM)),
            SqlNameKind.ANY to listOf(SqlObjectKind.entries.toSet())
        )

        /** The kind a node of an object of [kind] has (`Node.kind`), which a use's kinds name. */
        fun kindOf(kind: SqlObjectKind): String = kind.name.lowercase()

        private fun kindsAskedFor(kind: SqlNameKind): List<Set<SqlObjectKind>> = KINDS_ASKED_FOR[kind].orEmpty()

        private fun namesOf(kinds: Set<SqlObjectKind>): Set<String> = kinds.mapTo(HashSet()) { kindOf(it) }
    }
}
