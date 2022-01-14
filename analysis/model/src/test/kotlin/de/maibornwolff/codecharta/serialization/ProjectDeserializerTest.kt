package de.maibornwolff.codecharta.serialization

import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.`is`
import org.hamcrest.Matchers.not
import org.hamcrest.Matchers.nullValue
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import java.io.StringReader

class ProjectDeserializerTest : Spek({
    val EXAMPLE_JSON_VERSION_1_0 = "example.cc.json"
    val EXAMPLE_JSON_VERSION_1_3 = "example_api_version_1.3.cc.json"

    describe("A ProjectDeserializer") {
        it("should deserialize project from cc json with api version 1.2 or lower") {
            val expectedJsonReader = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_JSON_VERSION_1_0).reader()

            val project = ProjectDeserializer.deserializeProject(expectedJsonReader)

            assertThat(project.projectName, `is`("201701poolobject"))
            assertThat(project.size, `is`(6))
        }

        it("should deserialize project from cc json with api version greater or equal than 1.3") {
            val expectedJsonReader = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_JSON_VERSION_1_3).reader()

            val project = ProjectDeserializer.deserializeProject(expectedJsonReader)

            assertThat(project.projectName, `is`("201701poolobject"))
            assertThat(project.size, `is`(6))
        }

        it("should deserialize project from cc json string with api version 1.2 or lower") {
            val expectedJsonString = this.javaClass.classLoader.getResource(EXAMPLE_JSON_VERSION_1_0).readText()

            val project = ProjectDeserializer.deserializeProject(expectedJsonString)

            assertThat(project.projectName, `is`("201701poolobject"))
            assertThat(project.size, `is`(6))
        }

        it("should deserialize project from cc json string with api version greater or equal than 1.3") {
            val expectedJsonReader = this.javaClass.classLoader.getResource(EXAMPLE_JSON_VERSION_1_3).readText()

            val project = ProjectDeserializer.deserializeProject(expectedJsonReader)

            assertThat(project.projectName, `is`("201701poolobject"))
            assertThat(project.size, `is`(6))
        }

        it("should deserialize project from json string and set nonexisting values to defaults") {
            val jsonString = "{projectName='some Project', apiVersion='1.0', nodes=[{name:'root',type:'Folder'}]}"

            val project = ProjectDeserializer.deserializeProject(StringReader(jsonString))
            val node = project.rootNode

            assertThat(node.link, nullValue())
            assertThat(node.attributes, not(nullValue()))
            assertThat(node.children, not(nullValue()))
        }
    }
})
