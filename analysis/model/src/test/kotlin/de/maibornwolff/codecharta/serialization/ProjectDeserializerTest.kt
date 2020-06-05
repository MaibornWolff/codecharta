package de.maibornwolff.codecharta.serialization

import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.*
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import java.io.StringReader

class ProjectDeserializerTest: Spek({
    val EXAMPLE_CC_JSON = "example.cc.json"

    describe("A ProjectDeserializer") {
        it("should deserialize project cc json") {
            val expectedJsonReader = this.javaClass.classLoader.getResourceAsStream(EXAMPLE_CC_JSON).reader()

            val project = ProjectDeserializer.deserializeProject(expectedJsonReader)

            assertThat(project.projectName, `is`("201701poolobject"))
            assertThat(project.size, `is`(6))
        }
    }

    describe("A ProjectDeserializer") {
        it("should map nonexisting values to defaults") {
            // given
            val jsonString = "{projectName='some Project', apiVersion='1.0', nodes=[{name:'root',type:'Folder'}]}"

            // when
            val project = ProjectDeserializer.deserializeProject(StringReader(jsonString))

            // then
            val node = project.rootNode

            assertThat(node.link, nullValue())
            assertThat(node.attributes, not(nullValue()))
            assertThat(node.children, not(nullValue()))
        }
    }
})
