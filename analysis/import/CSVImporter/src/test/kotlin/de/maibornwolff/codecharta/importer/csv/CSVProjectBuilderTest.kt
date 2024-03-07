package de.maibornwolff.codecharta.importer.csv

import de.maibornwolff.codecharta.model.AttributeDescriptor
import org.junit.jupiter.api.Test
import java.io.ByteArrayInputStream
import java.io.InputStream
import java.nio.charset.StandardCharsets
import kotlin.test.assertEquals

class CSVProjectBuilderTest {

    private fun toInputStream(content: String): InputStream {
        return ByteArrayInputStream(content.toByteArray(StandardCharsets.UTF_8))
    }

    @Test
    fun `ignore invalid csv content`() {
        val csvProjectBuilder = CSVProjectBuilder('\\', ',')
        val invalidContent = "head,path\nnoValidContent\n"
        val project = csvProjectBuilder
            .parseCSVStream(toInputStream(invalidContent))
            .build()

        assertEquals(project.rootNode.children.size, 0)
    }

    @Test
    fun `adding valid csv with unix line breaks`() {
        val csvProjectBuilder = CSVProjectBuilder('\\', ',')
        val name = "someName"
        val project = csvProjectBuilder.parseCSVStream(
            toInputStream("someContent,,path\nprojectName,foo,$name")
        )
            .build()
        val childName = project.rootNode.children.map { it.name }

        assertEquals(childName[0], name)
    }

    @Test
    fun `adding valid csv with windows line breaks`() {
        val csvProjectBuilder = CSVProjectBuilder('\\', ',')
        val name = "someName"
        val project = csvProjectBuilder.parseCSVStream(
            toInputStream("someContent,,path\r\nprojectName,foo,$name")
        )
            .build()
        val childName = project.rootNode.children.map { it.name }

        assertEquals(childName[0], name)
    }

    @Test
    fun `adding line with metric values`() {
        val csvProjectBuilder = CSVProjectBuilder('\\', ',')
        val attributeName = "attributeName"
        val attributeValue = "\"0,1\""
        val attributeValueFloat = 0.1

        val project = csvProjectBuilder.parseCSVStream(
            toInputStream(
                "head1,path,head3,head4,$attributeName\nprojectName,\"9900,01\",\"foo\",1.0,$attributeValue\n"
            )
        )
            .build()

        val nodeAttributes = project.rootNode.children.iterator().next().attributes

        assertEquals(nodeAttributes.size, 3)
        assertEquals(nodeAttributes[attributeName], attributeValueFloat)
    }

    @Test
    fun `adding file with subdirectory`() {
        val csvProjectBuilder = CSVProjectBuilder('\\', ',')
        val directoryName = "someNodeName"
        val project = csvProjectBuilder
            .parseCSVStream(toInputStream("someContent\n$directoryName\\someFile"))
            .build()

        assertEquals(project.rootNode.children.size, 1)

        val node = project.rootNode.children.iterator().next()

        assertEquals(node.name, directoryName)
        assertEquals(node.children.size, 1)
    }

    @Test
    fun `reading csv lines from Sourcemonitor`() {
        val csvProjectBuilder = CSVProjectBuilder(
            '\\',
            ',',
            "File Name"
        )
        val project = csvProjectBuilder
            .parseCSVStream(this.javaClass.classLoader.getResourceAsStream("sourcemonitor.csv")!!)
            .build()

        assertEquals(39, project.size)
    }

    @Test
    fun `when importing a valid csv file then appropriate attribute descriptors have been added`() {
        val attributeDescriptors = mapOf("Test" to AttributeDescriptor(description = "123", direction = -1))
        val csvProjectBuilder = CSVProjectBuilder(
            '\\',
            ',',
            "File Name",
            attributeDescriptors = attributeDescriptors
        )
        val attributeName = "Test"
        val attributeValue = "\"0,1\""

        val project = csvProjectBuilder.parseCSVStream(
            toInputStream(
                "head1,path,head3,head4,$attributeName\nprojectName,\"9900,01\",\"foo\",1.0,$attributeValue\n"
            )
        ).build()

        assertEquals(project.attributeDescriptors.size, 1)
        assertEquals(project.attributeDescriptors["Test"]!!.description, "123")
    }
}
