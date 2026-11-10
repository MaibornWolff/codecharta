package de.maibornwolff.codecharta.analysers.parsers.dependency.output

import de.maibornwolff.codecharta.model.AttributeDescriptor

const val DEPENDENCIES = "dependencies"
const val OUTGOING_DEPENDENCIES = "outgoing_dependencies"
const val INCOMING_DEPENDENCIES = "incoming_dependencies"
const val TEST_FILE = "test_file"

internal val ANALYSER_NAME = setOf("dependencyParser")

fun dependencyAttributeDescriptors(): Map<String, AttributeDescriptor> = mapOf(
    DEPENDENCIES to
        AttributeDescriptor(
            title = "Dependencies",
            description = "Number of declaration-level dependencies between two files",
            hintLowValue = "Few dependencies between the files",
            hintHighValue = "Many dependencies between the files",
            link = "",
            direction = -1,
            analyzers = ANALYSER_NAME
        ),
    OUTGOING_DEPENDENCIES to
        AttributeDescriptor(
            title = "Outgoing Dependencies",
            description = "Number of declaration-level dependencies from this file to other files",
            hintLowValue = "This file depends on little other code",
            hintHighValue = "This file depends on much other code",
            link = "",
            direction = -1,
            analyzers = ANALYSER_NAME
        ),
    INCOMING_DEPENDENCIES to
        AttributeDescriptor(
            title = "Incoming Dependencies",
            description = "Number of declaration-level dependencies from other files to this file",
            hintLowValue = "Few files depend on this file",
            hintHighValue = "Many files depend on this file",
            link = "",
            direction = -1,
            analyzers = ANALYSER_NAME
        )
)

/** Only a run that links tests writes the metric, so only such a run describes it. */
fun testFileAttributeDescriptors(): Map<String, AttributeDescriptor> = mapOf(
    TEST_FILE to
        AttributeDescriptor(
            title = "Test File",
            description = "1 for a test file, 0 for any other file the dependency parser read",
            hintLowValue = "Code",
            hintHighValue = "A test",
            link = "",
            direction = 1,
            analyzers = ANALYSER_NAME
        )
)
