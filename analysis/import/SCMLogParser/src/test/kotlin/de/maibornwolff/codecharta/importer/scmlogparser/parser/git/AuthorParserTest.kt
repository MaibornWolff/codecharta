package de.maibornwolff.codecharta.importer.scmlogparser.parser.git

import org.assertj.core.api.Assertions.assertThat
import org.junit.Test

class AuthorParserTest {

    @Test
    fun parsesAuthorWithoutEmail() {
        val author = AuthorParser.parseAuthor("Author: TheAuthor")
        assertThat(author).isEqualTo("TheAuthor")
    }

    @Test
    fun parsesAuthorFromAuthorAndEmail() {
        val author = AuthorParser.parseAuthor("Author: TheAuthor <mail@example.com>")
        assertThat(author).isEqualTo("TheAuthor")
    }
}