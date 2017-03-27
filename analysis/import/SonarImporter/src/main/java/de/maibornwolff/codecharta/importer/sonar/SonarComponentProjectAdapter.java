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
        Node node = new Node(createNodeName(component.getPath()), createNodeTypeFromQualifier(component.getQualifier()), createAttributes(component.getMeasures()));
        NodeInserter.insertByPath(this, createParentPath(component.getPath()), node);
    }

    private Map<String, Object> createAttributes(List<Measure> measures) {
        return measures.stream()
                .filter(this::isMeasureConvertible)
                .collect(Collectors.toMap(measure -> measure.getMetric(), this::convertMetricValue));
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

    private static String createNodeName(String path) {
        return path.substring(path.lastIndexOf('/') + 1);
    }

    private FileSystemPath createParentPath(String lname) {
        return new FileSystemPath(lname.substring(0, lname.lastIndexOf('/') + 1));
    }
}
