package de.maibornwolff.codecharta.analysers.tools.validation

import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.model.LensSet
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.LegacyFileException
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import de.maibornwolff.codecharta.util.InputHelper
import io.mockk.every
import io.mockk.mockkObject
import io.mockk.unmockkAll
import org.assertj.core.api.Assertions
import org.everit.json.schema.ValidationException
import org.everit.json.schema.loader.SchemaLoader
import org.json.JSONException
import org.json.JSONObject
import org.json.JSONTokener
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import picocli.CommandLine
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.PrintStream
import kotlin.test.assertFailsWith

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class EveritValidatorTest {
    val errContent = ByteArrayOutputStream()
    val originalErr = System.err

    @AfterEach
    fun afterTest() {
        unmockkAll()
    }

    private val validator = EveritValidator(ValidationTool.SCHEMA_PATH)

    @Test
    fun `should reject a compressed legacy 1_x file with a convert hint`() {
        // Arrange: a gzipped, wrapped legacy 1.x file — check must reject it like every other command,
        // and the compressed input must still be decompressed before the legacy gate sees it.

        // Act
        val thrown =
            assertFailsWith(LegacyFileException::class) {
                validator.validate(this.javaClass.classLoader.getResourceAsStream("validCompressed.gz")!!)
            }

        // Assert
        Assertions.assertThat(thrown.message).contains("convert")
    }

    @Test
    fun `should throw exception if extracted file is invalid json`() {
        assertFailsWith(JSONException::class) {
            validator.validate(this.javaClass.classLoader.getResourceAsStream("invalidJSONCompressed.gz")!!)
        }
    }

    @Test
    fun `should reject an unwrapped compressed legacy file with a convert hint`() {
        // Act
        val thrown =
            assertFailsWith(LegacyFileException::class) {
                validator.validate(this.javaClass.classLoader.getResourceAsStream("invalidProjectCompressed.gz")!!)
            }

        // Assert
        Assertions.assertThat(thrown.message).contains("convert")
    }

    @Test
    fun `should reject a legacy 1_x file with a convert hint`() {
        // Arrange: a wrapped legacy 1.x document (checksum + data), the shape ccsh check silently accepted before.

        // Act
        val thrown =
            assertFailsWith(LegacyFileException::class) {
                validator.validate(this.javaClass.classLoader.getResourceAsStream("validFile.cc.json")!!)
            }

        // Assert
        Assertions.assertThat(thrown.message).contains("convert")
    }

    @Test
    fun `should validate a 2_0 lens-format file`() {
        val validFile = this.javaClass.classLoader
            .getResourceAsStream("validFile.cc.json")!!
            .bufferedReader()
            .readText()
        // validFile is a legacy 1.x fixture, so this exercises the convert-style legacy read.
        val project = ProjectDeserializer.deserializeProject(validFile, allowLegacy = true)
        val v2 = ProjectSerializer.serializeToString(project)

        validator.validate(ByteArrayInputStream(v2.toByteArray()))
    }

    @Test
    fun `should keep the bundled and published 2_0 schemas in sync with a representative project`() {
        // Arrange: a 2.0 project exercising meta.commitHash, per-node contentHash, node + edge metrics,
        // attribute types and descriptors. Because the strict 2.0 schema forbids unknown properties, a new
        // field on the CcJsonV2 DTO would serialize here and fail both validations until the schemas catch up.
        val appNode = Node("App.kt", NodeType.File, mapOf("rloc" to 120.0, "mcc" to 8.0), "", setOf(), checksum = "abc123")
        val otherNode = Node("Other.kt", NodeType.File, mapOf("rloc" to 30.0), "", setOf(), checksum = "def456")
        val srcNode = Node("src", NodeType.Folder, emptyMap(), "", setOf(appNode, otherNode))
        val root = Node("root", NodeType.Folder, emptyMap(), "", setOf(srcNode))
        val edges = listOf(Edge("/root/src/App.kt", "/root/src/Other.kt", mapOf("pairingRate" to 42.0)))
        val attributeTypes =
            mapOf(
                "nodes" to mutableMapOf("rloc" to AttributeType.ABSOLUTE),
                "edges" to mutableMapOf("pairingRate" to AttributeType.RELATIVE)
            )
        val attributeDescriptors =
            mapOf(
                "rloc" to AttributeDescriptor(title = "Real Lines of Code", direction = 1, analyzers = setOf("UnifiedParser")),
                "pairingRate" to AttributeDescriptor(title = "Pairing Rate", direction = -1)
            )
        val project =
            Project(
                "my-project",
                listOf(root),
                Project.API_VERSION,
                LensSet.fromLegacy(edges, attributeTypes, attributeDescriptors),
                commitHash = "a1b2c3d"
            )
        val json = ProjectSerializer.serializeToString(project)

        // Act + Assert: validates against the bundled check schema (ccsh check) ...
        validator.validate(ByteArrayInputStream(json.toByteArray()))
        // ... and against the published standalone 2.0 schema, so neither drifts from the DTO.
        val publishedSchema =
            SchemaLoader
                .builder()
                .draftV7Support()
                .schemaJson(JSONObject(JSONTokener(File("../../../../dev_docs/cc-json-2.0.schema.json").readText())))
                .build()
                .load()
                .build()
        publishedSchema.validate(JSONObject(JSONTokener(json)))
    }

    @Test
    fun `should reject a 2_0 file node that has children`() {
        val fileWithChildren =
            """{"meta":{"projectName":"p","apiVersion":"2.0","checksum":"x"},""" +
                """"files":[{"id":"r","name":"root","type":"Folder","children":[""" +
                """{"id":"f","name":"a.kt","type":"File","children":[{"id":"c","name":"impossible.kt","type":"File"}]}]}],"lenses":{}}"""

        assertFailsWith(ValidationException::class) {
            validator.validate(ByteArrayInputStream(fileWithChildren.toByteArray()))
        }
    }

    @Test
    fun `should throw exception on a 2_0 file missing its files array`() {
        val invalid2 = """{"meta":{"projectName":"p","apiVersion":"2.0","checksum":"x"},"lenses":{}}"""

        assertFailsWith(ValidationException::class) {
            validator.validate(ByteArrayInputStream(invalid2.toByteArray()))
        }
    }

    @Test
    fun `should reject a 2_0-shaped file mislabeled with a 1_5 apiVersion`() {
        val mislabeled =
            """{"meta":{"projectName":"p","apiVersion":"1.5","checksum":"x"},""" +
                """"files":[{"id":"r","name":"root","type":"Folder"}],"lenses":{}}"""

        assertFailsWith(ValidationException::class) {
            validator.validate(ByteArrayInputStream(mislabeled.toByteArray()))
        }
    }

    @Test
    fun `should reject a 2_0 file with an unknown property`() {
        val strayKey =
            """{"meta":{"projectName":"p","apiVersion":"2.0","checksum":"x"},""" +
                """"files":[{"id":"r","name":"root","type":"Folder","childrenn":[]}],"lenses":{}}"""

        assertFailsWith(ValidationException::class) {
            validator.validate(ByteArrayInputStream(strayKey.toByteArray()))
        }
    }

    @Test
    fun `should accept a newer additive 2_x minor version`() {
        // Downward-compatible policy: any major-2 minor validates, so an older tool still reads a
        // structurally-identical file stamped with a newer minor.
        val newerMinor =
            """{"meta":{"projectName":"p","apiVersion":"2.7","checksum":"x"},""" +
                """"files":[{"id":"r","name":"root","type":"Folder"}],"lenses":{}}"""

        validator.validate(ByteArrayInputStream(newerMinor.toByteArray()))
    }

    @Test
    fun `should reject a future 3_0 major version`() {
        // A breaking change is a new major; major-2 tooling must refuse it rather than misread it.
        val futureMajor =
            """{"meta":{"projectName":"p","apiVersion":"3.0","checksum":"x"},""" +
                """"files":[{"id":"r","name":"root","type":"Folder"}],"lenses":{}}"""

        assertFailsWith(ValidationException::class) {
            validator.validate(ByteArrayInputStream(futureMajor.toByteArray()))
        }
    }

    @Test
    fun `should reject a 2_0 file with an empty files array`() {
        val emptyFiles = """{"meta":{"projectName":"p","apiVersion":"2.0","checksum":"x"},"files":[],"lenses":{}}"""

        assertFailsWith(ValidationException::class) {
            validator.validate(ByteArrayInputStream(emptyFiles.toByteArray()))
        }
    }

    @Test
    fun `should reject a 2_0 file with more than one root`() {
        val twoRoots =
            """{"meta":{"projectName":"p","apiVersion":"2.0","checksum":"x"},""" +
                """"files":[{"id":"r1","name":"root","type":"Folder"},{"id":"r2","name":"root2","type":"Folder"}],"lenses":{}}"""

        assertFailsWith(ValidationException::class) {
            validator.validate(ByteArrayInputStream(twoRoots.toByteArray()))
        }
    }

    @Test
    fun `should reject a 2_0 file whose node is missing its name`() {
        val missingName =
            """{"meta":{"projectName":"p","apiVersion":"2.0","checksum":"x"},""" +
                """"files":[{"id":"r","type":"Folder"}],"lenses":{}}"""

        assertFailsWith(ValidationException::class) {
            validator.validate(ByteArrayInputStream(missingName.toByteArray()))
        }
    }

    @Test
    fun `should accept a 2_0 file whose metrics and edge references all resolve to node ids`() {
        // Every metrics-lens key and every edge endpoint points at an id present in the files tree.
        val resolvable =
            """{"meta":{"projectName":"p","apiVersion":"2.0","checksum":"x"},""" +
                """"files":[{"id":"root-id","name":"root","type":"Folder","children":[""" +
                """{"id":"app-id","name":"App.kt","type":"File"},{"id":"lib-id","name":"Lib.kt","type":"File"}]}],""" +
                """"lenses":{"metrics":{"attributes":{"app-id":{"rloc":120},"lib-id":{"rloc":30}}},""" +
                """"dependency":{"edges":[{"fromId":"app-id","toId":"lib-id","attributes":{"pairingRate":42}}]}}}"""

        validator.validate(ByteArrayInputStream(resolvable.toByteArray()))
    }

    @Test
    fun `should reject a 2_0 file whose edge references an unknown endpoint id`() {
        // Schema-valid, but toId 'ghost-id' resolves to no node — the reader would silently drop this edge.
        val danglingEdge =
            """{"meta":{"projectName":"p","apiVersion":"2.0","checksum":"x"},""" +
                """"files":[{"id":"root-id","name":"root","type":"Folder","children":[""" +
                """{"id":"app-id","name":"App.kt","type":"File"}]}],""" +
                """"lenses":{"dependency":{"edges":[{"fromId":"app-id","toId":"ghost-id","attributes":{}}]}}}"""

        val thrown =
            assertFailsWith(ReferentialIntegrityException::class) {
                validator.validate(ByteArrayInputStream(danglingEdge.toByteArray()))
            }
        Assertions.assertThat(thrown.message).contains("toId").contains("ghost-id")
    }

    @Test
    fun `should reject a 2_0 file whose metrics-lens key references an unknown node id`() {
        // Schema-valid, but the metrics bag is keyed by an id no node carries — the reader would silently drop it.
        val danglingMetric =
            """{"meta":{"projectName":"p","apiVersion":"2.0","checksum":"x"},""" +
                """"files":[{"id":"root-id","name":"root","type":"Folder","children":[""" +
                """{"id":"app-id","name":"App.kt","type":"File"}]}],""" +
                """"lenses":{"metrics":{"attributes":{"ghost-id":{"rloc":1}}}}}"""

        val thrown =
            assertFailsWith(ReferentialIntegrityException::class) {
                validator.validate(ByteArrayInputStream(danglingMetric.toByteArray()))
            }
        Assertions.assertThat(thrown.message).contains("metrics-lens").contains("ghost-id")
    }

    @Test
    fun `should report every dangling reference it finds, not just the first`() {
        // One dangling metrics key and one dangling edge endpoint — both must surface in the failure message.
        val multipleDangling =
            """{"meta":{"projectName":"p","apiVersion":"2.0","checksum":"x"},""" +
                """"files":[{"id":"root-id","name":"root","type":"Folder","children":[""" +
                """{"id":"app-id","name":"App.kt","type":"File"}]}],""" +
                """"lenses":{"metrics":{"attributes":{"ghost-metric":{"rloc":1}}},""" +
                """"dependency":{"edges":[{"fromId":"app-id","toId":"ghost-edge","attributes":{}}]}}}"""

        val thrown =
            assertFailsWith(ReferentialIntegrityException::class) {
                validator.validate(ByteArrayInputStream(multipleDangling.toByteArray()))
            }
        Assertions.assertThat(thrown.message).contains("ghost-metric").contains("ghost-edge")
    }

    @Test
    fun `should accept a 2_0 file whose domain lens maps node ids to word banks`() {
        // Arrange: the shape DomainProjectGenerator emits — text + frequency always, tfidf optional.
        val validDomainLens =
            """{"meta":{"projectName":"p","apiVersion":"2.0","checksum":"x"},""" +
                """"files":[{"id":"app-id","name":"root","type":"Folder"}],""" +
                """"lenses":{"domain":{"app-id":[{"text":"invoice","frequency":12,"tfidf":0.42},{"text":"customer","frequency":3}]}}}"""

        // Act + Assert
        validator.validate(ByteArrayInputStream(validDomainLens.toByteArray()))
    }

    @Test
    fun `should reject a 2_0 file whose domain word bank is not an array`() {
        // Arrange: a hand-edited file carrying a single word object instead of the required word array —
        val objectWordBank =
            """{"meta":{"projectName":"p","apiVersion":"2.0","checksum":"x"},""" +
                """"files":[{"id":"app-id","name":"root","type":"Folder"}],""" +
                """"lenses":{"domain":{"app-id":{"text":"invoice","frequency":12}}}}"""

        // Act + Assert
        assertFailsWith(ValidationException::class) {
            validator.validate(ByteArrayInputStream(objectWordBank.toByteArray()))
        }
    }

    @Test
    fun `should reject a 2_0 file whose domain word is missing its frequency`() {
        // Arrange: every word carries a raw occurrence count; only tfidf is optional.
        val wordWithoutFrequency =
            """{"meta":{"projectName":"p","apiVersion":"2.0","checksum":"x"},""" +
                """"files":[{"id":"app-id","name":"root","type":"Folder"}],""" +
                """"lenses":{"domain":{"app-id":[{"text":"invoice"}]}}}"""

        // Act + Assert
        assertFailsWith(ValidationException::class) {
            validator.validate(ByteArrayInputStream(wordWithoutFrequency.toByteArray()))
        }
    }

    @Test
    fun `should reject an unwrapped legacy 1_x file with a convert hint`() {
        // Act
        val thrown =
            assertFailsWith(LegacyFileException::class) {
                validator.validate(this.javaClass.classLoader.getResourceAsStream("invalidFile.json")!!)
            }

        // Assert
        Assertions.assertThat(thrown.message).contains("convert")
    }

    @Test
    fun `should throw exception if no json file`() {
        assertFailsWith(JSONException::class) {
            validator.validate(this.javaClass.classLoader.getResourceAsStream("invalidJson.json")!!)
        }
    }

    @Test
    fun `should stop execution if input files are invalid`() {
        mockkObject(InputHelper)
        every {
            InputHelper.isInputValid(any(), any())
        } returns false

        System.setErr(PrintStream(errContent))
        CommandLine(ValidationTool()).execute("thisDoesNotExist.cc.json").toString()
        System.setErr(originalErr)

        Assertions
            .assertThat(errContent.toString())
            .contains("Input invalid file for ValidationTool, stopping execution")
    }
}
