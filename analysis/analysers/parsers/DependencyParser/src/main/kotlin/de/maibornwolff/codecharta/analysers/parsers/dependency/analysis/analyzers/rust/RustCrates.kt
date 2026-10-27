package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

import java.io.File

/**
 * A crate of the analysed project (`rust.md`, "Crates"): its name, the file its module tree starts at, and what its
 * package says about the edition and renamed dependencies. A file is its path below the analysis root in segments.
 */
internal data class RustCrate(
    val name: String,
    val rootFile: List<String>,
    val kind: CargoTargetKind,
    val edition: Int,
    val packageFolder: List<String>?,
    val renamedDependencies: Map<String, String> = emptyMap()
) {
    companion object {
        const val EDITION_2015 = 2015
        const val EDITION_2018 = 2018
        const val EDITION_2021 = 2021
    }
}

internal data class RustPackage(val name: String, val folder: List<String>, val crates: List<RustCrate>)

/**
 * The crates below an analysis root, in the order a file that several crates load is given to the first (decision
 * 12): per package the library, the binaries, the tests, the examples, the benches, as Cargo finds them. A `lib.rs` or
 * `main.rs` in a folder `src` of no package is a crate named after the folder that holds `src`, read as edition 2021
 * (decision 13). Without an analysis root there is no package.
 */
internal class RustCrates(private val analysisRoot: File?, private val rustFiles: Set<List<String>>) {
    val packages: List<RustPackage> = manifestFolders().mapNotNull { folder -> packageIn(folder) }
    val crates: List<RustCrate> = packages.flatMap { it.crates } + cratesWithoutPackage()

    /** The package whose folder holds [file], the innermost of nested ones. */
    fun packageOf(file: List<String>): RustPackage? =
        packages.filter { file.size > it.folder.size && file.take(it.folder.size) == it.folder }.maxByOrNull { it.folder.size }

    private fun manifestFolders(): List<List<String>> {
        val root = analysisRoot ?: return emptyList()
        return root
            .walkTopDown()
            .onEnter { folder -> folder == root || folder.name !in SKIPPED_FOLDERS && !folder.name.startsWith(HIDDEN_PREFIX) }
            .filter { it.isFile && it.name == MANIFEST }
            .map { manifest ->
                manifest.parentFile
                    .relativeTo(root)
                    .invariantSeparatorsPath
                    .split(SEPARATOR)
                    .filter { it.isNotEmpty() }
            }.sortedBy { it.joinToString(SEPARATOR) }
            .toList()
    }

    private fun packageIn(folder: List<String>): RustPackage? {
        val manifest = CargoManifestReader.parse(fileOf(folder + MANIFEST).readText())
        val packageName = manifest.packageName ?: return null
        val edition = editionOf(manifest, folder)
        val crates = targetsOf(manifest, packageName, folder)
            .filter { it.root in rustFiles }
            .distinctBy { it.root }
            .map { RustCrate(crateNameOf(it.name), it.root, it.kind, edition, folder, manifest.renamedDependencies) }
        return RustPackage(packageName, folder, crates)
    }

    private data class Target(val name: String, val root: List<String>, val kind: CargoTargetKind)

    private fun targetsOf(manifest: CargoManifest, packageName: String, folder: List<String>): List<Target> {
        val library = Target(
            manifest.libraryName ?: packageName,
            folder + (manifest.libraryPath?.let { pathSegments(it) } ?: LIB_ROOT),
            CargoTargetKind.LIBRARY
        )
        return listOf(library) + CargoTargetKind.entries.filter { it != CargoTargetKind.LIBRARY }.flatMap { kind ->
            listedTargets(manifest, kind, folder) + defaultTargets(kind, packageName, folder) + discoveredTargets(folder, kind)
        }
    }

    private fun listedTargets(manifest: CargoManifest, kind: CargoTargetKind, folder: List<String>): List<Target> =
        manifest.targets.filter { it.kind == kind && it.name != null }.map { target ->
            val name = target.name.orEmpty()
            Target(name, folder + pathSegments(target.path ?: "${kind.folder}/$name$RUST_SUFFIX"), kind)
        }

