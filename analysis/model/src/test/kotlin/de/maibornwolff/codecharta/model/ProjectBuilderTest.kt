package de.maibornwolff.codecharta.model

import com.google.gson.JsonParser
import de.maibornwolff.codecharta.util.AttributeGeneratorRegistry
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatIllegalStateException
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test

class ProjectBuilderTest {
    @AfterEach
    fun afterTests() {
        unmockkAll()
    }

    @Test
    fun `it should throw an exception when initialization is incorrect`() { // then
        assertThatIllegalStateException()
            .isThrownBy {
                ProjectBuilder(listOf())
            }.withMessageContaining("No unique root node was found, instead 0 candidates identified.")
    }

    @Test
    fun `it should insert a new node as child of root when there is no root node `() {
        // when
        val projectBuilder = ProjectBuilder()
        val nodeForInsertion = MutableNode("someNode", NodeType.File)
        projectBuilder.insertByPath(Path.trivialPath(), nodeForInsertion)
        val root = projectBuilder.build().rootNode

        // then
        assertThat(root.children).hasSize(1)
        assertThat(root.children.toMutableList()[0].toString()).isEqualTo(nodeForInsertion.toNode().toString())
    }

    @Test
    fun `it should create a project with root when inserting a new node into a project with root-node`() {
        // when
        val root = MutableNode("root", NodeType.Folder)
        val projectBuilder = ProjectBuilder(listOf(root))

        val nodeForInsertion = MutableNode("someNode", NodeType.File)
        projectBuilder.insertByPath(Path.trivialPath(), nodeForInsertion)
        val project = projectBuilder.build()

        // then
        assertThat(project.rootNode.toString()).isEqualTo(root.toNode().toString())
        assertThat(root.children).hasSize(1)
        assertThat(root.children.toMutableList()[0]).isEqualTo(nodeForInsertion)
    }

    @Test
    fun `it should filter out empty folders`() {
        // when
        val projectBuilder = ProjectBuilder()
        val nodeForInsertion = MutableNode("someNode", NodeType.Folder)
        projectBuilder.insertByPath(Path.trivialPath(), nodeForInsertion)

        val project = projectBuilder.build()
        val root = project.rootNode

        // then
        assertThat(root.children).hasSize(0)
    }

    @Test
    fun `it should add the correct attribute-types`() {
        // when
        val projectBuilder =
            ProjectBuilder(
                attributeTypes = mutableMapOf("nodes" to mutableMapOf("nodeMetric" to AttributeType.ABSOLUTE))
            )
        val attributeTypesToAdd = AttributeTypes(mutableMapOf("edgeMetric" to AttributeType.ABSOLUTE), "edges")
        val attributeTypesToAddExisting = AttributeTypes(mutableMapOf("nodeMetric2" to AttributeType.RELATIVE), "nodes")
        projectBuilder.addAttributeTypes(attributeTypesToAdd)
        projectBuilder.addAttributeTypes(attributeTypesToAddExisting)

        // then
        assertThat(projectBuilder.toString()).contains(
            "edges={edgeMetric=${AttributeType.ABSOLUTE}}",
            "nodes={nodeMetric=${AttributeType.ABSOLUTE}, nodeMetric2=${AttributeType.RELATIVE}}"
        )
    }

    @Test
    fun `it should add the correct attribute-descriptors when all node-metrics have corresponding attribute-descriptors`() {
        // given
        val rootNode = MutableNode("root", NodeType.Folder)
        val firstNode =
            MutableNode(
                name = "firstNode",
                type = NodeType.File,
                attributes = mapOf("firstAttribute" to 1, "secondAttribute" to 2)
            )
        val secondNode =
            MutableNode(
                name = "secondNode",
                type = NodeType.File,
                attributes = mapOf("firstAttribute" to 3, "secondAttribute" to 4)
            )
        val attributeDescriptorFirstAttribute =
            AttributeDescriptor(
                title = "firstAttribute",
                description = "description first attribute"
            )
        val attributeDescriptorSecondAttribute =
            AttributeDescriptor(
                title = "secondAttribute",
                description = "description second attribute"
            )
        val attributeDescriptors =
            mutableMapOf(
                "firstAttribute" to attributeDescriptorFirstAttribute,
                "secondAttribute" to attributeDescriptorSecondAttribute
            )

        // when
        val projectBuilder =
            ProjectBuilder(
                nodes = listOf(rootNode),
                attributeDescriptors = attributeDescriptors
            )
        projectBuilder.insertByPath(Path.trivialPath(), firstNode)
        projectBuilder.insertByPath(Path.trivialPath(), secondNode)
        val project = projectBuilder.build()

        // then
        assertThat(project.lenses.allAttributeDescriptors()).isEqualTo(attributeDescriptors)
        val attributeNames =
            project.rootNode.children.toList().flatMap {
                it.attributes.keys
            }
        attributeNames.forEach { attributeName -> assertThat(attributeDescriptors[attributeName]).isNotNull }
    }

