package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.ResourceKeywords
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertIs
import kotlin.test.assertNull
import kotlin.test.assertTrue

class LanguageTest {
    @Test
    fun `should return KOTLIN for kt extension`() {
        // Arrange & Act
        val language = Language.fromExtension("kt")

        // Assert
        assertEquals(Language.KOTLIN, language)
    }

    @Test
    fun `should return KOTLIN for kts extension`() {
        // Arrange & Act
        val language = Language.fromExtension("kts")

        // Assert
        assertEquals(Language.KOTLIN, language)
    }

    @Test
    fun `should return TYPESCRIPT for ts and tsx extensions`() {
        // Arrange & Act
        val tsLanguage = Language.fromExtension("ts")
        val tsxLanguage = Language.fromExtension("tsx")

        // Assert
        assertEquals(Language.TYPESCRIPT, tsLanguage)
        assertEquals(Language.TYPESCRIPT, tsxLanguage)
    }

    @Test
    fun `should return JAVASCRIPT for js jsx mjs cjs extensions`() {
        // Arrange & Act
        val jsLanguage = Language.fromExtension("js")
        val jsxLanguage = Language.fromExtension("jsx")
        val mjsLanguage = Language.fromExtension("mjs")
        val cjsLanguage = Language.fromExtension("cjs")

        // Assert
        assertEquals(Language.JAVASCRIPT, jsLanguage)
        assertEquals(Language.JAVASCRIPT, jsxLanguage)
        assertEquals(Language.JAVASCRIPT, mjsLanguage)
        assertEquals(Language.JAVASCRIPT, cjsLanguage)
    }

    @Test
    fun `should return JAVA for java extension`() {
        // Arrange & Act
        val language = Language.fromExtension("java")

        // Assert
        assertEquals(Language.JAVA, language)
    }

    @Test
    fun `should return PYTHON for py and pyw extensions`() {
        // Arrange & Act
        val pyLanguage = Language.fromExtension("py")
        val pywLanguage = Language.fromExtension("pyw")

        // Assert
        assertEquals(Language.PYTHON, pyLanguage)
        assertEquals(Language.PYTHON, pywLanguage)
    }

    @Test
    fun `should return CSHARP for cs extension`() {
        // Arrange & Act
        val language = Language.fromExtension("cs")

        // Assert
        assertEquals(Language.CSHARP, language)
    }

    @Test
    fun `should return null for unsupported extensions`() {
        // Arrange & Act
        val exLanguage = Language.fromExtension("ex")
        val scalaLanguage = Language.fromExtension("scala")

        // Assert
        assertNull(exLanguage, "Elixir is not supported")
        assertNull(scalaLanguage, "Scala is not supported")
    }

    @Test
    fun `should return RUST for rs extension`() {
        // Arrange & Act
        val language = Language.fromExtension("rs")

        // Assert
        assertEquals(Language.RUST, language)
    }

    @Test
    fun `should have ResourceKeywords for RUST with Rust keywords`() {
        // Arrange & Act
        val keywords = ResourceKeywords("keywords/rust-keywords.txt")

        // Assert
        assertIs<ResourceKeywords>(keywords)
        assertTrue(keywords.getKeywords().contains("fn"))
        assertTrue(keywords.getKeywords().contains("let"))
        assertTrue(keywords.getKeywords().contains("struct"))
        assertTrue(keywords.getKeywords().contains("impl"))
    }

    @Test
    fun `should handle uppercase extensions`() {
        // Arrange & Act
        val language = Language.fromExtension("KT")

        // Assert
        assertEquals(Language.KOTLIN, language)
    }

    @Test
    fun `should have ResourceKeywords for KOTLIN with Kotlin keywords`() {
        // Arrange & Act
        val keywords = ResourceKeywords("keywords/kotlin-keywords.txt")

        // Assert
        assertIs<ResourceKeywords>(keywords)
        assertTrue(keywords.getKeywords().contains("class"))
        assertTrue(keywords.getKeywords().contains("fun"))
        assertTrue(keywords.getKeywords().contains("val"))
    }

    @Test
    fun `should have ResourceKeywords for JAVA with Java keywords`() {
        // Arrange & Act
        val keywords = ResourceKeywords("keywords/java-keywords.txt")

        // Assert
        assertIs<ResourceKeywords>(keywords)
        assertTrue(keywords.getKeywords().contains("class"))
        assertTrue(keywords.getKeywords().contains("public"))
        assertTrue(keywords.getKeywords().contains("interface"))
    }

    @Test
    fun `should have ResourceKeywords for PYTHON with Python keywords`() {
        // Arrange & Act
        val keywords = ResourceKeywords("keywords/python-keywords.txt")

        // Assert
        assertIs<ResourceKeywords>(keywords)
        assertTrue(keywords.getKeywords().contains("def"))
        assertTrue(keywords.getKeywords().contains("class"))
        assertTrue(keywords.getKeywords().contains("import"))
    }

