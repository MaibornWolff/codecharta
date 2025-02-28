package de.maibornwolff.codecharta.importer.coverage

import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypes

fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    return mapOf(
        "line_coverage" to AttributeDescriptor(
            title = "Line Coverage",
            description = "Percentage of lines covered by tests",
            direction = 1
        ),
        "branch_coverage" to AttributeDescriptor(
            title = "Branch Coverage",
            description = "Percentage of branches covered by tests",
            direction = 1
        ),
        "statement_coverage" to AttributeDescriptor(
            title = "Statement Coverage",
            description = "Percentage of statements covered by tests",
            direction = 1
        )
    )
}

fun getAttributeTypes(): AttributeTypes {
    return AttributeTypes(type = "nodes")
        .add("line_coverage", AttributeType.RELATIVE)
        .add("branch_coverage", AttributeType.RELATIVE)
        .add("statement_coverage", AttributeType.RELATIVE)
}
