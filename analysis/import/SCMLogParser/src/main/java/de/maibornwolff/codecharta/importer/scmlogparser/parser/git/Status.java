package de.maibornwolff.codecharta.importer.scmlogparser.parser.git;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Git Modification Status
 * <p>
 * see "diff-raw status letters" at https://github.com/git/git/blob/35f6318d44379452d8d33e880d8df0267b4a0cd0/diff.h#L326
 */
enum Status {
    ADDED('A'),
    COPIED('C'),
    DELETED('D'),
    MODIFIED('M'),
    RENAMED('R'),
    TYPE_CHANGED('T'),
    UNKNOWN('X'),
    UNMERGED('U');

    public static final List<Character> ALL_STATUS_LETTERS =
            Stream.of(Status.class.getEnumConstants())
                    .map(Status::statusLetter)
                    .collect(Collectors.toList());

    private final char letter;

    Status(char t) {
        letter = t;
    }

    public static Status byCharacter(char c) {
        return Stream.of(Status.class.getEnumConstants())
                .filter(status -> status.letter == c)
                .findFirst()
                .orElse(UNKNOWN);
    }

    public char statusLetter() {
        return letter;
    }
}
