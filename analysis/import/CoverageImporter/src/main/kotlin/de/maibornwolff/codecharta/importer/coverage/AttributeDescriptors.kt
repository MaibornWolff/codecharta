package de.maibornwolff.codecharta.importer.coverage

import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeType
import de.maibornwolff.codecharta.model.AttributeTypes

enum class CoverageAttributes(val attributeName: String) {
    LINE_COVERAGE("line_coverage"),
    BRANCH_COVERAGE("branch_coverage"),
    STATEMENT_COVERAGE("statement_coverage"),
    INSTRUCTION_COVERAGE("instruction_coverage"),
    COMPLEXITY_COVERAGE("complexity_coverage"),
    METHOD_COVERAGE("method_coverage"),
    CLASS_COVERAGE("class_coverage")
}

fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    return mapOf(
        CoverageAttributes.LINE_COVERAGE.attributeName to AttributeDescriptor(
            title = "Line Coverage",
            description = "Percentage of lines covered by tests",
            direction = 1
        ),
        CoverageAttributes.BRANCH_COVERAGE.attributeName to AttributeDescriptor(
            title = "Branch Coverage",
            description = "Percentage of branches covered by tests",
            direction = 1
        ),
        CoverageAttributes.STATEMENT_COVERAGE.attributeName to AttributeDescriptor(
            title = "Statement Coverage",
            description = "Percentage of statements covered by tests",
            direction = 1
        ),
        CoverageAttributes.INSTRUCTION_COVERAGE.attributeName to AttributeDescriptor(
            title = "Instruction Coverage",
            description = "Percentage of instructions covered by tests",
            direction = 1
        ),
        CoverageAttributes.COMPLEXITY_COVERAGE.attributeName to AttributeDescriptor(
            title = "Complexity Coverage",
            description = "Percentage of complexity covered by tests",
            direction = 1
        ),
        CoverageAttributes.METHOD_COVERAGE.attributeName to AttributeDescriptor(
            title = "Method Coverage",
            description = "Percentage of methods covered by tests",
            direction = 1
        ),
        CoverageAttributes.CLASS_COVERAGE.attributeName to AttributeDescriptor(
            title = "Class Coverage",
            description = "Percentage of classes covered by tests",
            direction = 1
        )
    )
}

fun getAttributeTypes(): AttributeTypes {
    return AttributeTypes(type = "nodes")
        .add(CoverageAttributes.LINE_COVERAGE.attributeName, AttributeType.RELATIVE)
        .add(CoverageAttributes.BRANCH_COVERAGE.attributeName, AttributeType.RELATIVE)
        .add(CoverageAttributes.STATEMENT_COVERAGE.attributeName, AttributeType.RELATIVE)
        .add(CoverageAttributes.INSTRUCTION_COVERAGE.attributeName, AttributeType.RELATIVE)
        .add(CoverageAttributes.COMPLEXITY_COVERAGE.attributeName, AttributeType.RELATIVE)
        .add(CoverageAttributes.METHOD_COVERAGE.attributeName, AttributeType.RELATIVE)
        .add(CoverageAttributes.CLASS_COVERAGE.attributeName, AttributeType.RELATIVE)
}
