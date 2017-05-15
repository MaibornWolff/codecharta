package de.maibornwolff.codecharta.importer.sonar;

import de.maibornwolff.codecharta.importer.sonar.model.Component;
import de.maibornwolff.codecharta.importer.sonar.model.Measure;
import de.maibornwolff.codecharta.importer.sonar.model.Qualifier;
import de.maibornwolff.codecharta.model.Node;
import de.maibornwolff.codecharta.model.NodeType;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.nodeinserter.FileSystemPath;
import de.maibornwolff.codecharta.nodeinserter.NodeInserter;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class SonarComponentProjectAdapter extends Project {

    public SonarComponentProjectAdapter(String name) {
        super(name);
        this.getNodes().add(new Node("root", NodeType.Folder));
    }

    public void addComponentAsNode(Component component) {
        Node node = new Node(createNodeName(component), createNodeTypeFromQualifier(component.getQualifier()), createAttributes(component.getMeasures()));
        NodeInserter.insertByPath(this, createParentPath(component), node);
    }

    private Map<String, Object> createAttributes(List<Measure> measures) {
        return measures.stream()
                .filter(this::isMeasureConvertible)
                .collect(Collectors.toMap(Measure::getMetric, this::convertMetricValue));
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
    private FileSystemPath createParentPath(Component component) {
        if (component.getPath() != null) {
            return new FileSystemPath(component.getPath().substring(0, component.getPath().lastIndexOf('/') + 1));
        } else {
            return new FileSystemPath("");
        }
    }
}
