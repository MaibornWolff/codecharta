package de.maibornwolff.codecharta.importer.scmlogparser.parser;

import de.maibornwolff.codecharta.importer.scmlogparser.ProjectConverter;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.svn.SVNLogParserStrategy;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.model.input.Commit;
import de.maibornwolff.codecharta.model.input.Modification;
import de.maibornwolff.codecharta.model.input.metrics.MetricsFactory;
import de.maibornwolff.codecharta.model.input.metrics.NumberOfAuthors;
import de.maibornwolff.codecharta.model.input.metrics.NumberOfOccurencesInCommits;
import de.maibornwolff.codecharta.model.input.metrics.NumberOfWeeksWithCommit;
import de.maibornwolff.codecharta.serialization.ProjectDeserializer;
import de.maibornwolff.codecharta.serialization.ProjectSerializer;
import org.junit.Test;

import java.io.*;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class LogParserTest {

    private static final String EXPECTED_SVN_CC_JSON = "expected_svn.json";

    private static final String SVN_LOG = "example_svn.log";

    private static final String EXPECTED_GIT_CC_JSON = "expected_git.json";

    private static final String GIT_LOG = "example_git.log";


    @Test
    public void logParserSVNGoldenMasterTest() throws Exception {
        // given
        MetricsFactory metricsFactory = new MetricsFactory(Arrays.asList(
                NumberOfAuthors.NUMBER_OF_AUTHORS,
                NumberOfOccurencesInCommits.NUMBER_OF_COMMITS,
                NumberOfWeeksWithCommit.WEEKS_WITH_COMMITS
        ));
        ProjectConverter projectConverter = new ProjectConverter(true);


        LogParser svnLogParser = new LogParser(new SVNLogParserStrategy(), metricsFactory, projectConverter);
        InputStreamReader ccjsonReader = new InputStreamReader(this.getClass().getClassLoader().getResourceAsStream(EXPECTED_SVN_CC_JSON));
        Project expectedProject = ProjectDeserializer.deserializeProject(ccjsonReader);
        URL resource = this.getClass().getClassLoader().getResource(SVN_LOG);
        Stream logStream = Files.lines(Paths.get(resource.toURI()));

        // when
        Project svnProject = svnLogParser.parse(logStream);
        // This step is necessary because the comparison of the attribute map in Node fails if the project is used directly;
        Project svnProjectForComparison = serializeAndDeserializeProject(svnProject);

        // then
        assertThat(svnProjectForComparison).isEqualTo(expectedProject);
    }

    @Test
    public void logParserGitGoldenMasterTest() throws Exception {
        // given
        MetricsFactory metricsFactory = new MetricsFactory(Arrays.asList(
                NumberOfAuthors.NUMBER_OF_AUTHORS,
                NumberOfOccurencesInCommits.NUMBER_OF_COMMITS,
                NumberOfWeeksWithCommit.WEEKS_WITH_COMMITS
        ));
        ProjectConverter projectConverter = new ProjectConverter(false);


        LogParser gitLogParser = new LogParser(new GitLogParserStrategy(), metricsFactory, projectConverter);
        InputStreamReader ccjsonReader = new InputStreamReader(this.getClass().getClassLoader().getResourceAsStream(EXPECTED_GIT_CC_JSON));
        Project expectedProject = ProjectDeserializer.deserializeProject(ccjsonReader);
        URL resource = this.getClass().getClassLoader().getResource(GIT_LOG);
        Stream logStream = Files.lines(Paths.get(resource.toURI()));

        // when
        Project gitProject = gitLogParser.parse(logStream);
        // This step is necessary because the comparison of the attribute map in Node fails if the project is used directly;
        Project gitProjectForComparison = serializeAndDeserializeProject(gitProject);

        // then
        assertThat(gitProjectForComparison).isEqualTo(expectedProject);
    }

    private Project serializeAndDeserializeProject(Project svnProject) throws IOException {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ProjectSerializer.serializeProject(svnProject, new OutputStreamWriter(baos));
            return ProjectDeserializer.deserializeProject(new InputStreamReader(new ByteArrayInputStream(baos.toByteArray())));
        }
    }

    @Test
    public void parseCommitRaisesExceptionWhenAuthorIsMissing() {
        // given
        MetricsFactory metricsFactory = mock(MetricsFactory.class);
        ProjectConverter projectConverter = mock(ProjectConverter.class);
        LogParserStrategy parserStrategy = mock(LogParserStrategy.class);
        when(parserStrategy.parseAuthor(any())).thenReturn(Optional.empty());
        when(parserStrategy.parseDate(any())).thenReturn(Optional.of(LocalDateTime.now()));
        when(parserStrategy.parseModifications(any())).thenReturn(Collections.emptyList());
        LogParser logParser = new LogParser(parserStrategy, metricsFactory, projectConverter);

        // when & then
        assertThatThrownBy(() -> logParser.parseCommit(Collections.emptyList())).isInstanceOf(RuntimeException.class);
    }

    @Test
    public void parseCommitRaisesExceptionWhenCommitDateIsMissing() {
        // given
        MetricsFactory metricsFactory = mock(MetricsFactory.class);
        ProjectConverter projectConverter = mock(ProjectConverter.class);
        LogParserStrategy parserStrategy = mock(LogParserStrategy.class);
        when(parserStrategy.parseAuthor(any())).thenReturn(Optional.of("An Author"));
        when(parserStrategy.parseDate(any())).thenReturn(Optional.empty());
        when(parserStrategy.parseModifications(any())).thenReturn(Collections.emptyList());
        LogParser logParser = new LogParser(parserStrategy, metricsFactory, projectConverter);

        // when & then
        assertThatThrownBy(() -> logParser.parseCommit(Collections.emptyList())).isInstanceOf(RuntimeException.class);
    }

    @Test
    public void parseCommit() {
        // given
        MetricsFactory metricsFactory = mock(MetricsFactory.class);
        ProjectConverter projectConverter = mock(ProjectConverter.class);
        LogParserStrategy parserStrategy = mock(LogParserStrategy.class);
        String author = "An Author";
        LocalDateTime commitDate = LocalDateTime.now();
        List<String> filenames = Arrays.asList("src/Main.java", "src/Util.java");
        List<String> input = Collections.emptyList();
        when(parserStrategy.parseAuthor(input)).thenReturn(Optional.of(author));
        when(parserStrategy.parseDate(input)).thenReturn(Optional.of(commitDate));
        when(parserStrategy.parseModifications(input))
                .thenReturn(filenames.stream().map(Modification::new).collect(Collectors.toList()));
        LogParser logParser = new LogParser(parserStrategy, metricsFactory, projectConverter);

        // when
        Commit commit = logParser.parseCommit(input);

        //then
        assertThat(commit.getAuthor()).isEqualTo(author);
        assertThat(commit.getFilenames()).isEqualTo(filenames);
        assertThat(commit.getCommitDate()).isEqualTo(commitDate);
    }
}