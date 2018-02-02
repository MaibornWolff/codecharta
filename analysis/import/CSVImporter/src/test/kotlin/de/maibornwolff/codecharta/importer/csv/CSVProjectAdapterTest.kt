package de.maibornwolff.codecharta.importer.csv

import org.junit.Test

import java.io.ByteArrayInputStream
import java.io.InputStream
import java.io.UnsupportedEncodingException
import java.nio.charset.StandardCharsets

import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.hasSize

class CSVProjectAdapterTest {
    private val project = CSVProjectAdapter("test", '\\', ',')

    private fun toInputStream(content: String): InputStream {
        return ByteArrayInputStream(content.toByteArray(StandardCharsets.UTF_8))
    }

    @Test
    @Throws(UnsupportedEncodingException::class)
    fun should_ignore_row_if_no_path_column_present() {
        // when
        project.addProjectFromCsv(toInputStream("head,path\nnoValidContent\n"))

        // then
        assertThat(project.rootNode.children, hasSize(0))
    }

    @Test
    @Throws(UnsupportedEncodingException::class)
    fun should_read_node_name_from_specified_path_column() {
        val name = "someName"
        // when
        project.addProjectFromCsv(toInputStream("someContent,,path\nprojectName,blubb2,$name"))

        // then
        val rootNode = project.rootNode.children
        assertThat(rootNode.size, `is`(1))
        assertThat(rootNode.iterator().next().name, `is`(name))
    }

    @Test
    @Throws(UnsupportedEncodingException::class)
    fun should_read_node_with_name_only_once() {
        val name = "someName"
        // when
        project.addProjectFromCsv(toInputStream("someContent\n" + name))
        project.addProjectFromCsv(toInputStream("someContent\n" + name))

        // then
        assertThat(project.rootNode.children.size, `is`(1))
    }

    @Test
    @Throws(UnsupportedEncodingException::class)
    fun should_create_nodes_for_directories() {
        // given
        val directoryName = "someNodeName"

        // when
        project.addProjectFromCsv(toInputStream("someContent\n$directoryName\\someFile"))

        // then
        assertThat(project.rootNode.children.size, `is`(1))
        val node = project.rootNode.children.iterator().next()
        assertThat(node.name, `is`(directoryName))
        assertThat(node.children.size, `is`(1))
    }

    @Test
    @Throws(UnsupportedEncodingException::class)
    fun should_read_node_attributes_if_metric_values() {
        // given
        val attribName = "attname"
        val attribVal = "\"0,1\""
        val attValFloat = 0.1f

        // when
        project.addProjectFromCsv(toInputStream("head1,path,head3,head4,$attribName\nprojectName,\"9900,01\",\"blubb\",1.0,$attribVal\n"))

        // then
        val nodeAttributes = project.rootNode.children.iterator().next().attributes
        assertThat(nodeAttributes.size, `is`(3))
        assertThat<Any>(nodeAttributes[attribName], `is`<Any>(attValFloat))
    }
}