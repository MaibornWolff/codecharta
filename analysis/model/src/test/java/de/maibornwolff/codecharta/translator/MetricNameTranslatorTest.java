package de.maibornwolff.codecharta.translator;

import com.google.common.collect.ImmutableMap;
import org.junit.Test;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;

public class MetricNameTranslatorTest {
    @Test
    public void should_replace_nothing() throws Exception {
        String original = "testestest";
        MetricNameTranslator replacer = MetricNameTranslator.TRIVIAL;

        assertThat(replacer.translate(original), is(original));
    }

    @Test
    public void should_replace_specified_string() throws Exception {
        String original = "oldValue";
        String replacement = "newString";
        MetricNameTranslator replacer = new MetricNameTranslator(ImmutableMap.of(original, replacement));

        assertThat(replacer.translate(original), is(replacement));
    }

    @Test
    public void should_replace_other_string_with_prefixed_underscored_lowercase() throws Exception {
        String original = "some String";
        String expected = "pre_some_string";
        MetricNameTranslator replacer = new MetricNameTranslator(ImmutableMap.of("oldValue", "newValue"), "pre_");

        assertThat(replacer.translate(original), is(expected));
    }

    @Test
    public void should_replaceMany() throws Exception {
        String[] original = new String[]{"this", "that", "other"};
        String[] expected = new String[]{"oooo", "iiii", "other"};
        MetricNameTranslator replacer = new MetricNameTranslator(ImmutableMap.of("this", "oooo", "that", "iiii", "bla", "blubb"));

        assertThat(replacer.translate(original), is(expected));
    }

    @Test(expected = IllegalArgumentException.class)
    public void should_not_validate_with_same_values() {
        new MetricNameTranslator(ImmutableMap.of("this", "that", "these", "that"));
    }

    @Test
    public void should_validate_with_multiple_empty_values() {
        MetricNameTranslator translator = new MetricNameTranslator(ImmutableMap.of("this", "", "these", ""));

        assertThat(translator.translate("this"), is(""));
        assertThat(translator.translate("these"), is(""));
    }
}