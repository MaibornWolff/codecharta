package de.maibornwolff.codecharta.analysers.importers.codemaat

import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class CSVProjectBuilderTest {
    private val csvProjectBuilder =
        CSVProjectBuilder(
            '\\',
            ',',
            MetricNameTranslator(mapOf(Pair("File Name", "path")))
        )

    private val inputStream =
        this.javaClass.classLoader.getResourceAsStream("coupling-codemaat.csv")!!
    private val project =
        csvProjectBuilder
            .parseCSVStream(inputStream)
            .build()

    @Test
    fun `should contain correct size of project and edge amount`() {
        assertEquals(project.size, 1)
        assertEquals(project.sizeOfEdges(), 164)
    }

    @Test
    fun `should contain specific edge and correct attributes`() {
        val edge =
            getChildByName(
                project.edges,
                "/root/analysis/build.gradle",
                "/root/analysis/model/build.gradle"
            )
        val pairingRate =
            getAttributeValue(edge.attributes, "degree")
        val avgCommits =
            getAttributeValue(edge.attributes, "average-revs")

        assertEquals(edge.attributes.size, 2)
        assertEquals(pairingRate, 43)
        assertEquals(avgCommits, 12)
    }

    private fun getChildByName(edges: List<Edge>, fromNodeName: String, toNodeName: String): Edge {
        edges.forEach {
            if (it.fromNodeName == fromNodeName && it.toNodeName == toNodeName) return it
        }
        return Edge(fromNodeName, toNodeName)
    }

    private fun getAttributeValue(attributes: Map<String, Any>, attributeName: String): Int {
        return attributes.filterKeys { s: String -> s == attributeName }[attributeName].toString().toInt()
    }
}
