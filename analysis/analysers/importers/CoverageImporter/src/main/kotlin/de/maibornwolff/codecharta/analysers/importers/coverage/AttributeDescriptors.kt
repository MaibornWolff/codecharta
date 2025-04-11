package de.maibornwolff.codecharta.analysers.importers.coverage

import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypes

enum class CoverageAttributes(
    val attributeName: String,
    val attributeDescriptor: AttributeDescriptor,
    val attributeType: AttributeType
) {
    LINE_COVERAGE(
        "line_coverage",
        AttributeDescriptor(
            title = "Line Coverage",
            description = "Percentage of lines covered by tests",
            direction = 1
        ),
        AttributeType.RELATIVE
    ),
    BRANCH_COVERAGE(
        "branch_coverage",
        AttributeDescriptor(
            title = "Branch Coverage",
            description = "Percentage of branches covered by tests",
            direction = 1
        ),
        AttributeType.RELATIVE
    ),
    STATEMENT_COVERAGE(
        "statement_coverage",
        AttributeDescriptor(
            title = "Statement Coverage",
            description = "Percentage of statements covered by tests",
            direction = 1
        ),
        AttributeType.RELATIVE
    ),
    INSTRUCTION_COVERAGE(
        "instruction_coverage",
        AttributeDescriptor(
            title = "Instruction Coverage",
            description = "Percentage of instructions covered by tests",
            direction = 1
        ),
        AttributeType.RELATIVE
    ),
    COMPLEXITY_COVERAGE(
        "complexity_coverage",
        AttributeDescriptor(
            title = "Complexity Coverage",
            description = "Percentage of complexity covered by tests",
            direction = 1
        ),
        AttributeType.RELATIVE
    ),
    METHOD_COVERAGE(
        "method_coverage",
        AttributeDescriptor(
            title = "Method Coverage",
            description = "Percentage of methods covered by tests",
            direction = 1
        ),
        AttributeType.RELATIVE
    ),
    CLASS_COVERAGE(
        "class_coverage",
        AttributeDescriptor(
            title = "Class Coverage",
            description = "Percentage of classes covered by tests",
            direction = 1
        ),
        AttributeType.RELATIVE
    )
}

internal fun getAttributeDescriptors(language: Language? = null): Map<String, AttributeDescriptor> {
    if (language == null) {
        return CoverageAttributes.entries.associateBy({ it.attributeName }, { it.attributeDescriptor })
    }

    return language.coverageAttributes.associateBy({ it.attributeName }, { it.attributeDescriptor })
}

internal fun getAttributeTypes(language: Language): AttributeTypes {
    val attributeTypes: MutableMap<String, AttributeType> =
        language.coverageAttributes.associateBy(
            { it.attributeName },
            { it.attributeType }
        ) as MutableMap<String, AttributeType>
    return AttributeTypes(attributeTypes = attributeTypes, type = "nodes")
}
