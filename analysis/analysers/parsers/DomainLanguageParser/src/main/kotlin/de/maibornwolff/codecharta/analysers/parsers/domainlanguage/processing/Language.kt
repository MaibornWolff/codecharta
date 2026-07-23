package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import de.maibornwolff.treesitter.excavationsite.api.Language as LibraryLanguage

enum class Language(val libraryLanguage: LibraryLanguage, internal val extensions: Set<String>) {
    KOTLIN(libraryLanguage = LibraryLanguage.KOTLIN, extensions = setOf("kt", "kts")),
    TYPESCRIPT(libraryLanguage = LibraryLanguage.TYPESCRIPT, extensions = setOf("ts", "tsx", "cts", "mts")),
    JAVASCRIPT(libraryLanguage = LibraryLanguage.JAVASCRIPT, extensions = setOf("js", "jsx", "mjs", "cjs")),
    JAVA(libraryLanguage = LibraryLanguage.JAVA, extensions = setOf("java")),
    PYTHON(libraryLanguage = LibraryLanguage.PYTHON, extensions = setOf("py", "pyw")),
    CSHARP(libraryLanguage = LibraryLanguage.CSHARP, extensions = setOf("cs")),
    GO(libraryLanguage = LibraryLanguage.GO, extensions = setOf("go")),
    C(libraryLanguage = LibraryLanguage.C, extensions = setOf("c", "h")),
    CPP(libraryLanguage = LibraryLanguage.CPP, extensions = setOf("cpp", "cc", "cxx", "hpp", "hxx", "h++")),
    PHP(libraryLanguage = LibraryLanguage.PHP, extensions = setOf("php", "phtml")),
    RUBY(libraryLanguage = LibraryLanguage.RUBY, extensions = setOf("rb", "rake", "gemspec")),
    SWIFT(libraryLanguage = LibraryLanguage.SWIFT, extensions = setOf("swift")),
    BASH(libraryLanguage = LibraryLanguage.BASH, extensions = setOf("sh", "bash", "zsh")),
    OBJC(libraryLanguage = LibraryLanguage.OBJECTIVE_C, extensions = setOf("m", "mm")),
    VUE(libraryLanguage = LibraryLanguage.VUE, extensions = setOf("vue")),
    ABL(libraryLanguage = LibraryLanguage.ABL, extensions = setOf("p", "cls", "w")),
    RUST(libraryLanguage = LibraryLanguage.RUST, extensions = setOf("rs"))
    ;

    companion object {
        fun fromExtension(extension: String): Language? = entries.find { language ->
            extension.lowercase() in language.extensions
        }

        fun allExtensions(): List<String> = entries.flatMap { it.extensions.toList() }
    }
}
