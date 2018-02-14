package de.maibornwolff.codecharta.importer.scmlogparser.parser.git;

import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class AuthorParserTest {

    @Test
    public void parsesAuthorWithoutEmail() {
        String author = AuthorParser.parseAuthor("Author: TheAuthor");
        assertThat(author).isEqualTo("TheAuthor");
    }

    @Test
    public void parsesAuthorFromAuthorAndEmail() {
        String author = AuthorParser.parseAuthor("Author: TheAuthor <mail@example.com>");
        assertThat(author).isEqualTo("TheAuthor");
    }
}