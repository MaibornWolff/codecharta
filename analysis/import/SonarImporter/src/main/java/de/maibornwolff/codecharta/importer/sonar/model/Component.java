package de.maibornwolff.codecharta.importer.sonar.model;

import java.util.List;

public class Component {
    private final String id;

    private final String key;

    private final String name;

    private final String path;

    private final Qualifier qualifier;

    private final List<Measure> measures;

    public Component(String id, String key, String name, String path, Qualifier qualifier, List<Measure> measures) {
        this.id = id;
        this.key = key;
        this.name = name;
        this.path = path;
        this.qualifier = qualifier;
        this.measures = measures;
    }

    public String getId() {
        return id;
    }

    public String getKey() {
        return key;
    }

    public String getName() {
        return name;
    }

    public String getPath() {
        return path;
    }

    public Qualifier getQualifier() {
        return qualifier;
    }

    public List<Measure> getMeasures() {
        return measures;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Component component = (Component) o;

        if (id != null ? !id.equals(component.id) : component.id != null) return false;
        if (key != null ? !key.equals(component.key) : component.key != null) return false;
        if (name != null ? !name.equals(component.name) : component.name != null) return false;
        if (path != null ? !path.equals(component.path) : component.path != null) return false;
        if (qualifier != component.qualifier) return false;
        return measures != null ? measures.equals(component.measures) : component.measures == null;
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (key != null ? key.hashCode() : 0);
        result = 31 * result + (name != null ? name.hashCode() : 0);
        result = 31 * result + (path != null ? path.hashCode() : 0);
        result = 31 * result + (qualifier != null ? qualifier.hashCode() : 0);
        result = 31 * result + (measures != null ? measures.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "Component{" +
                "id='" + id + '\'' +
                ", key='" + key + '\'' +
                ", name='" + name + '\'' +
                ", path='" + path + '\'' +
                ", qualifier=" + qualifier +
                ", measures=" + measures +
                '}';
    }
}
