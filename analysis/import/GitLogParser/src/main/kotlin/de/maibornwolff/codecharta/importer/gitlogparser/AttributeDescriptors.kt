package de.maibornwolff.codecharta.importer.gitlogparser

import de.maibornwolff.codecharta.model.AttributeDescriptor

fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val descriptors = mutableMapOf<String, AttributeDescriptor>()
    val ghLink = "https://maibornwolff.github.io/codecharta/docs/git-log-parser"
    descriptors["number_of_authors"] = AttributeDescriptor(description = "Number of authors", link = ghLink)
    descriptors["number_of_commits"] = AttributeDescriptor(description = "Number of commits", link = ghLink)
    descriptors["range_of_weeks_with_commits"] = AttributeDescriptor(description = "Average number of weeks between commits", link = ghLink)
    descriptors["weeks_with_commits"] = AttributeDescriptor(description = "Number of weeks in which commits occurred", link = ghLink)
    descriptors["highly_coupled_files"] = AttributeDescriptor(description = "Number of highly coupled files (>=35% of times modified the same time) with this file", link = ghLink)
    descriptors["median_coupled_files"] = AttributeDescriptor(description = "Median of number of other files that where committed with this file", link = ghLink)
    descriptors["number_of_renames"] = AttributeDescriptor(description = "Number of renames", link = ghLink)
    descriptors["age_in_weeks"] = AttributeDescriptor(description = "Age in weeks", link = ghLink)

    return descriptors.toMap()
}
