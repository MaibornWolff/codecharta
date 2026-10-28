package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_ALIAS_SEGMENT
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_FORWARD_DECLARATION_SEGMENT
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_IMPLEMENTATION_SEGMENT
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.TSE_NAMESPACE_SEGMENT
import de.maibornwolff.treesitter.excavationsite.api.Declaration
import de.maibornwolff.treesitter.excavationsite.api.DependencyResult
import de.maibornwolff.treesitter.excavationsite.api.ImportKind
import de.maibornwolff.treesitter.excavationsite.api.TypeUsage
import de.maibornwolff.treesitter.excavationsite.api.UsedType

/**
 * What one C or C++ file declares for the lookup of `cpp.md`: classes and type aliases by their path, the namespaces
 * it opens, and its using-declarations, using-directives and namespace aliases.
 */
internal data class CppFileFacts(
    val declarations: List<CppDeclared>,
    val usingDirectives: List<CppUsing>,
    val usingDeclarations: List<CppUsing>,
    val namespaceAliases: List<CppNamespaceAlias> = emptyList(),
    val namespaces: List<List<String>> = emptyList()
) {
    companion object {
        fun of(result: DependencyResult): CppFileFacts {
            val usings = result.imports.filter { it.kind != ImportKind.INCLUDE && it.bindingName == null }
            return CppFileFacts(
                declarations = result.declarations.filterNot { it.isNamespace() }.map { toDeclared(it) },
                usingDirectives = usings.filter { it.isWildcard }.map { CppUsing(it.namespacePath, it.path) },
                usingDeclarations = usings.filterNot { it.isWildcard }.map { CppUsing(it.namespacePath, it.path) },
                namespaceAliases = result.imports.mapNotNull { alias ->
                    alias.bindingName?.let { CppNamespaceAlias(alias.namespacePath, it, alias.path) }
                },
                namespaces = result.declarations.filter { it.isNamespace() }.map { it.parentPath.drop(1) + it.name }
            )
        }

        private val MARKERS = setOf(TSE_FORWARD_DECLARATION_SEGMENT, TSE_ALIAS_SEGMENT, TSE_IMPLEMENTATION_SEGMENT)

        private fun Declaration.isNamespace(): Boolean = parentPath.firstOrNull() == TSE_NAMESPACE_SEGMENT

        private fun toDeclared(declaration: Declaration): CppDeclared {
            val marker = declaration.parentPath.firstOrNull()
            val isMarked = marker in MARKERS
            return CppDeclared(
                path = (if (isMarked) declaration.parentPath.drop(1) else declaration.parentPath) + declaration.name,
                hasBody = !isMarked,
                bases = declaration.usedTypes.filter { it.usage == TypeUsage.INHERITANCE },
                aliasOf = declaration.usedTypes.singleOrNull().takeIf { marker == TSE_ALIAS_SEGMENT }
            )
        }
    }
}

/**
 * A class, struct, union or enum by its path of namespaces, classes and name; without a body it is a forward
 * declaration, the implementation part of a class or a type alias of the type [aliasOf] names.
 */
internal data class CppDeclared(val path: List<String>, val hasBody: Boolean, val bases: List<UsedType>, val aliasOf: UsedType? = null)

/** A using-declaration or -directive: the namespace it is written in and the path as written. */
internal data class CppUsing(val scope: List<String>, val path: List<String>)

/** `namespace name = target;` in the namespace [scope], the target as written. */
internal data class CppNamespaceAlias(val scope: List<String>, val name: String, val target: List<String>)
