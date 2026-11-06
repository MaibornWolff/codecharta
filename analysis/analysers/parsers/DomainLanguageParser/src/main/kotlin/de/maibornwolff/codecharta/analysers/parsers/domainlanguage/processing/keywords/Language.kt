package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords

import de.maibornwolff.codecharta.util.AccessQueryFiles
import de.maibornwolff.codecharta.util.FileExtension
import java.io.File
import de.maibornwolff.treesitter.excavationsite.api.Language as LibraryLanguage

private fun suffixesOf(fileExtension: FileExtension): Set<String> =
    (setOf(fileExtension.primaryExtension) + fileExtension.otherValidExtensions).map { it.removePrefix(".") }.toSet()

enum class Language(
    val libraryLanguage: LibraryLanguage,
    internal val extensions: Set<String>,
    private val keywordResources: List<String>
) {
    KOTLIN(LibraryLanguage.KOTLIN, setOf("kt", "kts"), listOf("keywords/kotlin-keywords.txt")),
    TYPESCRIPT(LibraryLanguage.TYPESCRIPT, setOf("ts", "tsx", "cts", "mts"), listOf("keywords/typescript-keywords.txt")),
    JAVASCRIPT(LibraryLanguage.JAVASCRIPT, setOf("js", "jsx", "mjs", "cjs"), listOf("keywords/javascript-keywords.txt")),
    JAVA(LibraryLanguage.JAVA, setOf("java"), listOf("keywords/java-keywords.txt")),
    PYTHON(LibraryLanguage.PYTHON, setOf("py", "pyw"), listOf("keywords/python-keywords.txt")),
    CSHARP(LibraryLanguage.CSHARP, setOf("cs"), listOf("keywords/csharp-keywords.txt")),
    GO(LibraryLanguage.GO, setOf("go"), listOf("keywords/go-keywords.txt")),
    C(LibraryLanguage.C, setOf("c", "h"), listOf("keywords/c-keywords.txt")),
    CPP(LibraryLanguage.CPP, setOf("cpp", "cc", "cxx", "hpp", "hxx", "h++"), listOf("keywords/cpp-keywords.txt")),
    PHP(LibraryLanguage.PHP, setOf("php", "phtml"), listOf("keywords/php-keywords.txt")),
    RUBY(LibraryLanguage.RUBY, setOf("rb", "rake", "gemspec"), listOf("keywords/ruby-keywords.txt")),
    SWIFT(LibraryLanguage.SWIFT, setOf("swift"), listOf("keywords/swift-keywords.txt")),
    BASH(LibraryLanguage.BASH, setOf("sh", "bash", "zsh"), listOf("keywords/bash-keywords.txt")),
    OBJC(LibraryLanguage.OBJECTIVE_C, setOf("m", "mm"), listOf("keywords/objc-keywords.txt")),
    VUE(LibraryLanguage.VUE, setOf("vue"), listOf("keywords/vue-keywords.txt")),
    RUST(LibraryLanguage.RUST, setOf("rs"), listOf("keywords/rust-keywords.txt")),
    ANGULAR(LibraryLanguage.ANGULAR, setOf("html"), listOf("keywords/angular-template-keywords.txt")),
    SQL(LibraryLanguage.SQL, suffixesOf(FileExtension.SQL), listOf("keywords/sql-keywords.txt")),
    VBA(LibraryLanguage.VBA, suffixesOf(FileExtension.VBA), listOf("keywords/vba-keywords.txt")),
    VB6(LibraryLanguage.VB6, suffixesOf(FileExtension.VB6), listOf("keywords/vba-keywords.txt")),

    // The names of a form's controls carry the prefixes of VBA code (`txtOrderDate`, `cboCustomer`)
    ACCESS_LAYOUT(LibraryLanguage.ACCESS_LAYOUT, suffixesOf(FileExtension.ACCESS_LAYOUT), listOf("keywords/vba-keywords.txt")),

    // A macro names the forms and reports it opens, with the same prefixes (`frmOrders`, `rptInvoice`)
    ACCESS_MACRO(LibraryLanguage.ACCESS_MACRO, suffixesOf(FileExtension.ACCESS_MACRO), listOf("keywords/vba-keywords.txt")),

    // The SQL of an Access query names its objects with the prefixes of VBA code (`qryOrders`, `tblCustomers`)
    ACCESS_QUERY(LibraryLanguage.SQL, emptySet(), listOf("keywords/sql-keywords.txt", "keywords/vba-keywords.txt"))
    ;

    // Scoped per language rather than merged into one global set: a Kotlin file must not lose `func`
    // to Go's keyword list, nor `end` to Ruby's.
    val keywords: LanguageKeywords by lazy {
        val resources = keywordResources.map { ResourceKeywords(it) }
        LanguageKeywords { resources.flatMapTo(HashSet()) { it.getKeywords() } }
    }

    companion object {
        fun fromExtension(extension: String): Language? = entries.find { language ->
            extension.lowercase() in language.extensions
        }

        /** The language of [file] by its ending; a `.sql` file in a folder named `queries` is an Access query. */
        fun of(file: File): Language? {
            val language = fromExtension(file.extension)
            return if (language == SQL && AccessQueryFiles.isQueryFile(file.path)) ACCESS_QUERY else language
        }

        fun allExtensions(): List<String> = entries.flatMap { it.extensions.toList() }

        fun ofLibraryLanguage(libraryLanguage: LibraryLanguage): Language? = entries.find { it.libraryLanguage == libraryLanguage }
    }
}
