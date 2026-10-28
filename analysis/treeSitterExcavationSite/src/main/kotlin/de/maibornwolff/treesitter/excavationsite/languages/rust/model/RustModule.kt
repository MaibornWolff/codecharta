package de.maibornwolff.treesitter.excavationsite.languages.rust.model

/**
 * What a Rust source declares and writes, for the name lookup of the dependency parser (`rust.md`). A place inside the
 * file is the chain of inline modules around it (`inlinePath`, `mod a { mod b { … } }` is `[a, b]`); an offset is the
 * UTF-8 byte the construct starts at, which orders a `macro_rules!` against what follows it. Test code is what a
 * `#[cfg(test)]` marks, on itself or on an inline module around it.
 */
data class RustModule(
    val modDeclarations: List<RustModDeclaration>,
    val items: List<RustItem>,
    val uses: List<RustUse>,
    val impls: List<RustImpl>,
    val externCrates: List<RustExternCrate>
)

enum class RustVisibility {
    PRIVATE,

    /** `pub(crate)`, `pub(super)`, `pub(in …)`: visible inside the crate at most. */
    RESTRICTED,
    PUBLIC
}

enum class RustNamespace {
    TYPE,
    VALUE,
    MACRO,

    /** A name in the arguments of a macro invocation, whose meaning only the expanded code would tell. */
    ANY
}

/** The kinds of item a module declares, with the namespaces their name lives in. */
enum class RustItemKind(val namespaces: Set<RustNamespace>) {
    STRUCT(setOf(RustNamespace.TYPE)),

    /** A tuple or unit struct, whose name is also its constructor. */
    TUPLE_STRUCT(setOf(RustNamespace.TYPE, RustNamespace.VALUE)),
    ENUM(setOf(RustNamespace.TYPE)),
    UNION(setOf(RustNamespace.TYPE)),
    TRAIT(setOf(RustNamespace.TYPE)),
    TYPE_ALIAS(setOf(RustNamespace.TYPE)),
    FUNCTION(setOf(RustNamespace.VALUE)),
    CONST(setOf(RustNamespace.VALUE)),
    STATIC(setOf(RustNamespace.VALUE)),
    MACRO(setOf(RustNamespace.MACRO))
}

/** `mod name;` or `mod name { … }`; [pathAttribute] is the value of `#[path = "…"]`. */
data class RustModDeclaration(
    val name: String,
    val inlinePath: List<String>,
    val visibility: RustVisibility,
    val isInline: Boolean,
    val pathAttribute: String? = null,
    val isTest: Boolean = false,
    val isMacroUse: Boolean = false,
    val offset: Int = 0
)

/**
 * A struct, enum, union, trait, type alias, function, const, static or `macro_rules!` of a module, with the [paths] its
 * signature and body write; [variants] are an enum's.
 */
data class RustItem(
    val name: String,
    val kind: RustItemKind,
    val inlinePath: List<String>,
    val visibility: RustVisibility,
    val paths: List<RustPath> = emptyList(),
    val variants: List<String> = emptyList(),
    val isTest: Boolean = false,
    val isMacroExport: Boolean = false,
    val offset: Int = 0
)

/** One name a `use` of a module binds: [binding] for `use a::B as binding;`, null for a glob or `as _`. */
data class RustUse(
    val path: List<String>,
    val binding: String?,
    val isGlob: Boolean,
    val visibility: RustVisibility,
    val inlinePath: List<String>,
    val isTest: Boolean = false,
    val offset: Int = 0
)

/** An `impl` block: the path its type names, the trait it implements, and every path it writes besides. */
data class RustImpl(
    val selfType: RustPath?,
    val trait: RustPath?,
    val inlinePath: List<String>,
    val paths: List<RustPath> = emptyList(),
    val isTest: Boolean = false
)

/** `extern crate name as binding;` */
data class RustExternCrate(val name: String, val binding: String, val inlinePath: List<String>)

/**
 * A path as written (`crate`, `self`, `super` and a leading empty segment for `::` included), looked up in [namespace].
 * [blockGlobs] are the paths of the glob imports of the blocks around it, innermost first, which bind before the
 * module does.
 */
data class RustPath(
    val segments: List<String>,
    val namespace: RustNamespace,
    val offset: Int = 0,
    val blockGlobs: List<List<String>> = emptyList()
)
