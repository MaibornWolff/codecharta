package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_CPP_GLOBAL_SCOPE
import de.maibornwolff.treesitter.excavationsite.api.UsedType

/**
 * The lookup of "A simple name" and "A qualified name" of `docs/name-resolution/cpp.md` over what the include closure of
 * one file declares, [closure] in the order the compiler reads it. A name resolves to the path of a class, struct,
 * union or enum the closure declares, with or without a body, or to nothing: a library name, an unknown or an
 * ambiguous one.
 */
internal class CppVisibleNames(
    private val closure: List<CppFileFacts>,
    private val visibleNamesOfBody: (List<String>) -> CppVisibleNames? = { null },
    private val followsBases: Boolean = true
) {
    private val declared: Set<List<String>> = closure.flatMapTo(HashSet()) { facts -> facts.declarations.map { it.path } }
    private val scopes: Set<List<String>> = declared.flatMapTo(HashSet()) { path -> (1..path.size).map { path.take(it) } }
    private val usingDirectives = closure.flatMap { it.usingDirectives }
    private val usingDeclarations = closure.flatMap { it.usingDeclarations }
    private val namespaceAliases = closure.flatMap { it.namespaceAliases }
    private val aliases: Map<List<String>, UsedType> = closure
        .flatMap { facts -> facts.declarations.mapNotNull { declared -> declared.aliasOf?.let { declared.path to it } } }
        .toMap()

    /** The path [written] means, written as `Q::N` segments inside the declaration of path [scope]. */
    fun resolve(written: List<String>, scope: List<String>): List<String>? = when {
        written.first() == TSE_CPP_GLOBAL_SCOPE -> resolveGlobal(written.drop(1))
        written.size == 1 -> resolveSimple(written.single(), scope)
        else -> resolveQualified(written, scope)
    }

    /** The direct base classes of the class [path], each looked up where the class is declared. */
    fun basesOf(path: List<String>): List<List<String>> {
        val classDeclaration = closure.firstNotNullOfOrNull { facts -> facts.declarations.find { it.path == path && it.hasBody } }
        return classDeclaration?.bases.orEmpty().mapNotNull { base ->
            lookupOnly(base.namespacePrefix + base.name, path.dropLast(1))
        }
    }

    private fun resolveSimple(name: String, scope: List<String>): List<String>? = lookup(name, scope) { it in declared }

    private fun resolveGlobal(written: List<String>): List<String>? {
        if (written.size == 1) return written.takeIf { it in declared }
        return written.first().let { listOf(it) }.takeIf { it in scopes || it in aliases }?.let { below(it, written) }
    }

    // The first segment of a qualified name is looked up as a simple name, as a namespace, class or alias of one
    private fun resolveQualified(written: List<String>, scope: List<String>): List<String>? =
        lookup(written.first(), scope) { it in scopes || it in aliases }?.let { below(it, written) }

    private fun below(first: List<String>, written: List<String>): List<String>? {
        val qualifier = written.drop(1).dropLast(1).fold(unaliased(first) ?: return null) { outer, segment ->
            unaliased(outer + segment) ?: return null
        }
        val path = qualifier + written.last()
        if (path in declared) return path
        return basesOfVisible(qualifier).map { it + written.last() }.firstOrNull { it in declared } ?: memberOf(qualifier)
    }

    // A name below the deepest declaration it reaches that no declaration is, SpeedType::WALKING, is a use of it
    private fun memberOf(qualifier: List<String>): List<String>? = qualifier.takeIf { it in declared }

    private fun lookup(name: String, scope: List<String>, isMeant: (List<String>) -> Boolean): List<String>? {
        for (level in chainOf(scope)) {
            val found = candidatesAt(level, name, scope, isMeant)
            if (found.isNotEmpty()) return found.singleOrNull()
        }
        return null
    }

    // A library name a using-declaration brings in stops the lookup as well, as a set holding null
    private fun candidatesAt(
        level: List<String>,
        name: String,
        scope: List<String>,
        isMeant: (List<String>) -> Boolean
    ): Set<List<String>?> {
        val found = LinkedHashSet<List<String>?>()
        (level + name).takeIf(isMeant)?.let { found.add(it) }
        if (level in declared) {
            basesOfVisible(level).map { it + name }.filterTo(found, isMeant)
            return found
        }
        usingDeclarations
            .filter { it.scope == level && it.path.last() == name && isWithin(scope, it.scope) }
            .forEach { found.add(resolveQualified(it.path, it.scope)) }
        namespaceAliases
            .filter { it.scope == level && it.name == name && isWithin(scope, it.scope) }
            .map { alias -> chainOf(alias.scope).map { it + alias.target }.firstOrNull { it in scopes } ?: alias.target }
            .filterTo(found, isMeant)
        usingDirectives
            .filter { isWithin(scope, it.scope) && landingOf(it) == level }
            .map { nominatedOf(it) + name }
            .filterTo(found, isMeant)
        return found
    }

    // A type alias as a qualifier stands for the class it names, looked up where the alias is declared
    private fun unaliased(path: List<String>, depth: Int = 0): List<String>? {
        val target = aliases[path] ?: return path
        if (depth == MAX_ALIAS_DEPTH) return null
        return resolve(target.namespacePrefix + target.name, path.dropLast(1))?.let { unaliased(it, depth + 1) }
    }

    private fun basesOfVisible(classPath: List<String>): List<List<String>> =
        if (followsBases) (visibleNamesOfBody(classPath) ?: this).basesOf(classPath) else emptyList()

    // The bases of a class are looked up without bases of their own, as java.md's rule 3 looks at direct supertypes only
    private fun lookupOnly(written: List<String>, scope: List<String>): List<String>? =
        CppVisibleNames(closure, followsBases = false).resolve(written, scope)

    private fun nominatedOf(directive: CppUsing): List<String> =
        chainOf(directive.scope).map { it + directive.path }.firstOrNull { it in scopes } ?: directive.path

    private fun landingOf(directive: CppUsing): List<String> =
        nominatedOf(directive).zip(directive.scope).takeWhile { (first, second) -> first == second }.map { it.first }

    private fun isWithin(scope: List<String>, namespace: List<String>): Boolean =
        scope.size >= namespace.size && scope.take(namespace.size) == namespace

    private fun chainOf(scope: List<String>): List<List<String>> = (scope.size downTo 0).map { scope.take(it) }

    companion object {
        private const val MAX_ALIAS_DEPTH = 8
    }
}