    private fun defaultTargets(kind: CargoTargetKind, packageName: String, folder: List<String>): List<Target> =
        if (kind == CargoTargetKind.BINARY) listOf(Target(packageName, folder + MAIN_ROOT, kind)) else emptyList()

    // `src/bin/x.rs` and `src/bin/x/main.rs`, likewise in `tests`, `examples` and `benches`
    private fun discoveredTargets(folder: List<String>, kind: CargoTargetKind): List<Target> {
        val targetFolder = folder + pathSegments(kind.folder ?: return emptyList())
        return rustFiles
            .filter { it.size > targetFolder.size && it.take(targetFolder.size) == targetFolder }
            .mapNotNull { file ->
                val rest = file.drop(targetFolder.size)
                when {
                    rest.size == 1 -> Target(rest.single().removeSuffix(RUST_SUFFIX), file, kind)
                    rest.size == 2 && rest.last() == MAIN_FILE -> Target(rest.first(), file, kind)
                    else -> null
                }
            }.sortedBy { it.root.joinToString(SEPARATOR) }
    }

    private fun editionOf(manifest: CargoManifest, folder: List<String>): Int {
        val written = manifest.edition
            ?: manifest.workspaceEdition
            ?: if (manifest.inheritsEdition) workspaceEditionAbove(folder) else null
        return written?.toIntOrNull() ?: RustCrate.EDITION_2015
    }

    private fun workspaceEditionAbove(folder: List<String>): String? = (folder.size - 1 downTo 0)
        .map { folder.take(it) + MANIFEST }
        .firstNotNullOfOrNull { manifest ->
            fileOf(manifest).takeIf { it.isFile }?.let { CargoManifestReader.parse(it.readText()).workspaceEdition }
        }

    private fun cratesWithoutPackage(): List<RustCrate> = rustFiles
        .filter { file -> isRootInSourceFolder(file) && packageOf(file) == null }
        .sortedWith(compareBy({ it.dropLast(1).joinToString(SEPARATOR) }, { it.last() != LIB_FILE }))
        .map { root ->
            val kind = if (root.last() == LIB_FILE) CargoTargetKind.LIBRARY else CargoTargetKind.BINARY
            RustCrate(root.getOrNull(root.size - FOLDER_BEFORE_SOURCE).orEmpty(), root, kind, RustCrate.EDITION_2021, null)
        }

    private fun isRootInSourceFolder(file: List<String>): Boolean =
        file.size >= 2 && file.last() in CRATE_ROOT_FILES && file[file.size - 2] == SOURCE_FOLDER

    private fun fileOf(segments: List<String>): File = File(analysisRoot, segments.joinToString(File.separator))

    private fun pathSegments(path: String): List<String> =
        path.split(SEPARATOR, BACKSLASH).filter { it.isNotEmpty() && it != CURRENT_FOLDER }

    companion object {
        const val RUST_SUFFIX = ".rs"
        const val LIB_FILE = "lib.rs"
        const val MAIN_FILE = "main.rs"
        const val MOD_FILE = "mod.rs"
        const val SOURCE_FOLDER = "src"
        val CRATE_ROOT_FILES = setOf(LIB_FILE, MAIN_FILE)
        private const val MANIFEST = "Cargo.toml"
        private const val SEPARATOR = "/"
        private const val BACKSLASH = "\\"
        private const val CURRENT_FOLDER = "."
        private const val HIDDEN_PREFIX = "."
        private const val FOLDER_BEFORE_SOURCE = 3
        private val SKIPPED_FOLDERS = setOf("target", "node_modules")
        private val LIB_ROOT = listOf(SOURCE_FOLDER, LIB_FILE)
        private val MAIN_ROOT = listOf(SOURCE_FOLDER, MAIN_FILE)

        /** A package or target name as the code writes it: `my-game` is `my_game`. */
        fun crateNameOf(name: String): String = name.replace('-', '_')
    }
}