    @Test
    fun `it should estimate the direction of attribute-descriptors for unknown metrics with positive direction correctly`() {
        // given
        mockkObject(AttributeGeneratorRegistry)
        every {
            AttributeGeneratorRegistry.getAllAttributeDescriptors()
        } returns
            mapOf(
                "number_of_tests" to
                    AttributeDescriptor(
                        title = "Number of Tests",
                        description = "",
                        link = "",
                        direction = 1
                    ),
                "new_line_coverage" to
                    AttributeDescriptor(
                        title = "New Line Coverage",
                        description = "",
                        link = "",
                        direction = 1
                    ),
                "security_hotspots_reviewed" to
                    AttributeDescriptor(
                        title = "Security Hotspots Reviewed",
                        description = "",
                        link = "",
                        direction = 1
                    ),
                "tests" to
                    AttributeDescriptor(
                        title = "Test Density",
                        description = "",
                        link = "",
                        direction = 1
                    ),
                "wont_fix_issues" to
                    AttributeDescriptor(
                        title = "Number of Won't Fix Issues",
                        description = "",
                        link = "",
                        direction = -1
                    )
            )

        val rootNode = MutableNode("root", NodeType.Folder)
        val firstNode =
            MutableNode(
                name = "firstNode",
                type = NodeType.File,
                attributes =
                    mapOf(
                        "automated_test_coverage" to 1,
                        "code_efficiency_index" to 2,
                        "development_velocity" to 5,
                        "public_documented_api_density" to 0.5,
                        "test_success_density" to 0.7,
                        "tests" to 70,
                        "new_security_hotspots_reviewed" to 2,
                        "pull_request_fixed_issues" to 120,
                        "issues_reviewed" to 150,
                        "code_reusability_score" to 85
                    )
            )

        // when
        val projectBuilder = ProjectBuilder(nodes = listOf(rootNode))
        projectBuilder.insertByPath(Path.trivialPath(), firstNode)

        projectBuilder.addAttributeDescriptions()
        val project = projectBuilder.build()

        // then
        project.lenses.allAttributeDescriptors().forEach {
            assertThat(it.value.direction).isEqualTo(1)
        }
    }

    @Test
    fun `it should estimate the direction of attribute-descriptors for unknown metrics with negative direction correctly`() {
        // given
        mockkObject(AttributeGeneratorRegistry)
        every {
            AttributeGeneratorRegistry.getAllAttributeDescriptors()
        } returns
            mapOf(
                "number_of_tests" to
                    AttributeDescriptor(
                        title = "Number of Tests",
                        description = "",
                        link = "",
                        direction = 1
                    ),
                "new_line_coverage" to
                    AttributeDescriptor(
                        title = "New Line Coverage",
                        description = "",
                        link = "",
                        direction = 1
                    ),
                "security_hotspots_reviewed" to
                    AttributeDescriptor(
                        title = "Security Hotspots Reviewed",
                        description = "",
                        link = "",
                        direction = 1
                    ),
                "tests" to
                    AttributeDescriptor(
                        title = "Test Density",
                        description = "",
                        link = "",
                        direction = 1
                    ),
                "wont_fix_issues" to
                    AttributeDescriptor(
                        title = "Number of Won't Fix Issues",
                        description = "",
                        link = "",
                        direction = -1
                    )
            )

        val rootNode = MutableNode("root", NodeType.Folder)
        val firstNode =
            MutableNode(
                name = "firstNode",
                type = NodeType.File,
                attributes =
                    mapOf(
                        "code_duplication_ratio" to 0.8,
                        "cyclomatic_complexity_per_method" to 2,
                        "dependency_vulnerabilities" to 4,
                        "runtime_errors" to 6,
                        "static_code_analysis_warnings" to 18,
                        "bugs" to 2,
                        "code_smells" to 10,
                        "critical_violations" to 2,
                        "duplicated_blocks" to 15,
                        "uncovered_lines" to 85
                    )
            )

        // when
        val projectBuilder = ProjectBuilder(nodes = listOf(rootNode))
        projectBuilder.insertByPath(Path.trivialPath(), firstNode)

        projectBuilder.addAttributeDescriptions()
        val project = projectBuilder.build()

        // then
        project.lenses.allAttributeDescriptors().forEach {
            assertThat(it.value.direction).isEqualTo(-1)
        }
    }

