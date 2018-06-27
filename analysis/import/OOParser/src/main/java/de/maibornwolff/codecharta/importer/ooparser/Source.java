package de.maibornwolff.codecharta.importer.ooparser;

public interface Source {
    void addTag(int lineNumber, Tags tag);

    String text();
}
