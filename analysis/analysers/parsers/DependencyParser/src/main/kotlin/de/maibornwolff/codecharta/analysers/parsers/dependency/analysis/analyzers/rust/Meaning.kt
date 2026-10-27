package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import de.maibornwolff.treesitter.excavationsite.api.RustItem

/** What a path means (`rust.md`, "A simple name", "A path"): a module, a declaration, or a re-export of one. */
internal sealed interface Meaning {
    /** The logical path of the declaration a use of this meaning points at, null for a module. */
    val declarationPath: List<String>?

    data class Module(val scope: RustModuleScope) : Meaning {
        override val declarationPath: List<String>? = null
    }

    /** A declared item; a `macro_rules!` that only its textual scope or `#[macro_export]` finds has no [item]. */
    data class Declared(val path: List<String>, val item: RustItem?) : Meaning {
        override val declarationPath: List<String> = path
    }

    /** A name a `use` with a visibility binds in another module (decision 7); a module it binds is walked through. */
    data class Reexport(val path: List<String>, val target: Meaning) : Meaning {
        override val declarationPath: List<String>? = if (target is Module) null else path
    }
}
