package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.metrics

import de.maibornwolff.codecharta.importer.sourcecodeparser.core.domain.metrics.MetricType
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.DetailedSourceProviderStub.Companion.javaLocationResolverFromResource
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.assertWithPrintOnFail
import de.maibornwolff.codecharta.importer.sourcecodeparser.oop.`~res`.extractBaseFolder
import de.maibornwolff.codecharta.importer.sourcecodeparser.orchestration.application.calculateDetailedMetrics
import org.junit.Test
import java.io.IOException

class NestedInterfaceTest {
    @Test
    @Throws(IOException::class)
    fun annotation_example_has_correct_rloc_count() {
        val name = "NestedInterface.java"
        val location = "$extractBaseFolder/java"
        val locationResolverStub = javaLocationResolverFromResource(name, location)

        val singleMetrics = calculateDetailedMetrics(locationResolverStub)

        assertWithPrintOnFail(singleMetrics) { it.sum[MetricType.RLoc]}.isEqualTo(4)
    }
}