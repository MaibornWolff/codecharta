package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.LanguageKeywords
import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.ResourceKeywords
import de.maibornwolff.treesitter.excavationsite.api.Language as LibraryLanguage

enum class Language(val libraryLanguage: LibraryLanguage, internal val extensions: Set<String>, private val keywordResource: String) {
    KOTLIN(LibraryLanguage.KOTLIN, setOf("kt", "kts"), "keywords/kotlin-keywords.txt"),
    TYPESCRIPT(LibraryLanguage.TYPESCRIPT, setOf("ts", "tsx", "cts", "mts"), "keywords/typescript-keywords.txt"),
    JAVASCRIPT(LibraryLanguage.JAVASCRIPT, setOf("js", "jsx", "mjs", "cjs"), "keywords/javascript-keywords.txt"),
    JAVA(LibraryLanguage.JAVA, setOf("java"), "keywords/java-keywords.txt"),
    PYTHON(LibraryLanguage.PYTHON, setOf("py", "pyw"), "keywords/python-keywords.txt"),
    CSHARP(LibraryLanguage.CSHARP, setOf("cs"), "keywords/csharp-keywords.txt"),
    GO(LibraryLanguage.GO, setOf("go"), "keywords/go-keywords.txt"),
    C(LibraryLanguage.C, setOf("c", "h"), "keywords/c-keywords.txt"),
    CPP(LibraryLanguage.CPP, setOf("cpp", "cc", "cxx", "hpp", "hxx", "h++"), "keywords/cpp-keywords.txt"),
    PHP(LibraryLanguage.PHP, setOf("php", "phtml"), "keywords/php-keywords.txt"),
    RUBY(LibraryLanguage.RUBY, setOf("rb", "rake", "gemspec"), "keywords/ruby-keywords.txt"),
    SWIFT(LibraryLanguage.SWIFT, setOf("swift"), "keywords/swift-keywords.txt"),
    BASH(LibraryLanguage.BASH, setOf("sh", "bash", "zsh"), "keywords/bash-keywords.txt"),
    OBJC(LibraryLanguage.OBJECTIVE_C, setOf("m", "mm"), "keywords/objc-keywords.txt"),
    VUE(LibraryLanguage.VUE, setOf("vue"), "keywords/vue-keywords.txt"),
    ABL(LibraryLanguage.ABL, setOf("p", "cls", "w"), "keywords/abl-keywords.txt"),
    RUST(LibraryLanguage.RUST, setOf("rs"), "keywords/rust-keywords.txt")
    ;

    // Scoped per language rather than merged into one global set: a Kotlin file must not lose `func`
    // to Go's keyword list, nor a Ruby file `end` to ABL's.
    val keywords: LanguageKeywords by lazy { ResourceKeywords(keywordResource) }

    companion object {
        fun fromExtension(extension: String): Language? = entries.find { language ->
            extension.lowercase() in language.extensions
        }

        fun allExtensions(): List<String> = entries.flatMap { it.extensions.toList() }
    }
}
