package de.maibornwolff.codecharta.importer.gitlogparser

import de.maibornwolff.codecharta.model.AttributeDescriptor

fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val descriptors = mutableMapOf<String, AttributeDescriptor>()
    val ghLink = "https://maibornwolff.github.io/codecharta/docs/git-log-parser"
    descriptors["number_of_authors"] = AttributeDescriptor(title = "Number of Authors", description = "Number of authors", link = ghLink)
    descriptors["number_of_commits"] = AttributeDescriptor(title = "Number of Commits", description = "Number of commits", link = ghLink)
    descriptors["range_of_weeks_with_commits"] = AttributeDescriptor(title = "Week Range of Commits", description = "Average number of weeks between commits", link = ghLink)
    descriptors["weeks_with_commits"] = AttributeDescriptor(title = "Weeks with Commits", description = "Number of weeks in which commits occurred", link = ghLink)
    descriptors["highly_coupled_files"] = AttributeDescriptor(title = "Highly Coupled Files", description = "Number of highly coupled files (>=35% of times modified the same time) with this file", link = ghLink)
    descriptors["median_coupled_files"] = AttributeDescriptor(title = "Median Coupled Files", description = "Median of number of other files that where committed with this file", link = ghLink)
    descriptors["number_of_renames"] = AttributeDescriptor(title = "Number of Renames", description = "Number of file renames", link = ghLink)
    descriptors["age_in_weeks"] = AttributeDescriptor(title = "Age in Weeks", description = "File age in weeks", link = ghLink)

    return descriptors.toMap()
}
