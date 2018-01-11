package de.maibornwolff.codecharta.importer.scmlogparser;

import de.maibornwolff.codecharta.importer.scmlogparser.SCMLogProjectCreator;
import de.maibornwolff.codecharta.importer.scmlogparser.converter.ProjectConverter;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.LogParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.git.GitLogParserStrategy;
import de.maibornwolff.codecharta.importer.scmlogparser.parser.svn.SVNLogParserStrategy;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Commit;
import de.maibornwolff.codecharta.importer.scmlogparser.input.Modification;
import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory;
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

public class SCMLogProjectCreatorTest {

    private static final String EXPECTED_SVN_CC_JSON = "expected_svn.json";

    private static final String SVN_LOG = "example_svn.log";

    private static final String EXPECTED_GIT_CC_JSON = "expected_git.json";

    private static final String GIT_LOG = "example_git.log";


    @Test
    public void logParserSVNGoldenMasterTest() throws Exception {
        // given
        MetricsFactory metricsFactory = new MetricsFactory(Arrays.asList(
                "number_of_authors",
                "number_of_commits",
                "weeks_with_commits"
        ));
        ProjectConverter projectConverter = new ProjectConverter(true);


        SCMLogProjectCreator svnSCMLogProjectCreator = new SCMLogProjectCreator(new SVNLogParserStrategy(), metricsFactory, projectConverter);
        InputStreamReader ccjsonReader = new InputStreamReader(this.getClass().getClassLoader().getResourceAsStream(EXPECTED_SVN_CC_JSON));
        Project expectedProject = ProjectDeserializer.deserializeProject(ccjsonReader);
        URL resource = this.getClass().getClassLoader().getResource(SVN_LOG);
        Stream logStream = Files.lines(Paths.get(resource.toURI()));

        // when
        Project svnProject = svnSCMLogProjectCreator.parse(logStream);
        // This step is necessary because the comparison of the attribute map in Node fails if the project is used directly;
        Project svnProjectForComparison = serializeAndDeserializeProject(svnProject);

        // then
        assertThat(svnProjectForComparison).isEqualTo(expectedProject);
    }

    @Test
    public void logParserGitGoldenMasterTest() throws Exception {
        // given
        MetricsFactory metricsFactory = new MetricsFactory(Arrays.asList(
                "number_of_authors",
                "number_of_commits",
                "weeks_with_commits"
        ));
        ProjectConverter projectConverter = new ProjectConverter(false);


        SCMLogProjectCreator gitSCMLogProjectCreator = new SCMLogProjectCreator(new GitLogParserStrategy(), metricsFactory, projectConverter);
        InputStreamReader ccjsonReader = new InputStreamReader(this.getClass().getClassLoader().getResourceAsStream(EXPECTED_GIT_CC_JSON));
        Project expectedProject = ProjectDeserializer.deserializeProject(ccjsonReader);
        URL resource = this.getClass().getClassLoader().getResource(GIT_LOG);
        Stream logStream = Files.lines(Paths.get(resource.toURI()));

        // when
        Project gitProject = gitSCMLogProjectCreator.parse(logStream);
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
}