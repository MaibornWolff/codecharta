package de.maibornwolff.treesitter.excavationsite.shared.domain

data class DependencyResult(val packagePath: List<String>, val imports: List<ImportDeclaration>, val declarations: List<Declaration>)

enum class ImportKind {
    STANDARD,
    INCLUDE,
    REEXPORT
}

data class ImportDeclaration(
    val path: List<String>,
    val isWildcard: Boolean,
    val namespacePath: List<String> = emptyList(),
    val kind: ImportKind = ImportKind.STANDARD,
    val bindingName: String? = null
)

enum class DeclarationType {
    CLASS,
    INTERFACE,
    ENUM,
    RECORD,
    ANNOTATION,
    FUNCTION,
    VARIABLE,
    REEXPORT,
    UNKNOWN
}

data class Declaration(
    val name: String,
    val type: DeclarationType,
    val usedTypes: Set<UsedType>,
    val parentPath: List<String> = emptyList()
)

/**
 * A type referenced inside a declaration body.
 *
 * `namespacePrefix` holds the namespace or scope segments that were written
 * alongside the type at the use site (e.g. `A::B` for `A::B::Settings`). It
 * is empty for unqualified uses. This slot exists for languages like C++
 * where fully-qualified inline type references are idiomatic; Java / Kotlin
 * / C# code typically imports types at the top of the file and uses short
 * names inline, so their extractors leave it empty.
 *
 * Adapters that consume `UsedType` may use `namespacePrefix` to synthesize
 * wildcard imports per qualified usage, which feeds the resolver the same
 * hint a `using namespace A::B;` directive would.
 */
data class UsedType(val name: String, val genericTypes: List<UsedType> = emptyList(), val namespacePrefix: List<String> = emptyList()) {
    fun isUppercase(): Boolean = name.firstOrNull()?.isUpperCase() == true
}
