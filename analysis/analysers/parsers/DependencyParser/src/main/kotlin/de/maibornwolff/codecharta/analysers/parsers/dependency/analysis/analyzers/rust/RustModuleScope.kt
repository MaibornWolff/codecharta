package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

/**
 * One module of the module tree (`rust.md`, "Modules"): its logical path, the crate it belongs to, and the file and
 * inline modules it stands in. [childFolder] is the folder its `mod m;` lines load `m.rs` or `m/mod.rs` from.
 */
internal class RustModuleScope(
    val path: List<String>,
    val crate: RustCrate,
    val crateRootPath: List<String>,
    val file: List<String>,
    val inlinePath: List<String>,
    val childFolder: List<String>
)
