package de.maibornwolff.codecharta.importer.sonar.model;

import java.util.ArrayList;
import java.util.List;

public class Measures {
    private PagingInfo paging;


    private List<Component> components = new ArrayList<>();

    public Measures() {
        super();
    }

    public Measures(PagingInfo paging, List<Component> components) {
        this.paging = paging;
        this.components = components;
    }

    public PagingInfo getPaging() {
        return paging;
    }

    public List<Component> getComponents() {
        return components;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Measures measures = (Measures) o;

        if (paging != null ? !paging.equals(measures.paging) : measures.paging != null) return false;
        return components != null ? components.equals(measures.components) : measures.components == null;
    }

    @Override
    public int hashCode() {
        int result = paging != null ? paging.hashCode() : 0;
        result = 31 * result + (components != null ? components.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "Measures{" +
                "paging=" + paging +
                ", components=" + components +
                '}';
    }
}
