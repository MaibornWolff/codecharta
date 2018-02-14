package de.maibornwolff.codecharta.importer.scmlogparser;

import de.maibornwolff.codecharta.importer.scmlogparser.converter.ProjectConverter;
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.svn.SVNLogParserStrategy;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.serialization.ProjectDeserializer;
import de.maibornwolff.codecharta.serialization.ProjectSerializer;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import java.io.*;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Collection;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(Parameterized.class)
public class SCMLogProjectCreatorGoldenMasterTest {

    private static final String PROJECT_NAME = "SCMLogParser";

    @Parameterized.Parameter
    public String scm;

    @Parameterized.Parameter(1)
    public LogParserStrategy strategy;

    @Parameterized.Parameter(2)
    public boolean containsAuthors;

    @Parameterized.Parameter(3)
    public String logFilename;

    @Parameterized.Parameter(4)
    public String expectedProjectFilename;

    private MetricsFactory metricsFactory = new MetricsFactory(Arrays.asList(
            "number_of_authors",
            "number_of_commits",
            "weeks_with_commits",
            "range_of_weeks_with_commits",
            "successive_weeks_with_commits"
    ));

    @Parameterized.Parameters(name = "{index}: {0}")
    public static Collection<Object[]> data() {
        return Arrays.asList(new Object[][]{
                {"svn", new SVNLogParserStrategy(), true, "example_svn.log", "expected_svn.json"},
                {"git", new GitLogParserStrategy(), false, "example_git.log", "expected_git.json"}
        });
    }

    @Test
    public void logParserGoldenMasterTest() throws Exception {
        // given
        ProjectConverter projectConverter = new ProjectConverter(containsAuthors, PROJECT_NAME);

        SCMLogProjectCreator svnSCMLogProjectCreator = new SCMLogProjectCreator(strategy, metricsFactory, projectConverter);
        InputStreamReader ccjsonReader = new InputStreamReader(this.getClass().getClassLoader().getResourceAsStream(expectedProjectFilename));
        Project expectedProject = ProjectDeserializer.deserializeProject(ccjsonReader);
        URL resource = this.getClass().getClassLoader().getResource(logFilename);
        Stream logStream = Files.lines(Paths.get(resource.toURI()));

        // when
        Project svnProject = svnSCMLogProjectCreator.parse(logStream);
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
}