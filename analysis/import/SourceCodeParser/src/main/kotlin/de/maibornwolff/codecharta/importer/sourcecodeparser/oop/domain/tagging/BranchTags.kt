package de.maibornwolff.codecharta.importer.sourcecodeparser.oop.domain.tagging

// ELSE is not a branch tag, it is the regular control flow without the if
enum class BranchTags : CodeTags {
    CASE,
    CONDITION, OR_CONDITION, AND_CONDITION, TERNARY_CONDITION,
    CATCH
}