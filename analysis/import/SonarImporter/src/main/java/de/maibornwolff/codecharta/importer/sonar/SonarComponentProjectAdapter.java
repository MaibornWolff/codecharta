package de.maibornwolff.codecharta.importer.sonar;

import de.maibornwolff.codecharta.importer.sonar.model.Component;
import de.maibornwolff.codecharta.importer.sonar.model.ComponentMap;
import de.maibornwolff.codecharta.importer.sonar.model.Measure;
import de.maibornwolff.codecharta.importer.sonar.model.Qualifier;
import de.maibornwolff.codecharta.model.Node;
import de.maibornwolff.codecharta.model.NodeType;
import de.maibornwolff.codecharta.model.Path;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.nodeinserter.NodeInserter;
import de.maibornwolff.codecharta.translator.MetricNameTranslator;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class SonarComponentProjectAdapter extends Project {
    private final MetricNameTranslator translator;

    public SonarComponentProjectAdapter(String name) {
        this(name, SonarCodeURLLinker.NULL, MetricNameTranslator.TRIVIAL);
    }

    private final SonarCodeURLLinker sonarCodeURLLinker;

    public SonarComponentProjectAdapter(String name, SonarCodeURLLinker sonarCodeURLLinker, MetricNameTranslator translator) {
        super(name);
        this.sonarCodeURLLinker = sonarCodeURLLinker;
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
    private static String createNodeName(Component component) {
        if (component.getPath() != null) {
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
    private Path<String> createParentPath(Component component) {
        return new ComponentPath(component);
    }
}
