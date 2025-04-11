package de.maibornwolff.codecharta.analysers.parsers.svnlog

import de.maibornwolff.codecharta.model.AttributeDescriptor

internal fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val ghLink = "https://codecharta.com/docs/parser/svn-log"
    return mapOf(
        "age_in_weeks" to
            AttributeDescriptor(
                title = "Age in Weeks", description = "File age in weeks",
                link = ghLink, direction = -1
            ),
        "number_of_authors" to
            AttributeDescriptor(
                title = "Number of Authors", description = "Number of authors",
                link = ghLink, direction = -1
            ),
        "number_of_commits" to
            AttributeDescriptor(
                title = "Number of Commits", description = "Number of commits",
                link = ghLink, direction = -1
            ),
        "number_of_renames" to
            AttributeDescriptor(
                title = "Number of Renames",
                description = "Number of file renames", link = ghLink, direction = -1
            ),
        "range_of_weeks_with_commits" to
            AttributeDescriptor(
                title = "Week Range of Commits",
                description = "Average number of weeks between commits", link = ghLink, direction = -1
            ),
        "successive_weeks_with_commits" to
            AttributeDescriptor(
                title = "Successive Weeks with Commits",
                description = "Number of successive weeks in which the file was included in a commit",
                link = ghLink, direction = -1
            ),
        "weeks_with_commits" to
            AttributeDescriptor(
                title = "Weeks with Commits",
                description = "Number of weeks in which commits occurred", link = ghLink, direction = -1
            ),
        "highly_coupled_files" to
            AttributeDescriptor(
                title = "Highly Coupled Files",
                description = "Number of highly coupled files (>=35% of times modified the same time) with this file",
                link = ghLink, direction = -1
            ),
        "median_coupled_files" to
            AttributeDescriptor(
                title = "Median Coupled Files",
                description = "Median of number of other files that where committed with this file",
                link = ghLink,
                direction = -1
            ),
        "temporal_coupling" to
            AttributeDescriptor(
                title = "Temporal Coupling",
                description = "The degree of temporal coupling between two files (>=35%)", link = ghLink,
                direction = -1
            ),
        "authors" to
            AttributeDescriptor(
                title = "Authors", description = "The authors that have worked on a file",
                link = ghLink, direction = -1
            )
    )
}
