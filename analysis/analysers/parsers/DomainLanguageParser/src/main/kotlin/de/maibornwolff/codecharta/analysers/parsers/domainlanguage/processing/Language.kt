package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.LanguageKeywords
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.ResourceKeywords
import de.maibornwolff.treesitter.excavationsite.api.Language as LibraryLanguage

/**
 * Supported programming languages for source code analysis.
 *
 * Uses tree-sitter AST parsing via TreeSitterLibrary for extraction.
 */
enum class Language(val keywordFilter: LanguageKeywords, val libraryLanguage: LibraryLanguage, private val extensions: Set<String>) {
    KOTLIN(
        keywordFilter = ResourceKeywords("keywords/kotlin-keywords.txt"),
        libraryLanguage = LibraryLanguage.KOTLIN,
        extensions = setOf("kt", "kts")
    ),
    TYPESCRIPT(
        keywordFilter = ResourceKeywords("keywords/typescript-keywords.txt"),
        libraryLanguage = LibraryLanguage.TYPESCRIPT,
        extensions = setOf("ts", "tsx", "cts", "mts")
    ),
    JAVASCRIPT(
        keywordFilter = ResourceKeywords("keywords/javascript-keywords.txt"),
        libraryLanguage = LibraryLanguage.JAVASCRIPT,
        extensions = setOf("js", "jsx", "mjs", "cjs")
    ),
    JAVA(
        keywordFilter = ResourceKeywords("keywords/java-keywords.txt"),
        libraryLanguage = LibraryLanguage.JAVA,
        extensions = setOf("java")
    ),
    PYTHON(
        keywordFilter = ResourceKeywords("keywords/python-keywords.txt"),
        libraryLanguage = LibraryLanguage.PYTHON,
        extensions = setOf("py", "pyw")
    ),
    CSHARP(
        keywordFilter = ResourceKeywords("keywords/csharp-keywords.txt"),
        libraryLanguage = LibraryLanguage.CSHARP,
        extensions = setOf("cs")
    ),
    GO(
        keywordFilter = ResourceKeywords("keywords/go-keywords.txt"),
        libraryLanguage = LibraryLanguage.GO,
        extensions = setOf("go")
    ),
    C(
        keywordFilter = ResourceKeywords("keywords/c-keywords.txt"),
        libraryLanguage = LibraryLanguage.C,
        extensions = setOf("c", "h")
    ),
    CPP(
        keywordFilter = ResourceKeywords("keywords/cpp-keywords.txt"),
        libraryLanguage = LibraryLanguage.CPP,
        extensions = setOf("cpp", "cc", "cxx", "hpp", "hxx", "h++")
    ),
    PHP(
        keywordFilter = ResourceKeywords("keywords/php-keywords.txt"),
        libraryLanguage = LibraryLanguage.PHP,
        extensions = setOf("php", "phtml")
    ),
    RUBY(
        keywordFilter = ResourceKeywords("keywords/ruby-keywords.txt"),
        libraryLanguage = LibraryLanguage.RUBY,
        extensions = setOf("rb", "rake", "gemspec")
    ),
    SWIFT(
        keywordFilter = ResourceKeywords("keywords/swift-keywords.txt"),
        libraryLanguage = LibraryLanguage.SWIFT,
        extensions = setOf("swift")
    ),
    BASH(
        keywordFilter = ResourceKeywords("keywords/bash-keywords.txt"),
        libraryLanguage = LibraryLanguage.BASH,
        extensions = setOf("sh", "bash", "zsh")
    ),
    OBJC(
        keywordFilter = ResourceKeywords("keywords/objc-keywords.txt"),
        libraryLanguage = LibraryLanguage.OBJECTIVE_C,
        extensions = setOf("m", "mm")
    ),
    VUE(
        keywordFilter = ResourceKeywords("keywords/vue-keywords.txt"),
        libraryLanguage = LibraryLanguage.VUE,
        extensions = setOf("vue")
    ),
    ABL(
        keywordFilter = ResourceKeywords("keywords/abl-keywords.txt"),
        libraryLanguage = LibraryLanguage.ABL,
        extensions = setOf("p", "cls", "w")
    ),
    RUST(
        keywordFilter = ResourceKeywords("keywords/rust-keywords.txt"),
        libraryLanguage = LibraryLanguage.RUST,
        extensions = setOf("rs")
    )
    ;

    companion object {
        fun fromExtension(extension: String): Language? = entries.find { language ->
            extension.lowercase() in language.extensions
        }

        fun allExtensions(): List<String> = entries.flatMap { it.extensions.toList() }
    }
}
