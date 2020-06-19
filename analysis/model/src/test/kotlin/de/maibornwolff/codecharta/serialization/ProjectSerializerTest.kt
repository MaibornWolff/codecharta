package de.maibornwolff.codecharta.serialization

import com.google.gson.JsonParser
import com.natpryce.hamkrest.describe
import de.maibornwolff.codecharta.model.Project
import io.mockk.mockk
import org.hamcrest.BaseMatcher
import org.hamcrest.Description
import org.hamcrest.Matcher
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe
import java.io.File
import kotlin.test.assertTrue

class ProjectSerializerTest : Spek({

    fun matchesProjectFile(expectedProjectFile: File): Matcher<File> {
        return object : BaseMatcher<File>() {

            override fun describeTo(description: Description) {
                description.appendText("should be ").appendValue(expectedProjectFile.readLines())
            }

            override fun describeMismatch(item: Any, description: Description) {
                description.appendText("was").appendValue((item as File).readLines())
            }

            override fun matches(item: Any): Boolean {
                return fileContentEqual(item as File, expectedProjectFile)
            }

            private fun fileContentEqual(actual: File, expected: File): Boolean {
                val parser = JsonParser()
                val actualJson = parser.parse(actual.reader())
                val expectedJson = parser.parse(expected.reader())
                return actualJson == expectedJson
            }
        }
    }

    describe("serializeAsCompressedFile") {
        val project = mockk<Project>()
        it("should create a gz file") {
            ProjectSerializer.serializeAsCompressedFile(project, "test.cc.json")
            assertTrue { File("test.cc.json.gz").exists() }
            File("test.cc.json.gz").delete()
        }
}
})