    @Test
    fun `should have ResourceKeywords for CSHARP with C# keywords`() {
        // Arrange & Act
        val keywords = ResourceKeywords("keywords/csharp-keywords.txt")

        // Assert
        assertIs<ResourceKeywords>(keywords)
        assertTrue(keywords.getKeywords().contains("class"))
        assertTrue(keywords.getKeywords().contains("namespace"))
        assertTrue(keywords.getKeywords().contains("public"))
    }

    @Test
    fun `should return GO for go extension`() {
        // Arrange & Act
        val language = Language.fromExtension("go")

        // Assert
        assertEquals(Language.GO, language)
    }

    @Test
    fun `should have ResourceKeywords for GO with Go keywords`() {
        // Arrange & Act
        val keywords = ResourceKeywords("keywords/go-keywords.txt")

        // Assert
        assertIs<ResourceKeywords>(keywords)
        assertTrue(keywords.getKeywords().contains("func"))
        assertTrue(keywords.getKeywords().contains("package"))
    }

    @Test
    fun `should return C for c and h extensions`() {
        // Arrange & Act
        val cLanguage = Language.fromExtension("c")
        val hLanguage = Language.fromExtension("h")

        // Assert
        assertEquals(Language.C, cLanguage)
        assertEquals(Language.C, hLanguage)
    }

    @Test
    fun `should have ResourceKeywords for C with C keywords`() {
        // Arrange & Act
        val keywords = ResourceKeywords("keywords/c-keywords.txt")

        // Assert
        assertIs<ResourceKeywords>(keywords)
        assertTrue(keywords.getKeywords().contains("int"))
        assertTrue(keywords.getKeywords().contains("void"))
    }

    @Test
    fun `should return CPP for cpp cc cxx hpp hxx h++ extensions`() {
        // Arrange & Act
        val cppLanguage = Language.fromExtension("cpp")
        val ccLanguage = Language.fromExtension("cc")
        val cxxLanguage = Language.fromExtension("cxx")
        val hppLanguage = Language.fromExtension("hpp")
        val hxxLanguage = Language.fromExtension("hxx")
        val hPlusPlusLanguage = Language.fromExtension("h++")

        // Assert
        assertEquals(Language.CPP, cppLanguage)
        assertEquals(Language.CPP, ccLanguage)
        assertEquals(Language.CPP, cxxLanguage)
        assertEquals(Language.CPP, hppLanguage)
        assertEquals(Language.CPP, hxxLanguage)
        assertEquals(Language.CPP, hPlusPlusLanguage)
    }

    @Test
    fun `should have ResourceKeywords for CPP with C++ keywords`() {
        // Arrange & Act
        val keywords = ResourceKeywords("keywords/cpp-keywords.txt")

        // Assert
        assertIs<ResourceKeywords>(keywords)
        assertTrue(keywords.getKeywords().contains("class"))
        assertTrue(keywords.getKeywords().contains("template"))
    }

    @Test
    fun `should return PHP for php and phtml extensions`() {
        // Arrange & Act
        val phpLanguage = Language.fromExtension("php")
        val phtmlLanguage = Language.fromExtension("phtml")

        // Assert
        assertEquals(Language.PHP, phpLanguage)
        assertEquals(Language.PHP, phtmlLanguage)
    }

    @Test
    fun `should have ResourceKeywords for PHP with PHP keywords`() {
        // Arrange & Act
        val keywords = ResourceKeywords("keywords/php-keywords.txt")

        // Assert
        assertIs<ResourceKeywords>(keywords)
        assertTrue(keywords.getKeywords().contains("function"))
        assertTrue(keywords.getKeywords().contains("class"))
    }

    @Test
    fun `should return RUBY for rb rake gemspec extensions`() {
        // Arrange & Act
        val rbLanguage = Language.fromExtension("rb")
        val rakeLanguage = Language.fromExtension("rake")
        val gemspecLanguage = Language.fromExtension("gemspec")

        // Assert
        assertEquals(Language.RUBY, rbLanguage)
        assertEquals(Language.RUBY, rakeLanguage)
        assertEquals(Language.RUBY, gemspecLanguage)
    }

    @Test
    fun `should have ResourceKeywords for RUBY with Ruby keywords`() {
        // Arrange & Act
        val keywords = ResourceKeywords("keywords/ruby-keywords.txt")

        // Assert
        assertIs<ResourceKeywords>(keywords)
        assertTrue(keywords.getKeywords().contains("def"))
        assertTrue(keywords.getKeywords().contains("class"))
    }

    @Test
    fun `should return SWIFT for swift extension`() {
        // Arrange & Act
        val language = Language.fromExtension("swift")

        // Assert
        assertEquals(Language.SWIFT, language)
    }

