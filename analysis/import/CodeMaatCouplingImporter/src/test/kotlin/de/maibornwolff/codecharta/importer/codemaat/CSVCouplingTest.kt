package de.maibornwolff.codecharta.importer.codemaat

import de.maibornwolff.codecharta.model.DependencyType
import de.maibornwolff.codecharta.translator.MetricNameTranslator
import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.*
import org.jetbrains.spek.api.Spek
import org.jetbrains.spek.api.dsl.describe
import org.jetbrains.spek.api.dsl.it
import org.jetbrains.spek.api.dsl.on


class CSVCouplingTest : Spek ({

    describe("CSVProjectBuilder for Coupling-CodeMaat") {
        val csvProjectBuilder = CSVProjectBuilder("test", '\\', ',',
                MetricNameTranslator(mapOf(Pair("File Name", "path"))))

        on("reading csv lines from Coupling-CodeMaat") {
            val project = csvProjectBuilder
                    .parseCSVStream(this.javaClass.classLoader.getResourceAsStream("coupling-codemaat.csv"))
                    .build()

            it("has correct number of nodes") {
                assertThat(project.size, `is`(1))
            }

            it("has correct number of temporal_coupling dependencies") {
                assertThat(project.sizeOfDependencies(DependencyType.TEMPORAL_COUPLING), `is`(164))
            }
        }
    }

})