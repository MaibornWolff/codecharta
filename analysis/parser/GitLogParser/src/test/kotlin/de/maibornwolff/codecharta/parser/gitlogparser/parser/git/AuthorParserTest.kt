package de.maibornwolff.codecharta.parser.gitlogparser.parser.git

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

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
