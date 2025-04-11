package de.maibornwolff.codecharta.analysers.importers.csv

import de.maibornwolff.codecharta.model.AttributeDescriptor
import org.assertj.core.api.Assertions.assertThat
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
    fun `it should ignore invalid csv content`() { // given
        val csvProjectBuilder = CSVProjectBuilder(pathSeparator = '\\', csvDelimiter = ',')
        val invalidContent = "head,path\nnoValidContent\n"

        // when
        csvProjectBuilder.parseCSVStream(toInputStream(invalidContent))
        val project = csvProjectBuilder.build()

        // then
        assertEquals(project.rootNode.children.size, 0)
    }

    @Test
    fun `it should read the csv content correctly when csv contains unix line-breaks`() { // given
        val name = "someName"
        val csvHeader = "someContent,,path"
        val csvRow = "projectName,foo,"

        // when
        val csvProjectBuilder = CSVProjectBuilder(pathSeparator = '\\', csvDelimiter = ',')
        csvProjectBuilder.parseCSVStream(toInputStream("$csvHeader\n$csvRow$name"))
        val project = csvProjectBuilder.build()
        val childName = project.rootNode.children.map { it.name }

        // then
        assertEquals(childName[0], name)
    }

    @Test
    fun `it should read the csv content correctly when csv contains windows line-breaks`() { // given
        val name = "someName"
        val csvHeader = "someContent,,path"
        val csvRow = "projectName,foo,"

        // when
        val csvProjectBuilder = CSVProjectBuilder(pathSeparator = '\\', csvDelimiter = ',')
        csvProjectBuilder.parseCSVStream(toInputStream("$csvHeader\r\n$csvRow$name"))
        val project = csvProjectBuilder.build()
        val childName = project.rootNode.children.map { it.name }

        // then
        assertEquals(childName[0], name)
    }

    @Test
    fun `it should add a line with metric values correctly`() { // given
        val attributeName = "attributeName"
        val attributeValue = "\"0,1\""
        val attributeValueFloat = 0.1
        val csvHeader = "head1,path,head3,head4,$attributeName"
        val csvRow = "projectName,\"9900,01\",\"foo\",1.0,$attributeValue"

        // when
        val csvProjectBuilder = CSVProjectBuilder(pathSeparator = '\\', csvDelimiter = ',')
        csvProjectBuilder.parseCSVStream(toInputStream("$csvHeader\n$csvRow\n"))
        val project = csvProjectBuilder.build()
        val nodeAttributes = project.rootNode.children.iterator().next().attributes

        // then
        assertEquals(nodeAttributes.size, 3)
        assertEquals(nodeAttributes[attributeName], attributeValueFloat)
    }

    @Test
    fun `it should handle a csv-file with a subdirectory structure correctly`() { // given
        val directoryName = "someNodeName"

        // when
        val csvProjectBuilder =
            CSVProjectBuilder(
                pathSeparator = '\\',
                csvDelimiter = ','
            )
        csvProjectBuilder.parseCSVStream(toInputStream("someContent\n$directoryName\\someFile"))
        val project = csvProjectBuilder.build()

        // then
        assertEquals(project.rootNode.children.size, 1)
        val node = project.rootNode.children.iterator().next()
        assertEquals(node.name, directoryName)
        assertEquals(node.children.size, 1)
    }

    @Test
    fun `it should read csv files exported from source-monitor correctly`() {
        // when
        val csvProjectBuilder =
            CSVProjectBuilder(
                pathSeparator = '\\',
                csvDelimiter = ',',
                pathColumnName = "File Name"
            )
        csvProjectBuilder.parseCSVStream(this.javaClass.classLoader.getResourceAsStream("sourcemonitor.csv")!!)
        val project = csvProjectBuilder.build()

        // then
        assertEquals(39, project.size)
    }

    @Test
    fun `it should correctly set the attribute-descriptors when importing a valid csv file`() { // given
        val attributeName = "Test"
        val attributeValue = "10"
        val attributeDescriptors = mapOf("Test" to AttributeDescriptor(description = "123", direction = -1))

        // when
        val csvProjectBuilder =
            CSVProjectBuilder(
                pathSeparator = '\\',
                csvDelimiter = ',',
                pathColumnName = "Non-existent column",
                attributeDescriptors = attributeDescriptors
            )
        val csvHeader = "head1,path,head3,head4,$attributeName"
        val csvRow = "invalidValue, 10, invalidValue, 10, $attributeValue"
        csvProjectBuilder.parseCSVStream(toInputStream("$csvHeader\n$csvRow\n"))
        val project = csvProjectBuilder.build()

        // then
        assertThat(project.attributeDescriptors.size).isEqualTo(3)
        assertThat(project.attributeDescriptors["path"]).isNotNull()
        assertThat(project.attributeDescriptors["head4"]).isNotNull()
        assertThat(project.attributeDescriptors["Test"]?.description).isEqualTo("123")
    }
}
