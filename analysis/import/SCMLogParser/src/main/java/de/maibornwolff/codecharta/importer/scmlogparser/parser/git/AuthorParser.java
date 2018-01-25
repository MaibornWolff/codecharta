package de.maibornwolff.codecharta.importer.scmlogparser.parser.git;

class AuthorParser {
    static final String AUTHOR_ROW_INDICATOR = "Author: ";
    private static final char AUTHOR_ROW_BEGIN_OF_EMAIL = '<';

    static String parseAuthor(String authorLine) {
        String authorWithEmail = authorLine.substring(AUTHOR_ROW_INDICATOR.length());
        int beginOfEmail = authorWithEmail.indexOf(AUTHOR_ROW_BEGIN_OF_EMAIL);
        if (beginOfEmail < 0) {
            return authorWithEmail;
        }
        return authorWithEmail.substring(0, beginOfEmail).trim();
    }
}