/*
 * Copyright (c) 2017, MaibornWolff GmbH
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of  nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

package de.maibornwolff.codecharta.translator;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * This class provides methods to translate metric names. This enables normalization of metric names.
 */
public class MetricNameTranslator {
    public static final MetricNameTranslator TRIVIAL = new MetricNameTranslator() {
        @Override
        public String translate(String oldMetricName) {
            return oldMetricName;
        }

        @Override
        public String[] translate(String[] oldMetricName) {
            return oldMetricName;
        }
    };

    private String prefix;

    private Map<String, String> translationMap;

    private MetricNameTranslator() {
    }

    /**
     * @param translationMap a translation map with unique values
     */
    public MetricNameTranslator(Map<String, String> translationMap) {
        this(translationMap, "");
    }

    /**
     * @param translationMap a translation map with unique values
     * @param prefix         a prefix for all Strings not contained in translation map
     */
    public MetricNameTranslator(Map<String, String> translationMap, String prefix) {
        this.translationMap = translationMap;
        this.prefix = prefix;
        validate();
    }

    public String translate(String oldMetricName) {
        String newMetricName;
        if (translationMap.containsKey(oldMetricName)) {
            newMetricName = translationMap.get(oldMetricName);
        } else {
            newMetricName = prefix + oldMetricName.toLowerCase().replace(' ', '_');
        }
        return newMetricName;
    }

    public String[] translate(String[] oldMetricName) {
        return Arrays.stream(oldMetricName).map(this::translate).collect(Collectors.toList()).toArray(new String[0]);
    }

    private void validate() {
        List<String> seen = new ArrayList<>();

        for (String value : translationMap.values()) {
            if (!value.isEmpty() && seen.contains(value)) {
                throw new IllegalArgumentException("Replacement map should not map distinct keys to equal values, e.g. " + value);
            } else {
                seen.add(value);
            }
        }
    }
}
