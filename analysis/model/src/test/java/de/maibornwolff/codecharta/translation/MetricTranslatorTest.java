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

package de.maibornwolff.codecharta.translation;

import de.maibornwolff.codecharta.model.Node;
import de.maibornwolff.codecharta.model.NodeType;
import de.maibornwolff.codecharta.model.Project;
import org.junit.Test;

import java.util.*;

public class MetricTranslatorTest {

    private Node createLeafNode(String name) {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("metricA", 0);
        metrics.put("metricB", 1);
        metrics.put("metricC", 2);
        return new Node(name, NodeType.File, metrics);
    }

    private Node createParentNode(String name, List<Node> children) {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("metricA", 0);
        metrics.put("metricB", 1);
        metrics.put("metricC", 2);
        return new Node(name, NodeType.Folder, metrics, "link does not matter", children);
    }

    private Project createSampleProject(String name) {
        Node leafA = createLeafNode("leafA");
        Node leafB = createLeafNode("leafB");
        Node leafC = createLeafNode("leafC");
        leafC.getAttributes().put("uniqueMetric", 42);
        Node parentAB = createParentNode("parentAB", new ArrayList<>(Arrays.asList(leafA, leafB)));
        Node parentABC = createParentNode("parentABC", new ArrayList<>(Arrays.asList(parentAB, leafC)));
        return new Project("A project", new ArrayList<>(Arrays.asList(parentABC, leafA, leafB, leafC, parentAB)));
    }

    private boolean hasMetric(Node node, String metric) {
        return node.getAttributes().get(metric) != null;
    }

    private boolean isOldNameGone(Project translated, String translateFrom) {

       return !hasMetric(translated.getNodes().get(0), translateFrom)
        && !hasMetric(translated.getNodes().get(0).getChildren().get(0), translateFrom)
        && !hasMetric(translated.getNodes().get(1), translateFrom);

    }

    private boolean isNewNameInserted(Project translated, String translateTo) {

        return hasMetric(translated.getNodes().get(0), translateTo)
                && hasMetric(translated.getNodes().get(0).getChildren().get(0), translateTo)
                && hasMetric(translated.getNodes().get(1), translateTo);

    }

    private Node getNodeByName(Project p, String name) {
        return p.getNodes().parallelStream().filter(node -> node.getName().equals(name)).findFirst().orElse(null);
    }

    @Test (expected = IllegalArgumentException.class)
    public void translationMapWithNonDistinctTranslationsShouldCauseException() {

        // given
        Map<String, String> translationMap = new HashMap<>();
        translationMap.put("metricB", "translatedAB");
        translationMap.put("metricA", "translatedAB");

        Project p = createSampleProject("sample");

        // when
        MetricTranslator.translateMetrics(p, translationMap);

        // expect Exception

    }

    @Test
    public void translateUniqueEntry() {

        // given
        Map<String, String> translationMap = new HashMap<>();
        translationMap.put("uniqueMetric", "something");

        Project p = createSampleProject("sample");

        // when
        Project translated = MetricTranslator.translateMetrics(p, translationMap);

        // assert
        assert(!isOldNameGone(translated, "metricB"));
        assert(!isOldNameGone(translated, "metricA"));
        assert(!isNewNameInserted(translated, "translatedB"));
        assert(!isNewNameInserted(translated, "translatedA"));

        Node unique = getNodeByName(translated, "leafC");
        assert (unique.getAttributes().get("something").equals(42));
        assert (unique.getAttributes().get("uniqueMetric") == null);

    }

    @Test
    public void translateWithInvalidTranslationEntries() {

        // given
        Map<String, String> translationMap = new HashMap<>();
        translationMap.put("metricFoo", "translatedB");
        translationMap.put("metricBar", "translatedA");


        Project p = createSampleProject("sample");

        // when
        Project translated = MetricTranslator.translateMetrics(p, translationMap);

        // assert
        assert(!isOldNameGone(translated, "metricB"));
        assert(!isOldNameGone(translated, "metricA"));
        assert(!isNewNameInserted(translated, "translatedB"));
        assert(!isNewNameInserted(translated, "translatedA"));

        Node unique = getNodeByName(translated, "leafC");
        assert (unique.getAttributes().get("uniqueMetric").equals(42));

    }

    @Test
    public void translateWithMultipleValidTranslationEntries() {

        // given
        Map<String, String> translationMap = new HashMap<>();
        translationMap.put("metricB", "translatedB");
        translationMap.put("metricA", "translatedA");


        Project p = createSampleProject("sample");

        // when
        Project translated = MetricTranslator.translateMetrics(p, translationMap);

        // assert
        assert(isOldNameGone(translated, "metricB"));
        assert(isOldNameGone(translated, "metricA"));
        assert(isNewNameInserted(translated, "translatedA"));
        assert(isNewNameInserted(translated, "translatedB"));

        Node unique = getNodeByName(translated, "leafC");
        assert (unique.getAttributes().get("uniqueMetric").equals(42));

    }

    @Test
    public void translateWithOneValidTranslationEntry() {

        // given
        Map<String, String> translationMap = new HashMap<>();
        translationMap.put("metricB", "translatedB");

        Project p = createSampleProject("sample");

        // when
        Project translated = MetricTranslator.translateMetrics(p, translationMap);

        // assert
        assert(isOldNameGone(translated, "metricB"));
        assert(isNewNameInserted(translated, "translatedB"));

        Node unique = getNodeByName(translated, "leafC");
        assert (unique.getAttributes().get("uniqueMetric").equals(42));

    }

}
