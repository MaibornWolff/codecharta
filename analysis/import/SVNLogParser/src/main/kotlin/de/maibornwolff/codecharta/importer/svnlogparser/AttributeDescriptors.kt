package de.maibornwolff.codecharta.importer.svnlogparser

import de.maibornwolff.codecharta.model.AttributeDescriptor

fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val ghLink = "https://github.com/MaibornWolff/codecharta/blob/main/analysis/import/SVNLogParser/README.md"
    return mapOf(
        "age_in_weeks" to AttributeDescriptor(title = "Age in Weeks", description = "File age in weeks", link = ghLink),
        "number_of_authors" to AttributeDescriptor(title = "Number of Authors", description = "Number of authors", link = ghLink),
        "number_of_commits" to AttributeDescriptor(title = "Number of Commits", description = "Number of commits", link = ghLink),
        "number_of_renames" to AttributeDescriptor(title = "Number of Renames", description = "Number of file renames", link = ghLink),
        "range_of_weeks_with_commits" to AttributeDescriptor(title = "Week Range of Commits", description = "Average number of weeks between commits", link = ghLink),
        "successive_weeks_with_commits" to AttributeDescriptor(title = "Successive Weeks with Commits", description = "Number of successive weeks in which the file was included in a commit", link = ghLink),
        "weeks_with_commits" to AttributeDescriptor(title = "Weeks with Commits", description = "Number of weeks in which commits occurred", link = ghLink),
        "highly_coupled_files" to AttributeDescriptor(title = "Highly Coupled Files", description = "Number of highly coupled files (>=35% of times modified the same time) with this file", link = ghLink),
        "median_coupled_files" to AttributeDescriptor(title = "Median Coupled Files", description = "Median of number of other files that where committed with this file", link = ghLink),
        "temporal_coupling" to AttributeDescriptor(title = "Temporal Coupling", description = "The degree of temporal coupling between two files (>=35%)", link = ghLink),
    )
}
