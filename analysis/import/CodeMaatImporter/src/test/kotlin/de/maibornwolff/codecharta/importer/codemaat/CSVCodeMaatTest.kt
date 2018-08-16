package de.maibornwolff.codecharta.importer.codemaat

import de.maibornwolff.codecharta.translator.MetricNameTranslator
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.*
import org.jetbrains.spek.api.Spek
import org.jetbrains.spek.api.dsl.describe
import org.jetbrains.spek.api.dsl.it
import org.jetbrains.spek.api.dsl.on


class CSVCodeMaatTest : Spek ({

    describe("CSVProjectBuilder for CodeMaat") {
        val csvProjectBuilder = CSVProjectBuilder("test", '\\', ',',
                MetricNameTranslator(mapOf(Pair("File Name", "path"))))

        on("reading csv lines from CodeMaat") {
            val project = csvProjectBuilder
                    .parseCSVStream(this.javaClass.classLoader.getResourceAsStream("coupling-codemaat.csv"))
                    .build()

            it("has correct number of nodes") {
                assertThat(project.size, `is`(1))
            }

            it("has correct number of edges") {
                assertThat(project.sizeOfEdges(), `is`(164))
            }
        }
    }

})