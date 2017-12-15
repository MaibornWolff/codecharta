package de.maibornwolff.codecharta.importer.scmlogparser.parser;

import de.maibornwolff.codecharta.importer.scmlogparser.ProjectConverter;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.model.input.Commit;
import de.maibornwolff.codecharta.model.input.Modification;
import de.maibornwolff.codecharta.model.input.VersionControlledFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Stream;

public class LogParser {

    private final LogParserStrategy parserStrategy;
    private final boolean containsAuthors;

    public LogParser(LogParserStrategy parserStrategy, boolean containsAuthors) {
        this.parserStrategy = parserStrategy;
        this.containsAuthors = containsAuthors;
    }

    public Project parse(Stream<String> lines) {
        List<VersionControlledFile> versionControlledFiles = parseLoglines(lines);
        return convertToProject(versionControlledFiles);
    }

    List<VersionControlledFile> parseLoglines(Stream<String> logLines) {
        return logLines.collect(parserStrategy.createLogLineCollector())
                .map(this::parseCommit)
                .collect(CommitCollector.create());
    }

    private Project convertToProject(List<VersionControlledFile> versionControlledFiles) {
        return ProjectConverter.convert("SCMLogParser", versionControlledFiles, containsAuthors);
    }

    Commit parseCommit(List<String> commitLines) {
        String author = parserStrategy.parseAuthor(commitLines).orElseThrow(() -> new IllegalArgumentException("No author found in input"));
        LocalDateTime commitDate = parserStrategy.parseDate(commitLines).orElseThrow(() -> new IllegalArgumentException("No commit date found in input"));
        List<Modification> modifications = parserStrategy.parseModifications(commitLines);
        return new Commit(author, modifications, commitDate);
    }
}
