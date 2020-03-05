package de.maibornwolff.codecharta.importer.scmlogparser.converter

import de.maibornwolff.codecharta.importer.scmlogparser.input.metrics.MetricsFactory
import de.maibornwolff.codecharta.model.AttributeType
import org.assertj.core.api.Assertions
import org.junit.Test

class AttributeTypeBuilderTest {

    @Test
    fun `gets type for node attributes is correct`() {
        val metrics = MetricsFactory(listOf("added_lines", "age_in_weeks")).createMetrics()

        val attributeTypes = AttributeTypeBuilder.createNodeAttributeTypes(metrics)

        Assertions.assertThat(attributeTypes.type).isEqualTo("nodes")
    }

    @Test
    fun `gets attributeTypes for specified metrics`() {
        val metrics = MetricsFactory(listOf("added_lines", "age_in_weeks")).createMetrics()

        val attributeTypes = AttributeTypeBuilder.createNodeAttributeTypes(metrics)

        Assertions.assertThat(attributeTypes.attributeTypes).containsKeys("added_lines", "age_in_weeks")
        Assertions.assertThat(attributeTypes.attributeTypes).isEqualTo(mapOf("added_lines" to AttributeType.absolute, "age_in_weeks" to AttributeType.relative))
    }

    @Test
    fun `gets type for edge attributes is correct`() {
        val metrics = MetricsFactory().createMetrics()

        val attributeTypes = AttributeTypeBuilder.createEdgeAttributeTypes(metrics)

        Assertions.assertThat(attributeTypes.type).isEqualTo("edges")
    }

    @Test
    fun `gets attributeTypes for edge metrics`() {
        val metrics = MetricsFactory(listOf("highly_coupled_files")).createMetrics()

        val attributeTypes = AttributeTypeBuilder.createEdgeAttributeTypes(metrics)

        Assertions.assertThat(attributeTypes.attributeTypes).isEqualTo(mapOf("temporal_coupling" to AttributeType.absolute))
    }

    @Test
    fun `handles null values for edge attributeTypes correctly`() {
        val metrics = MetricsFactory(listOf("added_lines")).createMetrics()

        val attributeTypes = AttributeTypeBuilder.createEdgeAttributeTypes(metrics)

        Assertions.assertThat(attributeTypes.attributeTypes).isEmpty()
    }
}