package de.maibornwolff.codecharta.importer.ooparser

import org.junit.Test

import java.io.File
import java.io.IOException

import org.assertj.core.api.Assertions.assertThat

class ImportStatementParsingTest {

    @Test
    @Throws(IOException::class)
    fun parsesOneImportStatement() {
        val parser = OOParser("import foo;")

        assertThat(parser.importStatements()).isEqualTo(1)
    }

    @Test
    @Throws(IOException::class)
    fun parsesTwoImportStatementsOnSeparateLines() {
        val parser = OOParser("import foo;\nimport bar;")

        assertThat(parser.importStatements()).isEqualTo(2)
    }

    @Test
    @Throws(IOException::class)
    fun parsesThreeImportStatementsWithWhitespaceAndComments() {
        val parser = OOParser("\n   import foo;              import bar;\n//nothing to see here\nimport blub;\n/* */")

        assertThat(parser.importStatements()).isEqualTo(3)
    }

}
