package de.maibornwolff.treesitter.excavationsite.shared.infrastructure.ffm

/** The naming scheme of the bundled native libraries: `lib/<architecture>-<system>-<name>.<extension>`. */
internal data class Platform(val architecture: String, val system: String, val extension: String) {
    fun libraryFileName(baseName: String): String = "$architecture-$system-$baseName.$extension"

    companion object {
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
                os.contains("windows") -> Platform(architecture, "windows", "dll")
                else -> throw UnsatisfiedLinkError("The tree-sitter parsers do not support the operating system $osName")
            }
        }
    }
}
