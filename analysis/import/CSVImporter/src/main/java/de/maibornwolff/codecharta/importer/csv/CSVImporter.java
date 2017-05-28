package de.maibornwolff.codecharta.importer.csv;

import com.google.common.collect.ImmutableList;
import de.maibornwolff.codecharta.serialization.ProjectSerializer;

import java.io.*;
import java.util.List;
import java.util.stream.Collectors;

public class CSVImporter {

    public static final String STANDARD_PROJECT_NAME = "test";

    public static void main(String... args) throws IOException {
        CSVImporterParameter callParameter = new CSVImporterParameter(args);

        if (callParameter.isHelp()) {
            callParameter.printUsage();
        } else {
            CSVProjectAdapter project = new CSVProjectAdapter(STANDARD_PROJECT_NAME, callParameter.getPathSeparator(), callParameter.getCsvDelimiter());
            getInputStreamsFromArgs(callParameter.getFiles()).forEach(project::addProjectFromCsv);
            ProjectSerializer.serializeProject(project, new OutputStreamWriter(System.out));
        }
    }

    private static List<InputStream> getInputStreamsFromArgs(List<String> files) {
        List<InputStream> fileList = files.stream().map(CSVImporter::createFileInputStream).collect(Collectors.toList());
        return fileList.isEmpty() ? ImmutableList.of(System.in) : fileList;
    }

    private static FileInputStream createFileInputStream(String path) {
        try {
            return new FileInputStream(path);
        } catch (FileNotFoundException e) {
            throw new RuntimeException("File " + path + " not found.");
        }
    }
}

