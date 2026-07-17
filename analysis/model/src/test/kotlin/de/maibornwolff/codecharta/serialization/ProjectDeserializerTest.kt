package de.maibornwolff.codecharta.serialization

import de.maibornwolff.codecharta.model.Project
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.PipedInputStream
import java.io.PipedOutputStream
import java.io.PrintStream
import java.io.StringReader
import java.nio.charset.StandardCharsets

class ProjectDeserializerTest {
    companion object {
        private const val EXAMPLE_2_0 = "example.cc.json"
        private const val EXAMPLE_LEGACY = "example_api_version_1.3.cc.json"
        private const val EXAMPLE_LEGACY_GZ = "example_api_version_1.3.cc.json.gz"
    }

    @Test
    fun `should read a 2_0 file`() {
        // given
        val reader = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_2_0)!!.reader()

        // when
        val project = ProjectDeserializer.deserializeProject(reader)

        // then
        assertThat(project.projectName).isEqualTo("201701poolobject")
        assertThat(project.size).isEqualTo(6)
    }

    @Test
    fun `should reject a legacy 1_x file unless legacy reading is allowed`() {
        // given: only `ccsh convert` reads 1.x; every other command must reject it.
        val legacy = this.javaClass.classLoader.getResource(EXAMPLE_LEGACY)!!.readText()

        // when + then
        val thrown = assertThrows<Exception> { ProjectDeserializer.deserializeProject(legacy) }
        assertThat(thrown.message).contains("convert")
    }

    @Test
    fun `should throw LegacyFileException for a legacy 1_x file when legacy reading is not allowed`() {
        // given: callers such as `ccsh merge` must be able to tell a legacy file apart from garbage.
        val legacy = this.javaClass.classLoader.getResource(EXAMPLE_LEGACY)!!.readText()

        // when + then
        assertThrows<LegacyFileException> { ProjectDeserializer.deserializeProject(legacy) }
    }

    @Test
    fun `should surface the convert hint without dumping the file when piped input is a legacy file`() {
        // given: a legacy 1.x file arrives on stdin; the deserializer must point at `ccsh convert`, not dump the file.
        val legacy = this.javaClass.classLoader.getResource(EXAMPLE_LEGACY)!!.readText()
        val inputStream = ByteArrayInputStream(legacy.toByteArray(StandardCharsets.UTF_8))
        val errContent = ByteArrayOutputStream()
        val originalErr = System.err
        System.setErr(PrintStream(errContent))

        // when
        val project =
            try {
                ProjectDeserializer.deserializeProject(inputStream)
            } finally {
                System.setErr(originalErr)
            }

        // then
        assertThat(project).isNull()
        val err = errContent.toString()
        assertThat(err).contains("convert")
        assertThat(err).doesNotContain("Piped input:")
        assertThat(err).doesNotContain("201701poolobject")
    }

    @Test
    fun `should not treat arbitrary json without a lenses envelope as a legacy file`() {
        // given: valid JSON that is neither a 2.0 nor a 1.x project must not demand a pointless convert.
        val garbage = """{"object": "whatever"}"""

        // when + then
        val thrown = assertThrows<Exception> { ProjectDeserializer.deserializeProject(garbage) }
        assertThat(thrown).isNotInstanceOf(LegacyFileException::class.java)
        assertThat(thrown.message).doesNotContain("convert")
    }

    @Test
    fun `should read a legacy 1_x file when legacy reading is allowed`() {
        // given
        val legacy = this.javaClass.classLoader.getResource(EXAMPLE_LEGACY)!!.readText()

        // when
        val project = ProjectDeserializer.deserializeProject(legacy, allowLegacy = true)

        // then
        assertThat(project.projectName).isEqualTo("201701poolobject")
        assertThat(project.size).isEqualTo(6)
    }

    @Test
    fun `should read a gzip-compressed legacy file when legacy reading is allowed`() {
        // given
        val gz = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_LEGACY_GZ)!!

        // when
        val project = ProjectDeserializer.deserializeProject(gz, allowLegacy = true)

        // then
        assertThat(project).isNotNull
        assertThat(project!!.projectName).isEqualTo("201701poolobject")
        assertThat(project.size).isEqualTo(6)
    }

    @Test
    fun `should default missing values when reading a legacy json string`() {
        // given
        val jsonString = "{projectName='some Project', apiVersion='1.0', nodes=[{name:'root',type:'Folder'}]}"

        // when
        val project = ProjectDeserializer.deserializeProject(StringReader(jsonString), allowLegacy = true)
        val node = project.rootNode

        // then
        assertThat(node.link).isNull()
        assertThat(node.attributes).isNotNull
        assertThat(node.children).isNotNull
    }

    @Test
    fun `should not label a legacy file without an apiVersion as the current version`() {
        // given: a legacy 1.x project predating the apiVersion field (no apiVersion key).
        val legacyWithoutApiVersion = "{projectName='old', nodes=[{name:'root',type:'Folder'}]}"

        // when
        val project = ProjectDeserializer.deserializeProject(StringReader(legacyWithoutApiVersion), allowLegacy = true)

        // then: a missing version must be treated as legacy, not stamped as the current 2.0.
        assertThat(project.apiVersion).isNotEqualTo(Project.API_VERSION)
        assertThat(Project.isAPIVersionCompatible(project.apiVersion)).isFalse()
    }

    @Test
    fun `should return null when piped input is not a valid project`() {
        // given
        val invalidInput = "This is \n invalid \t data"
        val inputStream = PipedInputStream()
        val outputStream = PipedOutputStream(inputStream)
        outputStream.write(invalidInput.toByteArray(StandardCharsets.UTF_8))

        // when
        val project = ProjectDeserializer.deserializeProject(inputStream)

        // then
        assertThat(project).isNull()
    }

    @Test
    fun `should read the checksum from a legacy json file`() {
        // given
        val sampleChecksum = "abc123def456"
        val jsonWithChecksum = """
            {
                "projectName": "TestProject",
                "apiVersion": "1.3",
                "nodes": [
                    {
                        "name": "root",
                        "type": "Folder",
                        "children": [
                            {
                                "name": "TestFile.java",
                                "type": "File",
                                "attributes": {"rloc": 100},
                                "checksum": "$sampleChecksum"
                            }
                        ]
                    }
                ]
            }
        """.trimIndent()

        // when
        val project = ProjectDeserializer.deserializeProject(jsonWithChecksum, allowLegacy = true)

        // then
        assertThat(project.rootNode.children.first().checksum).isEqualTo(sampleChecksum)
    }
}
