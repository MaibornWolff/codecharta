package de.maibornwolff.codecharta.importer.sonar;

import de.maibornwolff.codecharta.importer.sonar.model.Component;
import de.maibornwolff.codecharta.model.Path;
import de.maibornwolff.codecharta.nodeinserter.FileSystemPath;

public class ComponentPath implements Path<String> {

    private final Component component;

    private final FileSystemPath fileSystemPath;

    public ComponentPath(Component component) {
        this.component = component;
        if (component.getPath() != null) {
            fileSystemPath = new FileSystemPath(component.getPath().substring(0, component.getPath().lastIndexOf('/') + 1));
        } else {
            fileSystemPath = new FileSystemPath("");
        }
    }

    @Override
    public boolean isSingleElement() {
        return fileSystemPath.isSingleElement();
    }

    @Override
    public boolean isTrivial() {
        return fileSystemPath.isTrivial();
    }

    @Override
    public String head() {
        return fileSystemPath.head();
    }

    @Override
    public Path tail() {
        return fileSystemPath.tail();
    }
}
