package de.maibornwolff.treesitter.excavationsite.shared.domain

/**
 * Supported programming languages for metric collection and text extraction.
 */
enum class Language(val primaryExtension: String, val otherExtensions: Set<String> = emptySet()) {
    JAVA(primaryExtension = ".java"),
    KOTLIN(primaryExtension = ".kt", otherExtensions = setOf(".kts")),
    TYPESCRIPT(primaryExtension = ".ts"),
    TSX(primaryExtension = ".tsx"),
    JAVASCRIPT(primaryExtension = ".js", otherExtensions = setOf(".jsx", ".mjs", ".cjs")),
    PYTHON(primaryExtension = ".py"),
    GO(primaryExtension = ".go"),
    PHP(primaryExtension = ".php"),
    RUBY(primaryExtension = ".rb"),
    SWIFT(primaryExtension = ".swift"),
    BASH(primaryExtension = ".sh", otherExtensions = setOf(".bash")),
    CSHARP(primaryExtension = ".cs"),
    CPP(primaryExtension = ".cpp", otherExtensions = setOf(".cc", ".cxx", ".hpp", ".hxx", ".h")),
    C(primaryExtension = ".c"),
    OBJECTIVE_C(primaryExtension = ".m", otherExtensions = setOf(".mm")),
    VUE(primaryExtension = ".vue"),
    ABL(primaryExtension = ".p", otherExtensions = setOf(".cls", ".w", ".i")),
    DELPHI(primaryExtension = ".pas", otherExtensions = setOf(".dpr")),
    RUST(primaryExtension = ".rs");

    companion object {
        private val extensionMap: Map<String, Language> by lazy {
            val map = mutableMapOf<String, Language>()
            entries.forEach { lang ->
                map[lang.primaryExtension] = lang
                lang.otherExtensions.forEach { ext -> map[ext] = lang }
            }
            map
        }

        /**
         * Returns the Language for the given file extension, or null if not supported.
         *
         * @param extension The file extension including the dot (e.g., ".java")
         */
        fun fromExtension(extension: String): Language? = extensionMap[extension.lowercase()]

        /**
         * Returns the Language for the given filename, or null if not supported.
         *
         * @param filename The filename with extension (e.g., "Main.java")
         */
        fun fromFilename(filename: String): Language? {
            val ext = "." + filename.substringAfterLast('.', "")
            return fromExtension(ext)
        }
    }
}
