package de.maibornwolff.codecharta.importer.scmlogparser;

import de.maibornwolff.codecharta.model.Node;
import de.maibornwolff.codecharta.model.NodeType;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.model.input.VersionControlledFile;
import de.maibornwolff.codecharta.nodeinserter.FileSystemPath;
import de.maibornwolff.codecharta.nodeinserter.NodeInserter;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

public class ProjectConverter{

    private ProjectConverter(){}

    public static Project convert(String projectName, List<VersionControlledFile> versionControlledFiles) {
        Project project = new Project(projectName);
        versionControlledFiles.forEach(vcFile -> ProjectConverter.addVersionControlledFile(project, vcFile));
        return project;
    }

    private static void addVersionControlledFile(Project project, VersionControlledFile versionControlledFile) {
        HashMap attributes = extractAttributes(versionControlledFile);
        Node newNode = new Node(extractFilenamePart(versionControlledFile), NodeType.File, attributes, "", Arrays.asList());
        NodeInserter.insertByPath(project, new FileSystemPath(extractPathPart(versionControlledFile)), newNode );
    }

    private static HashMap<String, Object> extractAttributes(VersionControlledFile versionControlledFile){
        HashMap attributes = new HashMap();
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
        return path.substring(0,path.lastIndexOf('/') + 1);
    }
}
