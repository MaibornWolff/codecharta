package de.maibornwolff.codecharta.analysers.importers.dependacharta

import de.maibornwolff.codecharta.model.AttributeDescriptor

internal fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val analyzerName = setOf("dependaChartaImporter")
    return mapOf(
        DcJsonParser.DEPENDENCIES to
            AttributeDescriptor(
                title = "Dependencies",
                description = "Number of code-level dependency links between two files",
                hintLowValue = "Few dependencies between the files",
                hintHighValue = "Many dependencies between the files",
                link = "",
                direction = -1,
                analyzers = analyzerName
            ),
        DcJsonParser.OUTGOING_DEPENDENCIES to
            AttributeDescriptor(
                title = "Outgoing Dependencies",
                description = "Number of code-level dependency links from this file to other files",
                hintLowValue = "This file depends on little other code",
                hintHighValue = "This file depends on much other code",
                link = "",
                direction = -1,
                analyzers = analyzerName
            ),
        DcJsonParser.INCOMING_DEPENDENCIES to
            AttributeDescriptor(
                title = "Incoming Dependencies",
                description = "Number of code-level dependency links from other files to this file",
                hintLowValue = "Few files depend on this file",
                hintHighValue = "Many files depend on this file",
                link = "",
                direction = -1,
                analyzers = analyzerName
            )
    )
}
