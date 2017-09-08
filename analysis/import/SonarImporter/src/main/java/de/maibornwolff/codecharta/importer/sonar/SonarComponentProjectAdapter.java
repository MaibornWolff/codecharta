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

package de.maibornwolff.codecharta.importer.sonar;

import de.maibornwolff.codecharta.importer.sonar.model.Component;
import de.maibornwolff.codecharta.importer.sonar.model.ComponentMap;
import de.maibornwolff.codecharta.importer.sonar.model.Measure;
import de.maibornwolff.codecharta.importer.sonar.model.Qualifier;
import de.maibornwolff.codecharta.model.*;
import de.maibornwolff.codecharta.nodeinserter.NodeInserter;
import de.maibornwolff.codecharta.translator.MetricNameTranslator;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class SonarComponentProjectAdapter extends Project {
    private final MetricNameTranslator translator;

    public SonarComponentProjectAdapter(String name) {
        this(name, SonarCodeURLLinker.NULL, MetricNameTranslator.TRIVIAL, false);
    }

    private final SonarCodeURLLinker sonarCodeURLLinker;
    private final boolean usePath;

    public SonarComponentProjectAdapter(String name, SonarCodeURLLinker sonarCodeURLLinker, MetricNameTranslator translator, boolean usePath) {
        super(name);
        this.sonarCodeURLLinker = sonarCodeURLLinker;
        this.usePath = usePath;
        this.getNodes().add(new Node("root", NodeType.Folder));
        this.translator = translator;
    }

    public void addComponentMapsAsNodes(ComponentMap components) {
        components.getComponentStream()
                .sorted(Comparator.comparing(Component::getPath))
                .forEach(this::addComponentAsNode);
    }

    public void addComponentAsNode(Component component) {
        Node node = new Node(
                createNodeName(component),
                createNodeTypeFromQualifier(component.getQualifier()), createAttributes(component.getMeasures()), createLink(component));
        NodeInserter.insertByPath(this, createParentPath(component), node);
    }

    private Map<String, Object> createAttributes(List<Measure> measures) {
        return measures.stream()
                .filter(this::isMeasureConvertible)
                .collect(Collectors.toMap(this::convertMetricName, this::convertMetricValue));
    }

    private String convertMetricName(Measure measure) {
        return translator.translate(measure.getMetric());
    }

    private String createLink(Component component) {
        return sonarCodeURLLinker.createUrlString(component);
    }

    private Object convertMetricValue(Measure measure) {
        return Double.parseDouble(measure.getValue());
    }

    private boolean isMeasureConvertible(Measure measure) {
        if (measure.getValue() != null) {
            try {
                Double.parseDouble(measure.getValue());
                return true;
            } catch (NumberFormatException nfe) {
                return false;
            }
        }

        return false;

    }

    private NodeType createNodeTypeFromQualifier(Qualifier qualifier) {
        switch (qualifier) {
            case FIL:
            case UTS:
                return NodeType.File;
            default:
                return NodeType.Folder;
        }
    }

    /**
     * creates a node name from the component. Tries the create it from the path, the name or id (in this priority order).
     *
     * @param component the given component
     * @return node name for this component
     */
    private String createNodeName(Component component) {
        if (!usePath && component.getKey() != null) {
            return component.getKey().substring(component.getKey().lastIndexOf('/') + 1);
        } else if (usePath && component.getPath() != null) {
            return component.getPath().substring(component.getPath().lastIndexOf('/') + 1);
        } else if (component.getName() != null) {
            return component.getName();
        } else {
            return component.getId();
        }

    }

    /**
     * creates a parent path for the given node. If a path exists then a correct parent path will be created. If there
     * is no parent path this function assumes it at FS root for the sake of initialized values.
     *
     * @param component given component
     * @return fs path of components parent
     */
    private Path createParentPath(Component component) {
        if (!usePath && component.getKey() != null) {
            String extendedPath = component.getKey().replace(':', '/');
            return PathFactory.fromFileSystemPath(extendedPath.substring(0, extendedPath.lastIndexOf('/') + 1));
        } else if (usePath && component.getPath() != null) {
            String path = component.getPath();
            return PathFactory.fromFileSystemPath(path.substring(0, path.lastIndexOf('/') + 1));
        } else {
            return Path.trivialPath();
        }
    }
}
