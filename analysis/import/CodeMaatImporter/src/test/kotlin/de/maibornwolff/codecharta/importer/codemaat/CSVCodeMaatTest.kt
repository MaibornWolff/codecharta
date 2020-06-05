package de.maibornwolff.codecharta.importer.codemaat

import de.maibornwolff.codecharta.model.Edge
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.`is`
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe

class CSVCodeMaatTest: Spek({

    describe("CSVProjectBuilder for CodeMaat") {
        val csvProjectBuilder = CSVProjectBuilder('\\', ',',
                MetricNameTranslator(mapOf(Pair("File Name", "path"))))

        context("reading csv lines from CodeMaat") {
            val project = csvProjectBuilder
                    .parseCSVStream(this.javaClass.classLoader.getResourceAsStream("coupling-codemaat.csv"))
                    .build()

            it("has correct number of nodes") {
                assertThat(project.size, `is`(1))
            }

            it("has correct number of edges") {
                assertThat(project.sizeOfEdges(), `is`(164))
            }

            it("specific edge exists and has correct attribute values") {
                val edge = getChildByName(project.edges, "/root/analysis/build.gradle",
                        "/root/analysis/model/build.gradle")
                val pairingRate = getAttributeValue(edge.attributes, "degree")
                val avgCommits = getAttributeValue(edge.attributes, "average-revs")

                assertThat(edge.attributes.size, `is`(2))
                assertThat(pairingRate, `is`(43))
                assertThat(avgCommits, `is`(12))
            }
        }
    }

})

fun getChildByName(edges: List<Edge>, fromNodeName: String, toNodeName: String): Edge {
    edges.forEach {
        if (it.fromNodeName == fromNodeName && it.toNodeName == toNodeName) return it
    }
    return Edge(fromNodeName, toNodeName)
}

fun getAttributeValue(attributes: Map<String, Any>, attributeName: String): Int {
    return attributes.filterKeys { s: String -> s == attributeName }[attributeName].toString().toInt()
}