package de.maibornwolff.codecharta.importer.csv;

import com.google.common.collect.ImmutableMap;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;

/**
 * Created by DominikU on 07.06.2017.
 */
public class StringReplacerTest {
    @Test
    public void should_replace_nothing() throws Exception {
        String original = "testestest";
        StringReplacer replacer = StringReplacer.TRIVIAL;

        assertThat(replacer.replace(original), is(original));
    }

    @Test
    public void should_replace_specified_string() throws Exception {
        String original = "oldValue";
        String replacement = "newString";
        StringReplacer replacer = new StringReplacer(ImmutableMap.of(original,replacement));

        assertThat(replacer.replace(original), is(replacement));
    }

    @Test
    public void should_not_replace_other_string() throws Exception {
        String original = "someString";
        StringReplacer replacer = new StringReplacer(ImmutableMap.of("oldValue","newValue"));

        assertThat(replacer.replace(original), is(original));
    }

    @Test
    public void should_replaceMany() throws Exception {
        String[] original = new String[] {"this", "that", "other"};
        String[] expected = new String[] {"oooo", "iiii", "other"};
        StringReplacer replacer = new StringReplacer(ImmutableMap.of("this", "oooo", "that", "iiii", "bla", "blubb"));

        assertThat(replacer.replace(original), is(expected));
    }

}