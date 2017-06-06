package de.maibornwolff.codecharta.importer.scmlogparser.parser;

import de.maibornwolff.codecharta.importer.scmlogparser.ProjectConverter;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.model.input.Commit;
import de.maibornwolff.codecharta.model.input.VersionControlledFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Stream;

public class LogParser {

    private LogParserStrategy parserStrategy;

    public LogParser(LogParserStrategy parserStrategy) {
        this.parserStrategy = parserStrategy;
    }

    public Project parse(String pathToLog) {
        Stream<String> lines = readLinesFromLogFile(pathToLog);
        List<VersionControlledFile> versionControlledFiles = parseLoglines(lines);
        return convertToProject(versionControlledFiles);
    }

    Stream<String> readLinesFromLogFile(String pathToLog) {
        try {
            return Files.lines(Paths.get(pathToLog));
        } catch (IOException e) {
            e.printStackTrace();
            return Stream.empty();
        }
    }

    List<VersionControlledFile> parseLoglines(Stream<String> logLines) {
        return logLines.collect(parserStrategy.createLogLineCollector())
                .map(this::parseCommit)
                .collect(CommitCollector.create());
    }

    Project convertToProject(List<VersionControlledFile> versionControlledFiles) {
        return ProjectConverter.convert("SCMLogParser", versionControlledFiles);
    }

    Commit parseCommit(List<String> commitLines) {
        String author = parserStrategy.parseAuthor(commitLines).orElseThrow(() -> new IllegalArgumentException("No author found in input"));
        LocalDateTime commitDate = parserStrategy.parseDate(commitLines).orElseThrow(() -> new IllegalArgumentException("No commit date found in input"));
        List<String> filenames = parserStrategy.parseFilenames(commitLines);
        return new Commit(author, filenames, commitDate);
    }
}
