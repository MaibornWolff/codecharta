package de.maibornwolff.codecharta.analysers.importers.coverage.strategies

import de.maibornwolff.codecharta.model.AttributeDescriptor
import de.maibornwolff.codecharta.model.AttributeType

val analyzerName = setOf("coverageImporter")

enum class CoverageAttributes(val attributeName: String, val attributeDescriptor: AttributeDescriptor, val attributeType: AttributeType) {
    LINE_COVERAGE(
        "line_coverage",
        AttributeDescriptor(
            title = "Line Coverage",
            description = "Percentage of lines covered by tests",
            direction = 1,
            analyzers = analyzerName
        ),
        AttributeType.RELATIVE
    ),
    BRANCH_COVERAGE(
        "branch_coverage",
        AttributeDescriptor(
            title = "Branch Coverage",
            description = "Percentage of branches covered by tests",
            direction = 1,
            analyzers = analyzerName
        ),
        AttributeType.RELATIVE
    ),
    STATEMENT_COVERAGE(
        "statement_coverage",
        AttributeDescriptor(
            title = "Statement Coverage",
            description = "Percentage of statements covered by tests",
            direction = 1,
            analyzers = analyzerName
        ),
        AttributeType.RELATIVE
    ),
    INSTRUCTION_COVERAGE(
        "instruction_coverage",
        AttributeDescriptor(
            title = "Instruction Coverage",
            description = "Percentage of instructions covered by tests",
            direction = 1,
            analyzers = analyzerName
        ),
        AttributeType.RELATIVE
    ),
    COMPLEXITY_COVERAGE(
        "complexity_coverage",
        AttributeDescriptor(
            title = "Complexity Coverage",
            description = "Percentage of complexity covered by tests",
            direction = 1,
            analyzers = analyzerName
        ),
        AttributeType.RELATIVE
    ),
    METHOD_COVERAGE(
        "method_coverage",
        AttributeDescriptor(
            title = "Method Coverage",
            description = "Percentage of methods covered by tests",
            direction = 1,
            analyzers = analyzerName
        ),
        AttributeType.RELATIVE
    ),
    CLASS_COVERAGE(
        "class_coverage",
        AttributeDescriptor(
            title = "Class Coverage",
            description = "Percentage of classes covered by tests",
            direction = 1,
            analyzers = analyzerName
        ),
        AttributeType.RELATIVE
    )
}
