package de.maibornwolff.codecharta.importer.csv;

import com.google.common.collect.ImmutableList;
import de.maibornwolff.codecharta.serialization.ProjectSerializer;

import java.io.*;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class CSVImporter {
    public static void main(String... args) throws IOException {
        CSVImporterParameter callParameter = new CSVImporterParameter(3,4);

        CSVProjectAdapter project = new CSVProjectAdapter("test", callParameter);
        getInputStreamsFromArgs(args).forEach(project::addProjectFromCsv);
        ProjectSerializer.serializeProject(project, new OutputStreamWriter(System.out));
    }

    private static List<InputStream> getInputStreamsFromArgs(String[] args) {
        List<InputStream> fileList = Arrays.stream(args).map(CSVImporter::createFileInputStream).collect(Collectors.toList());
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