    @Test
    fun `should have ResourceKeywords for SWIFT with Swift keywords`() {
        // Arrange & Act
        val keywords = ResourceKeywords("keywords/swift-keywords.txt")

        // Assert
        assertIs<ResourceKeywords>(keywords)
        assertTrue(keywords.getKeywords().contains("func"))
        assertTrue(keywords.getKeywords().contains("class"))
    }

    @Test
    fun `should return BASH for sh bash zsh extensions`() {
        // Arrange & Act
        val shLanguage = Language.fromExtension("sh")
        val bashLanguage = Language.fromExtension("bash")
        val zshLanguage = Language.fromExtension("zsh")

        // Assert
        assertEquals(Language.BASH, shLanguage)
        assertEquals(Language.BASH, bashLanguage)
        assertEquals(Language.BASH, zshLanguage)
    }

    @Test
    fun `should have ResourceKeywords for BASH with Bash keywords`() {
        // Arrange & Act
        val keywords = ResourceKeywords("keywords/bash-keywords.txt")

        // Assert
        assertIs<ResourceKeywords>(keywords)
        assertTrue(keywords.getKeywords().contains("if"))
        assertTrue(keywords.getKeywords().contains("fi"))
    }

    @Test
    fun `should return OBJC for m and mm extensions`() {
        // Arrange & Act
        val mLanguage = Language.fromExtension("m")
        val mmLanguage = Language.fromExtension("mm")

        // Assert
        assertEquals(Language.OBJC, mLanguage)
        assertEquals(Language.OBJC, mmLanguage)
    }

    @Test
    fun `should have ResourceKeywords for OBJC with Objective-C keywords`() {
        // Arrange & Act
        val keywords = ResourceKeywords("keywords/objc-keywords.txt")

        // Assert
        assertIs<ResourceKeywords>(keywords)
        assertTrue(keywords.getKeywords().isNotEmpty())
    }

    @Test
    fun `should return VUE for vue extension`() {
        // Arrange & Act
        val language = Language.fromExtension("vue")

        // Assert
        assertEquals(Language.VUE, language)
    }

    @Test
    fun `should have ResourceKeywords for VUE with Vue keywords`() {
        // Arrange & Act
        val keywords = ResourceKeywords("keywords/vue-keywords.txt")

        // Assert
        assertIs<ResourceKeywords>(keywords)
        assertTrue(keywords.getKeywords().isNotEmpty())
    }

    @Test
    fun `should have JavaScript keywords for JAVASCRIPT without TypeScript-only keywords`() {
        // Arrange & Act
        val jsKeywords = ResourceKeywords("keywords/javascript-keywords.txt")
        val tsKeywords = ResourceKeywords("keywords/typescript-keywords.txt")

        // Assert
        assertIs<ResourceKeywords>(jsKeywords)
        assertIs<ResourceKeywords>(tsKeywords)

        assertTrue(jsKeywords.getKeywords().contains("function"))
        assertTrue(jsKeywords.getKeywords().contains("const"))

        assertTrue(tsKeywords.getKeywords().contains("interface"))
        assertTrue(tsKeywords.getKeywords().contains("type"))

        assertTrue(!jsKeywords.getKeywords().contains("interface"))
        assertTrue(!jsKeywords.getKeywords().contains("type"))
    }

    @Test
    fun `should return ABL for p cls w extensions`() {
        // Arrange & Act
        val pLanguage = Language.fromExtension("p")
        val clsLanguage = Language.fromExtension("cls")
        val wLanguage = Language.fromExtension("w")

        // Assert
        assertEquals(Language.ABL, pLanguage)
        assertEquals(Language.ABL, clsLanguage)
        assertEquals(Language.ABL, wLanguage)
    }

    @Test
    fun `should handle uppercase ABL extensions`() {
        // Arrange & Act
        val pLanguage = Language.fromExtension("P")
        val clsLanguage = Language.fromExtension("CLS")
        val wLanguage = Language.fromExtension("W")

        // Assert
        assertEquals(Language.ABL, pLanguage)
        assertEquals(Language.ABL, clsLanguage)
        assertEquals(Language.ABL, wLanguage)
    }

    @Test
    fun `should have ResourceKeywords for ABL with Progress framework terms`() {
        // Arrange & Act
        val keywords = ResourceKeywords("keywords/abl-keywords.txt")

        // Assert
        assertIs<ResourceKeywords>(keywords)
        // Lowercased on load, because that is the form SplitStage produces and compares against.
        assertTrue(keywords.getKeywords().contains("progress"))
        assertTrue(keywords.getKeywords().contains("jsonobject"))
        assertTrue(keywords.getKeywords().contains("apperror"))
    }

    @Test
    fun `should have ABL system handles in keyword list`() {
        // Arrange & Act
        val keywords = ResourceKeywords("keywords/abl-keywords.txt")

        // Assert
        assertIs<ResourceKeywords>(keywords)
        assertTrue(keywords.getKeywords().contains("session"))
        assertTrue(keywords.getKeywords().contains("this-object"))
        assertTrue(keywords.getKeywords().contains("this-procedure"))
    }
}
