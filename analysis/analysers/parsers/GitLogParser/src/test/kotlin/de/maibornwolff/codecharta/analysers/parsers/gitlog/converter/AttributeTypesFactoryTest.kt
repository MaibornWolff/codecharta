package de.maibornwolff.codecharta.analysers.parsers.gitlog.converter

import de.maibornwolff.codecharta.analysers.parsers.gitlog.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.model.AttributeType
import org.assertj.core.api.Assertions
import org.junit.jupiter.api.Test

class AttributeTypesFactoryTest {
    @Test
    fun `gets type for node attributes is correct`() {
        val metrics = MetricsFactory(listOf("added_lines", "age_in_weeks")).createMetrics()

        val attributeTypes = AttributeTypesFactory.createNodeAttributeTypes(metrics)

        Assertions.assertThat(attributeTypes.type).isEqualTo("nodes")
    }

    @Test
    fun `gets attributeTypes for specified metrics`() {
        val metrics = MetricsFactory(listOf("added_lines", "age_in_weeks")).createMetrics()

        val attributeTypes = AttributeTypesFactory.createNodeAttributeTypes(metrics)

        Assertions.assertThat(attributeTypes.attributeTypes).containsKeys("added_lines", "age_in_weeks")
        Assertions.assertThat(attributeTypes.attributeTypes)
            .isEqualTo(mapOf("added_lines" to AttributeType.ABSOLUTE, "age_in_weeks" to AttributeType.RELATIVE))
    }

    @Test
    fun `gets type for edge attributes is correct`() {
        val metrics = MetricsFactory().createMetrics()

        val attributeTypes = AttributeTypesFactory.createEdgeAttributeTypes(metrics)

        Assertions.assertThat(attributeTypes.type).isEqualTo("edges")
    }

    @Test
    fun `gets attributeTypes for edge metrics`() {
        val metrics = MetricsFactory(listOf("highly_coupled_files")).createMetrics()

        val attributeTypes = AttributeTypesFactory.createEdgeAttributeTypes(metrics)

        Assertions.assertThat(attributeTypes.attributeTypes)
            .isEqualTo(mapOf("temporal_coupling" to AttributeType.ABSOLUTE))
    }

    @Test
    fun `handles null values for edge attributeTypes correctly`() {
        val metrics = MetricsFactory(listOf("added_lines")).createMetrics()

        val attributeTypes = AttributeTypesFactory.createEdgeAttributeTypes(metrics)

        Assertions.assertThat(attributeTypes.attributeTypes).isEmpty()
    }
}
