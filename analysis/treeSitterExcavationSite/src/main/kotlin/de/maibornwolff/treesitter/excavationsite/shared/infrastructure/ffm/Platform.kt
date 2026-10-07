package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

/** The naming scheme of the bundled native libraries: `lib/<architecture>-<system>-<name>.<extension>`. */
internal data class Platform(val architecture: String, val system: String, val extension: String) {
    // The core library the bonede jars ship for Windows exports only its JNI functions, not the C API.
    val coreLibraryName: String get() = if (system == WINDOWS) OWN_CORE_LIBRARY else BONEDE_CORE_LIBRARY

    fun libraryFileName(baseName: String): String = "$architecture-$system-$baseName.$extension"

    companion object {
        private const val WINDOWS = "windows"
        private const val BONEDE_CORE_LIBRARY = "tree-sitter"
        private const val OWN_CORE_LIBRARY = "tree-sitter-core"

        fun current(): Platform = of(System.getProperty("os.name"), System.getProperty("os.arch"))

        fun of(osName: String, osArch: String): Platform {
            val architecture = when (osArch.lowercase()) {
                "aarch64", "arm64" -> "aarch64"
                "amd64", "x86_64" -> "x86_64"
                else -> throw UnsatisfiedLinkError("The tree-sitter parsers do not support the architecture $osArch")
            }
            val os = osName.lowercase()
            return when {
                os.contains("linux") -> Platform(architecture, "linux-gnu", "so")
                os.contains("mac") -> Platform(architecture, "macos", "dylib")
                os.contains(WINDOWS) -> Platform(architecture, WINDOWS, "dll")
                else -> throw UnsatisfiedLinkError("The tree-sitter parsers do not support the operating system $osName")
            }
        }
    }
}
