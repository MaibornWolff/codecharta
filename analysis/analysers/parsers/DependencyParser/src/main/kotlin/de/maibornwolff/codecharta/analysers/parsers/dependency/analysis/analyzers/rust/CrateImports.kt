package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import de.maibornwolff.codecharta.model.ExternalImport
import de.maibornwolff.treesitter.excavationsite.api.RustModule

/**
 * The crates of other packages a Rust file uses: the first segment of a `use` path or an `extern crate` that names
 * neither the language's own crates, nor a crate of the project, nor a module or item of the file. A dependency
 * renamed in Cargo.toml is given by the package it renames.
 */
internal class CrateImports(private val crate: RustCrate, private val projectCrateNames: Set<String>) {
    fun of(module: RustModule): Set<ExternalImport> {
        val localNames = module.modDeclarations.map { it.name } + module.items.map { it.name }
        val renamedPackages = crate.renamedDependencies.mapKeys { RustCrates.crateNameOf(it.key) }
        return (module.uses.mapNotNull { it.path.firstOrNull() } + module.externCrates.map { it.name })
            .filterNot { it in LANGUAGE_CRATES || it in projectCrateNames || it in localNames }
            .map { ExternalImport(ECOSYSTEM, renamedPackages[it] ?: it) }
            .toSet()
    }

    companion object {
        private const val ECOSYSTEM = "cargo"
        private val LANGUAGE_CRATES = setOf("", "crate", "self", "super", "Self", "std", "core", "alloc", "proc_macro", "test")
    }
}
