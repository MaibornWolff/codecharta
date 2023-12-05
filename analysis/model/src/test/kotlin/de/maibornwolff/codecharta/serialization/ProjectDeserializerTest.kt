package de.maibornwolff.codecharta.serialization

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.PipedInputStream
import java.io.PipedOutputStream
import java.io.StringReader
import java.nio.charset.StandardCharsets

class ProjectDeserializerTest {
    val EXAMPLE_JSON_VERSION_1_0 = "example.cc.json"
    val EXAMPLE_JSON_VERSION_1_3 = "example_api_version_1.3.cc.json"
    val EXAMPLE_JSON_GZ_VERSION_1_0 = "example.cc.json.gz"
    val EXAMPLE_JSON_GZ_VERSION_1_3 = "example_api_version_1.3.cc.json.gz"

    @Test
    fun `should deserialize project from cc json with api version 1_2 or lower`() {
        // given
        val expectedJsonReader = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_JSON_VERSION_1_0)!!.reader()

        // when
        val project = ProjectDeserializer.deserializeProject(expectedJsonReader)

        // then
        assertThat(project.projectName).isEqualTo("201701poolobject")
        assertThat(project.size).isEqualTo(6)
    }

    @Test
    fun `should deserialize project from cc json with api version greater or equal than 1_3`() {
        // given
        val expectedJsonReader = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_JSON_VERSION_1_3)!!.reader()

        // when
        val project = ProjectDeserializer.deserializeProject(expectedJsonReader)

        // then
        assertThat(project.projectName).isEqualTo("201701poolobject")
        assertThat(project.size).isEqualTo(6)
    }

    @Test
    fun `should deserialize project from cc json string with api version 1_2 or lower`() {
        // given
        val expectedJsonString = this.javaClass.classLoader.getResource(EXAMPLE_JSON_VERSION_1_0)!!.readText()

        // when
        val project = ProjectDeserializer.deserializeProject(expectedJsonString)

        // then
        assertThat(project.projectName).isEqualTo("201701poolobject")
        assertThat(project.size).isEqualTo(6)
    }

    @Test
    fun `should deserialize project from cc json string with api version greater or equal than 1_3`() {
        // given
        val expectedJsonReader = this.javaClass.classLoader.getResource(EXAMPLE_JSON_VERSION_1_3)!!.readText()

        // when
        val project = ProjectDeserializer.deserializeProject(expectedJsonReader)

        // then
        assertThat(project.projectName).isEqualTo("201701poolobject")
        assertThat(project.size).isEqualTo(6)
    }

    @Test
    fun `should deserialize project from json string and set nonexisting values to defaults`() {
        // given
        val jsonString = "{projectName='some Project', apiVersion='1.0', nodes=[{name:'root',type:'Folder'}]}"

        // when
        val project = ProjectDeserializer.deserializeProject(StringReader(jsonString))
        val node = project.rootNode

        // then
        assertThat(node.link).isNull()
        assertThat(node.attributes).isNotNull
        assertThat(node.children).isNotNull
    }

    @Test
    fun `should deserialize project from cc json gz with api version 1_2 or lower`() {
        // given
        val expectedInputStream = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_JSON_GZ_VERSION_1_0)!!

        // when
        val project = ProjectDeserializer.deserializeProject(expectedInputStream)

        // then
        assertThat(project).isNotNull
        assertThat(project!!.projectName).isEqualTo("201701poolobject")
        assertThat(project.size).isEqualTo(6)
    }

    @Test
    fun `should deserialize project from cc json gz with api version greater or equal than 1_3`() {
        // given
        val expectedInputStream = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_JSON_GZ_VERSION_1_3)!!

        // when
        val project = ProjectDeserializer.deserializeProject(expectedInputStream)

        // then
        assertThat(project).isNotNull
        assertThat(project!!.projectName).isEqualTo("201701poolobject")
        assertThat(project.size).isEqualTo(6)
    }

    @Test
    fun `should not create deserialized project when input is not valid project`() {
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
}
