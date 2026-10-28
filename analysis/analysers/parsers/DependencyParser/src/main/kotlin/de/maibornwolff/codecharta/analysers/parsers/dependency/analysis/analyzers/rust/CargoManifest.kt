package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.rust

/**
 * What a `Cargo.toml` says about the crates of its package (`rust.md`, "Crates"): the package name, its edition, the
 * library's name and path, the targets it lists, and the dependencies it renames: alias to package name.
 */
internal data class CargoManifest(
    val packageName: String? = null,
    val edition: String? = null,
    val inheritsEdition: Boolean = false,
    val workspaceEdition: String? = null,
    val libraryName: String? = null,
    val libraryPath: String? = null,
    val targets: List<CargoTarget> = emptyList(),
    val renamedDependencies: Map<String, String> = emptyMap()
)

internal enum class CargoTargetKind(private val table: String, val folder: String?) {
    LIBRARY("lib", null),
    BINARY("bin", "src/bin"),
    TEST("test", "tests"),
    EXAMPLE("example", "examples"),
    BENCH("bench", "benches");

    companion object {
        fun ofTable(table: String): CargoTargetKind? = entries.firstOrNull { it.table == table && it != LIBRARY }
    }
}

/** A `[[bin]]`, `[[test]]`, `[[example]]` or `[[bench]]` table. */
internal data class CargoTarget(val kind: CargoTargetKind, val name: String? = null, val path: String? = null)
