package de.maibornwolff.codecharta.parser.svnlogparser.converter

import de.maibornwolff.codecharta.model.AttributeTypes
import de.maibornwolff.codecharta.parser.svnlogparser.input.metrics.Metric

object AttributeTypesFactory {
    fun createNodeAttributeTypes(metricList: List<Metric>): AttributeTypes {
        val attributeTypes = AttributeTypes(type = "nodes")
        metricList.forEach { metric ->
            attributeTypes.add(metric.metricName(), metric.attributeType())
        }
        return attributeTypes
    }

    fun createEdgeAttributeTypes(metricList: List<Metric>): AttributeTypes {
        val attributeTypes = AttributeTypes(type = "edges")
        metricList.forEach { metric ->
            val name = metric.edgeMetricName() ?: return@forEach
            val type = metric.edgeAttributeType() ?: return@forEach
            attributeTypes.add(name, type)
        }
        return attributeTypes
    }
}
