package de.maibornwolff.codecharta.model;

public final class PathCreator {
    private PathCreator() {

    }

    public static Path<String> createPath(final String head) {
        return createPath(Path.TRIVIAL, head);
    }

    public static Path<String> createPath(final Path tail, final String head) {
        return new Path<String>() {
            @Override
            public String head() {
                return head;
            }

            @Override
            public Path tail() {
                return tail;
            }

            @Override
            public String toString() {
                return head + (isSingle() ? "" : " -> " + tail.toString());
            }
        };
    }
}
