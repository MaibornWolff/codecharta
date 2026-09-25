package de.maibornwolff.codecharta.analysers.parsers.dependency.input

import de.maibornwolff.codecharta.serialization.FileExtension

/**
 * The languages this parser can extract dependencies from, each backed by the [FileExtension] entries
 * that identify it. CodeCharta's enum splits along grammar lines (C apart from C++, TSX apart from
 * TypeScript) while dependency extraction treats each pair as one language, so a language here maps to
 * one or more extension entries rather than one-to-one.
 */
enum class SupportedLanguage(val displayName: String, private val fileExtensions: List<FileExtension>) {
    PHP("PHP", listOf(FileExtension.PHP)),
    C_SHARP("C#", listOf(FileExtension.CSHARP)),
    TYPESCRIPT("TypeScript", listOf(FileExtension.TYPESCRIPT, FileExtension.TSX)),
    JAVASCRIPT("JavaScript", listOf(FileExtension.JAVASCRIPT)),
    JAVA("Java", listOf(FileExtension.JAVA)),
    GO("Go", listOf(FileExtension.GO)),
    PYTHON("Python", listOf(FileExtension.PYTHON)),

    // C headers and sources go through the C++ grammar, the way DependaCharta groups them: a C++
    // translation unit routinely includes `.h` and `.c` files declaring the types it uses.
    CPP("C++", listOf(FileExtension.CPP, FileExtension.C)),
    KOTLIN("Kotlin", listOf(FileExtension.KOTLIN)),
    VUE("Vue", listOf(FileExtension.VUE)),
    DELPHI("Delphi", listOf(FileExtension.DELPHI)),
    RUST("Rust", listOf(FileExtension.RUST));

    /** Extensions without the leading dot, the form file scanning and import stripping both use. */
    val suffixes: List<String>
        get() = fileExtensions.flatMap { listOf(it.primaryExtension) + it.otherValidExtensions }.map { it.removePrefix(".") }

    companion object {
        private val bySuffix: Map<String, SupportedLanguage> by lazy {
            entries.flatMap { language -> language.suffixes.map { suffix -> suffix.lowercase() to language } }.toMap()
        }

        fun allSuffixes(): List<String> = bySuffix.keys.toList()

        fun ofFileName(fileName: String): SupportedLanguage? = bySuffix[fileName.substringAfterLast('.', "").lowercase()]
    }
}
