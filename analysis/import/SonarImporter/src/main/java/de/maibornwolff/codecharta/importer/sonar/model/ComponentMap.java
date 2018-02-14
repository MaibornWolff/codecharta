package de.maibornwolff.codecharta.importer.sonar.model;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Stream;

public class ComponentMap {
    private final Map<String, Component> components = new HashMap<>();

    public void updateComponent(Component component) {
        if (components.containsKey(component.getKey())) {
            Component updateableComponent = components.get(component.getKey());
            updateableComponent.getMeasures().addAll(component.getMeasures());
        } else {
            components.put(component.getKey(), component);
        }
    }

    public Stream<Component> getComponentStream() {
        return components.values().stream();
    }

}
