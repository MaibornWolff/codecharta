package de.maibornwolff.codecharta.importer.scmlogparser;

import de.maibornwolff.codecharta.model.PathFactory;
import de.maibornwolff.codecharta.model.Node;
import de.maibornwolff.codecharta.model.NodeType;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.model.input.VersionControlledFile;
import de.maibornwolff.codecharta.nodeinserter.NodeInserter;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public final class ProjectConverter {

    private ProjectConverter() {
        // utility class
    }

    public static Project convert(String projectName, List<VersionControlledFile> versionControlledFiles) {
        Project project = new Project(projectName);
        versionControlledFiles.forEach(vcFile -> ProjectConverter.addVersionControlledFile(project, vcFile));
        return project;
    }

    private static void addVersionControlledFile(Project project, VersionControlledFile versionControlledFile) {
        Map<String, Object> attributes = extractAttributes(versionControlledFile);
        Node newNode = new Node(extractFilenamePart(versionControlledFile), NodeType.File, attributes, "", Collections.emptyList());
        NodeInserter.insertByPath(project, PathFactory.fromFileSystemPath(extractPathPart(versionControlledFile)), newNode);
    }

    private static Map<String, Object> extractAttributes(VersionControlledFile versionControlledFile) {
        HashMap<String, Object> attributes = new HashMap<>();
        attributes.put("number_of_commits", versionControlledFile.getNumberOfOccurrencesInCommits());
        attributes.put("weeks_with_commits", versionControlledFile.getNumberOfWeeksWithCommits());
        attributes.put("authors", versionControlledFile.getAuthors());
        attributes.put("number_of_authors", versionControlledFile.getNumberOfAuthors());
        return attributes;
    }

    private static String extractFilenamePart(VersionControlledFile versionControlledFile) {
        String path = versionControlledFile.getFilename();
        return path.substring(path.lastIndexOf('/') + 1);
    }

    private static String extractPathPart(VersionControlledFile versionControlledFile) {
        String path = versionControlledFile.getFilename();
        return path.substring(0, path.lastIndexOf('/') + 1);
    }
}
