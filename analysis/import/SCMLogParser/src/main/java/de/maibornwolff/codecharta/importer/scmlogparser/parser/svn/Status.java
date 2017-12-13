package de.maibornwolff.codecharta.importer.scmlogparser.parser.svn;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * SVN Modification Status
 * <p>
 * see "action" char at http://svn.apache.org/viewvc/subversion/trunk/subversion/include/svn_types.h?view=markup&pathrev=1751399#l835
 */
enum Status {
    ADD('A'),
    DELETE('D'),
    MODIFY('M'),
    REPLACE('R');

    public static final List<Character> ALL_STATUS_LETTERS =
            Stream.of(Status.class.getEnumConstants())
                    .map(Status::statusLetter)
                    .collect(Collectors.toList());

    private final char letter;

    Status(char t) {
        letter = t;
    }

    public char statusLetter() {
        return letter;
    }
}
