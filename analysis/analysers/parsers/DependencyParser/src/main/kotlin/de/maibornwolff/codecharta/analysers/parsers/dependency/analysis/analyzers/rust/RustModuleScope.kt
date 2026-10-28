package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import de.maibornwolff.treesitter.excavationsite.api.RustItem
import de.maibornwolff.treesitter.excavationsite.api.RustUse
import de.maibornwolff.treesitter.excavationsite.api.RustVisibility

/**
 * One module of the module tree (`rust.md`, "Modules"): its logical path, the crate it belongs to, the file and inline
 * modules it stands in, and the names it binds. [childFolder] is the folder its `mod m;` lines load `m.rs` or
 * `m/mod.rs` from; [inheritedMacros] are the `macro_rules!` in textual scope where the module is declared; [isTest] marks
 * a module that `#[cfg(test)]` declares, or one inside such a module.
 */
internal class RustModuleScope(
    val path: List<String>,
    val crate: RustCrate,
    val crateRootPath: List<String>,
    val file: List<String>,
    val inlinePath: List<String>,
    val parent: RustModuleScope?,
    val childFolder: List<String>,
    val inheritedMacros: List<MacroBinding> = emptyList(),
    val isTest: Boolean = false
) {
    val modules = LinkedHashMap<String, RustModuleScope>()
    val moduleVisibilities = HashMap<String, RustVisibility>()
    val items = LinkedHashMap<String, MutableList<RustItem>>()
    val uses = mutableListOf<RustUse>()
    val globs = mutableListOf<RustUse>()

    /** `#[macro_export]` macros, which are items of a crate's root module. */
    val exportedMacros = LinkedHashMap<String, MacroBinding>()

    fun pathOf(name: String): List<String> = path + name

    /** Whether code in [viewer] may name what this module declares with [visibility]. */
    fun isVisibleTo(viewer: RustModuleScope, visibility: RustVisibility): Boolean = when (visibility) {
        RustVisibility.PUBLIC -> true
        RustVisibility.RESTRICTED -> viewer.crateRootPath == crateRootPath
        RustVisibility.PRIVATE -> viewer.path.size >= path.size && viewer.path.take(path.size) == path
    }
}

/** A `macro_rules!` by its name and the logical path of its declaration. */
internal data class MacroBinding(val name: String, val path: List<String>)
