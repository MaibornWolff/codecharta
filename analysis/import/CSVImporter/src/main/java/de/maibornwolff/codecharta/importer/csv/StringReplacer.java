package de.maibornwolff.codecharta.importer.csv;

import com.google.common.collect.ImmutableMap;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

public class StringReplacer {
    public static final StringReplacer TRIVIAL = new StringReplacer(ImmutableMap.of());

    private Map<String, String> replacementMap;

    public StringReplacer(Map<String, String> replacementMap) {
        this.replacementMap = replacementMap;
    }

    public String replace(String oldString) {
        String newString = replacementMap.get(oldString);
        return newString == null ? oldString : newString;
    }

    public String[] replace(String[] oldStrings) {
        return Arrays.stream(oldStrings).map(s -> replace(s)).collect(Collectors.toList()).toArray(new String[0]);
    }
}
