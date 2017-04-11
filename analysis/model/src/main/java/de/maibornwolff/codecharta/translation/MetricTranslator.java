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
import de.maibornwolff.codecharta.model.Project;

import java.util.*;
import java.util.stream.Collectors;

/**
 * This class provides static methods and functions to translate metric names. This enables normalization of metric names.
 */
public final class MetricTranslator {

    /**
     * Translates metric names in a given project. The result is a translated project instance. A String -> String map
     * is used for translations. The key is the metric name that gets translated to the corresponding value.
     * @param sourceProject the project to be translated
     * @param translations a translation map
     * @return translated project
     * @throws IllegalArgumentException when translation map is invalid (has duplicate values)
     */
    public static Project translateMetrics(Project sourceProject,  Map<String, String> translations) throws IllegalArgumentException{

        // validate map
        validateTranslationMap(translations);

        // get root node
        Node sourceRoot = sourceProject.getRootNode();

        // translate root node hierarchy
        Node targetRoot = translateNodeHierarchy(sourceRoot, translations);

        // return project with translated nodes
        return new Project(sourceProject.getProjectName(), getAllNodesFromHierarchy(targetRoot), sourceProject.getApiVersion());

    }

    private static void validateTranslationMap(Map<String, String> translationMap) throws IllegalArgumentException{

        List<String> seen = new ArrayList<>();

        for (String value: translationMap.values()) {
            if(seen.contains(value)){
                throw new IllegalArgumentException("Translation map should not map distinct keys to equal values");
            } else {
                seen.add(value);
            }
        }

    }

    private static List<Node> getAllNodesFromHierarchy(Node root) {

        // resulting list
        List<Node> resultingList = new ArrayList<>();

        // add this node
        resultingList.add(root);

        // add all children node hierarchies
        root.getChildren().forEach((child)->{
            resultingList.addAll(getAllNodesFromHierarchy(child));
        });

        // return result
        return resultingList;

    }

    private static Node translateNodeHierarchy(Node source, Map<String, String> translations) {

        // new map for translated attributes of this node
        Map<String, Object> targetAttributes = new HashMap<>();

        // translate each source attribute to a target attribute
        source.getAttributes().forEach((metricName, metricValue)->{

            // translate it if there is a translation
            String translatedName = translations.getOrDefault(metricName, metricName);

            // put into target list
            targetAttributes.put(translatedName, metricValue);

        });

        // translate all children and collect them to a list with translated children. Parallelstream is usable since the order does not matter.
        List<Node> translatedChildren = source.getChildren().parallelStream().map(child -> translateNodeHierarchy(child, translations)).collect(Collectors.toList());

        // return this node
        return new Node(source.getName(), source.getType(), targetAttributes, source.getLink(), translatedChildren);

    }

}
