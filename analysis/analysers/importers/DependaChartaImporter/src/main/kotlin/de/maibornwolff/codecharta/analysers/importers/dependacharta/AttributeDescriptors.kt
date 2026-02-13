package de.maibornwolff.codecharta.analysers.importers.dependacharta

import de.maibornwolff.codecharta.model.AttributeDescriptor

internal fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val analyzerName = setOf("dependaChartaImporter")
    return mapOf(
        "dependencies" to
            AttributeDescriptor(
                title = "Dependencies",
                description = "Number of code-level dependency links between two files",
                hintLowValue = "Few dependencies between the files",
                hintHighValue = "Many dependencies between the files",
                link = "",
                direction = -1,
                analyzers = analyzerName
            )
    )
}