    @Test
    fun `it should print the correct content keys`() {
        // when
        val projectBuilder = ProjectBuilder()

        // then
        assertThat(projectBuilder.toString()).contains(
            "edges=[]",
            "attributeTypes={}",
            "attributeDescriptors={}",
            "blacklist=[]"
        )
    }

    @Test
    fun `it should preserve checksums through the build process`() {
        // given
        val sampleChecksum = "abc123def456"
        val rootNode = MutableNode("root", NodeType.Folder)
        val fileWithChecksum =
            MutableNode(
                name = "TestFile.java",
                type = NodeType.File,
                attributes = mapOf("rloc" to 100, "complexity" to 15),
                checksum = sampleChecksum
            )
        val fileWithoutChecksum =
            MutableNode(
                name = "EmptyFile.java",
                type = NodeType.File,
                attributes = mapOf("rloc" to 0),
                checksum = null
            )

        rootNode.children.add(fileWithChecksum)
        rootNode.children.add(fileWithoutChecksum)

        // when
        val projectBuilder = ProjectBuilder(listOf(rootNode))
        val project = projectBuilder.build()

        // then
        val builtFileWithChecksum = project.rootNode.children.find { it.name == "TestFile.java" }
        val builtFileWithoutChecksum = project.rootNode.children.find { it.name == "EmptyFile.java" }

        assertThat(builtFileWithChecksum!!.checksum).isEqualTo(sampleChecksum)
        assertThat(builtFileWithoutChecksum!!.checksum).isNull()
    }

    @Test
    fun `it should carry clusters, opaque lenses and commit hash through the build`() {
        // given
        val cluster = JsonParser.parseString("""{"id":1,"members":["a","b"]}""")
        val domainLens = JsonParser.parseString("""{"layer":"backend"}""")
        val projectBuilder =
            ProjectBuilder()
                .withClusters(listOf(cluster))
                .withOpaqueLenses(mapOf("domain" to domainLens))
                .withCommitHash("abc1234")

        // when
        val project = projectBuilder.build()

        // then
        assertThat(project.lenses.metrics.clusters).containsExactly(cluster)
        assertThat(project.lenses.opaqueLenses).containsEntry("domain", domainLens)
        assertThat(project.commitHash).isEqualTo("abc1234")
    }

    @Test
    fun `fromLenses should preserve clusters, opaque lenses and commit hash`() {
        // given
        val securityLens = JsonParser.parseString("""{"cves":3}""")
        val metrics = MetricsLens(clusters = listOf(JsonParser.parseString("""{"id":7}""")))

        // when
        val project =
            ProjectBuilder
                .fromLenses(
                    listOf(MutableNode("root", NodeType.Folder)),
                    metrics,
                    DependencyLens(),
                    opaqueLenses = mapOf("security" to securityLens),
                    commitHash = "deadbee"
                ).build()

        // then
        assertThat(project.lenses.opaqueLenses).containsEntry("security", securityLens)
        assertThat(project.lenses.metrics.clusters).hasSize(1)
        assertThat(project.commitHash).isEqualTo("deadbee")
    }
}
