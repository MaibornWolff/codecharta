package de.maibornwolff.codecharta.model;

import org.hamcrest.BaseMatcher;
import org.hamcrest.Description;
import org.hamcrest.Matcher;

import java.util.List;

public class PathMatcher {

    public static Matcher<Path> matchesPath(final Path expectedPath) {
        return new BaseMatcher<Path>() {

            @Override
            public void describeTo(final Description description) {
                description.appendText("should be ").appendValue(expectedPath);
            }

            @Override
            public boolean matches(final Object item) {
                final Path path = (Path) item;
                return path.equalsTo(expectedPath);
            }
        };
    }

    public static Matcher<List<Path>> containsPath(final Path expectedPath) {
        return new BaseMatcher<List<Path>>() {

            @Override
            public void describeTo(final Description description) {
                description.appendText("does not contain ").appendValue(expectedPath);
            }

            @Override
            public boolean matches(final Object item) {
                final List<Path> paths = (List<Path>) item;
                for(Path path: paths){
                    if(path.equalsTo(expectedPath)) {
                        return true;
                    }
                }
                return false;
            }
        };
    }
}
