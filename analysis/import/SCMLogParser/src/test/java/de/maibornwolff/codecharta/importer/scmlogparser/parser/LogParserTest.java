package de.maibornwolff.codecharta.importer.scmlogparser.parser;

import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.model.input.Commit;
import de.maibornwolff.codecharta.serialization.ProjectDeserializer;
import de.maibornwolff.codecharta.serialization.ProjectSerializer;
import org.assertj.core.util.Lists;
import org.junit.Before;
import org.junit.Test;

import java.io.*;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class LogParserTest {

    private static final String PATH_EXPECTED_CC_JSON = "./src/test/resources/ExpectedJSON.cc.json";

    private static final String PATH_SVN_LOG = "./src/test/resources/SVNTestLog.txt";


    @Before
    public void setup() throws FileNotFoundException {

    }

    @Test
    public void logParserSVNGoldenMasterTest() throws Exception {
        // given
        LogParser svnLogParser = new LogParser(new SVNLogParserStrategy());
        Project expectedProject = ProjectDeserializer.deserializeProject(PATH_EXPECTED_CC_JSON);

        // when
        Project svnProject = svnLogParser.parse(PATH_SVN_LOG);
        // This step is necessary because the comparison of the attribute map in Node fails if the project is used directly;
        Project svnProjectForComparison = serializeAndDeserializeProject(svnProject);

        // then
        assertThat(svnProjectForComparison).isEqualTo(expectedProject);
    }

    private Project serializeAndDeserializeProject(Project svnProject) throws IOException {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ProjectSerializer.serializeProject(svnProject, new OutputStreamWriter(baos));
            return ProjectDeserializer.deserializeProject(new InputStreamReader(new ByteArrayInputStream(baos.toByteArray())));
        }
    }

    @Test
    public void parseLines() {
        LogParser svnLogParser = new LogParser(new SVNLogParserStrategy());
        Stream<String> lines = svnLogParser.readLinesFromLogFile(PATH_SVN_LOG);
        assertThat(lines).hasSize(33);
    }

    @Test
    public void parseCommitRaisesExceptionWhenAuthorIsMissing() {
        // given
        LogParserStrategy parserStrategy = mock(LogParserStrategy.class);
        when(parserStrategy.parseAuthor(any())).thenReturn(Optional.empty());
        when(parserStrategy.parseDate(any())).thenReturn(Optional.of(LocalDateTime.now()));
        when(parserStrategy.parseFilenames(any())).thenReturn(Arrays.asList());
        LogParser logParser = new LogParser(parserStrategy);

        // when & then
        assertThatThrownBy(() -> logParser.parseCommit(Lists.newArrayList())).isInstanceOf(RuntimeException.class);
    }

    @Test
    public void parseCommitRaisesExceptionWhenCommitDateIsMissing() {
        // given
        LogParserStrategy parserStrategy = mock(LogParserStrategy.class);
        when(parserStrategy.parseAuthor(any())).thenReturn(Optional.of("An Author"));
        when(parserStrategy.parseDate(any())).thenReturn(Optional.empty());
        when(parserStrategy.parseFilenames(any())).thenReturn(Arrays.asList());
        LogParser logParser = new LogParser(parserStrategy);

        // when & then
        assertThatThrownBy(() -> logParser.parseCommit(Lists.newArrayList())).isInstanceOf(RuntimeException.class);
    }

    @Test
    public void parseCommit() {
        // given
        LogParserStrategy parserStrategy = mock(LogParserStrategy.class);
        String author = "An Author";
        LocalDateTime commitDate = LocalDateTime.now();
        List<String> filenames = Arrays.asList("src/Main.java", "src/Util.java");
        List<String> input = Arrays.asList();
        when(parserStrategy.parseAuthor(input)).thenReturn(Optional.of(author));
        when(parserStrategy.parseDate(input)).thenReturn(Optional.of(commitDate));
        when(parserStrategy.parseFilenames(input)).thenReturn(filenames);
        LogParser logParser = new LogParser(parserStrategy);

        // when
        Commit commit = logParser.parseCommit(input);

        //then
        assertThat(commit.getAuthor()).isEqualTo(author);
        assertThat(commit.getFilenames()).isEqualTo(filenames);
        assertThat(commit.getCommitDate()).isEqualTo(commitDate);
    }
}