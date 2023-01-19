package de.maibornwolff.codecharta.serialization

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.io.StringReader

class ProjectDeserializerTest {
    val EXAMPLE_JSON_VERSION_1_0 = "example.cc.json"
    val EXAMPLE_JSON_VERSION_1_3 = "example_api_version_1.3.cc.json"
    val EXAMPLE_JSON_GZ_VERSION_1_0 = "example.cc.json.gz"
    val EXAMPLE_JSON_GZ_VERSION_1_3 = "example_api_version_1.3.cc.json.gz"

    @Test
    fun `should deserialize project from cc json with api version 1_2 or lower`() {
        val expectedJsonReader = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_JSON_VERSION_1_0)!!.reader()

        val project = ProjectDeserializer.deserializeProject(expectedJsonReader)

        assertThat(project.projectName).isEqualTo("201701poolobject")
        assertThat(project.size).isEqualTo(6)
    }

    @Test
    fun `should deserialize project from cc json with api version greater or equal than 1_3`() {
        val expectedJsonReader = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_JSON_VERSION_1_3)!!.reader()

        val project = ProjectDeserializer.deserializeProject(expectedJsonReader)

        assertThat(project.projectName).isEqualTo("201701poolobject")
        assertThat(project.size).isEqualTo(6)
    }

    @Test
    fun `should deserialize project from cc json string with api version 1_2 or lower`() {
        val expectedJsonString = this.javaClass.classLoader.getResource(EXAMPLE_JSON_VERSION_1_0)!!.readText()

        val project = ProjectDeserializer.deserializeProject(expectedJsonString)

        assertThat(project.projectName).isEqualTo("201701poolobject")
        assertThat(project.size).isEqualTo(6)
    }

    @Test
    fun `should deserialize project from cc json string with api version greater or equal than 1_3`() {
        val expectedJsonReader = this.javaClass.classLoader.getResource(EXAMPLE_JSON_VERSION_1_3)!!.readText()

        val project = ProjectDeserializer.deserializeProject(expectedJsonReader)

        assertThat(project.projectName).isEqualTo("201701poolobject")
        assertThat(project.size).isEqualTo(6)
    }

    @Test
    fun `should deserialize project from json string and set nonexisting values to defaults`() {
        val jsonString = "{projectName='some Project', apiVersion='1.0', nodes=[{name:'root',type:'Folder'}]}"

        val project = ProjectDeserializer.deserializeProject(StringReader(jsonString))
        val node = project.rootNode

        assertThat(node.link).isNull()
        assertThat(node.attributes).isNotNull
        assertThat(node.children).isNotNull
    }

    @Test
    fun `should deserialize project from cc json gz with api version 1_2 or lower`() {
        val expectedInputStream = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_JSON_GZ_VERSION_1_0)!!
        val project = ProjectDeserializer.deserializeProject(expectedInputStream)
        assertThat(project).isNotNull
        assertThat(project!!.projectName).isEqualTo("201701poolobject")
        assertThat(project.size).isEqualTo(6)
    }

    @Test
    fun `should deserialize project from cc json gz with api version greater or equal than 1_3`() {
        val expectedInputStream = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_JSON_GZ_VERSION_1_3)!!

        val project = ProjectDeserializer.deserializeProject(expectedInputStream)
        assertThat(project).isNotNull
        assertThat(project!!.projectName).isEqualTo("201701poolobject")
        assertThat(project.size).isEqualTo(6)
    }
}
