package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.*
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.DetailedSourceProviderStub.Companion.javaLocationResolverFromResource
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.calculateDetailedMetrics
import org.junit.Test
import java.io.IOException

class EnumTest {

    @Test
    @Throws(IOException::class)
    fun enum_example_1_has_correct_rloc_count() {
        val name = "Enum1.java"
        val location = "$extractBaseFolder/java"
        val locationResolverStub = javaLocationResolverFromResource(name, location)

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics){ it.sum[MetricType.RLoc]}.isEqualTo(7)
    }

    @Test
    @Throws(IOException::class)
    fun enum_example_2_has_correct_rloc_count() {
        val name = "Enum2.java"
        val location = "$extractBaseFolder/java"
        val locationResolverStub = javaLocationResolverFromResource(name, location)

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics){ it.sum[MetricType.RLoc]}.isEqualTo(9)
    }

}