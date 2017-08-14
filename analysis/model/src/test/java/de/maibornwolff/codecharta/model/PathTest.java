package de.maibornwolff.codecharta.model;

import org.hamcrest.Matchers;
import org.junit.Test;

import java.util.Arrays;

import static de.maibornwolff.codecharta.model.PathMatcher.matchesPath;
import static junit.framework.TestCase.assertFalse;
import static org.hamcrest.CoreMatchers.not;
import static org.hamcrest.MatcherAssert.assertThat;

public class PathTest {
    @Test
    public void trivial_path_should_be_equalTo_trivial_path() {
        assertThat(Path.TRIVIAL, matchesPath(Path.TRIVIAL));
    }

    @Test
    public void nonTrivial_path_should_not_be_equalTo_nonTrivial_path() {
        Path nonTrivialPath = new Path(Arrays.asList("bla"));
        assertThat(Path.TRIVIAL, not(matchesPath(nonTrivialPath)));
        assertThat(nonTrivialPath, not(matchesPath(Path.TRIVIAL)));
    }

    @Test
    public void simple_path_should_be_equalTo_simple_path_iff_head_equal() {
        Path nonTrivialPath = new Path(Arrays.asList("bla"));
        Path anotherNonTrivialPath = new Path(Arrays.asList("blubb"));
        assertThat(nonTrivialPath, matchesPath(nonTrivialPath));
        assertThat(nonTrivialPath, not(matchesPath(anotherNonTrivialPath)));
        assertThat(anotherNonTrivialPath, not(matchesPath(nonTrivialPath)));
    }

    @Test
    public void concat_with_trivial_path_should_return_concatinated_path() {
        Path nonTrivialPath = new Path(Arrays.asList("bla"));
        assertThat(Path.TRIVIAL.concat(Path.TRIVIAL), matchesPath(Path.TRIVIAL));
        assertThat(nonTrivialPath.concat(Path.TRIVIAL), matchesPath(nonTrivialPath));
        assertThat(Path.TRIVIAL.concat(nonTrivialPath), matchesPath(nonTrivialPath));
    }

    @Test
    public void complex_path_should_equal_itself() {
        Path firstPath = new Path(Arrays.asList("first"));
        Path expectedPath = new Path(Arrays.asList("second", firstPath.head()));

        assertThat(expectedPath, matchesPath(expectedPath));
    }

    @Test
    public void concat_with_two_simple_paths_should_return_concatinated_path() {
        // given
        Path firstPath = new Path(Arrays.asList("first"));
        Path secondPath = new Path(Arrays.asList("second"));

        // when
        Path concatinatedPath = firstPath.concat(secondPath);

        // then
        Path expectedPath = new Path(Arrays.asList("first", secondPath.head()));
        assertThat(concatinatedPath, not(matchesPath(firstPath)));
        assertThat(concatinatedPath, not(matchesPath(secondPath)));
        assertFalse(concatinatedPath.isSingle());
        assertFalse(concatinatedPath.isTrivial());
        assertThat(concatinatedPath.head(), Matchers.is("first"));
        assertThat(concatinatedPath.tail(), matchesPath(secondPath));
        assertThat(concatinatedPath, matchesPath(expectedPath));
    }


}