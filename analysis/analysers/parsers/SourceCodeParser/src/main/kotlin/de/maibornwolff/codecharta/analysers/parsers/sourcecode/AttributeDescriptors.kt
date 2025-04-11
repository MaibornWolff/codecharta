@file:Suppress("ktlint:standard:max-line-length")

package de.maibornwolff.codecharta.analysers.parsers.sourcecode

import de.maibornwolff.codecharta.model.AttributeDescriptor

internal fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val ghLink = "https://codecharta.com/docs/parser/source-code"
    return mapOf(
        "rloc" to
            AttributeDescriptor(
                title = "Real Lines of Code",
                description = "Number of code lines that contain at least one character which is neither a whitespace nor a tabulation nor part of a comment",
                link = ghLink, direction = -1
            ),
        "classes" to
            AttributeDescriptor(
                title = "Number of Classes",
                description = "Number of classes (including nested classes, interfaces, enums and annotations)",
                link = ghLink, direction = -1
            ),
        "functions" to
            AttributeDescriptor(
                title = "Number of Functions", description = "Number of functions",
                link = ghLink, direction = -1
            ),
        "statements" to
            AttributeDescriptor(
                title = "Number of Statements", description = "Number of statements",
                link = ghLink, direction = -1
            ),
        "comment_lines" to
            AttributeDescriptor(
                title = "Comment Lines",
                description = "Number of lines containing either a comment or commented-out code",
                link = ghLink,
                direction = -1
            ),
        "complexity" to
            AttributeDescriptor(
                title = "Cyclomatic Complexity",
                description = "Cyclomatic complexity based on the number of paths through the code",
                link = "https://docs.sonarsource.com/sonarqube/latest/user-guide/metric-definitions/",
                direction = -1
            ),
        "cognitive_complexity" to
            AttributeDescriptor(
                title = "Cognitive Complexity",
                description = "How hard is it to understand the code's control flow",
                link = "https://www.sonarsource.com/resources/cognitive-complexity/", direction = -1
            ),
        "commented_out_code_blocks" to
            AttributeDescriptor(
                title = "Commented-out Code Blocks",
                description = "Number of blocks of commented-out code", link = ghLink, direction = -1
            ),
        "max_nesting_level" to
            AttributeDescriptor(
                title = "Maximum Nesting Level",
                description = "Maximum nested level/depth found", link = ghLink, direction = -1
            ),
        "code_smell" to
            AttributeDescriptor(
                title = "Code Smells", description = "Total count of code smell issues",
                link = ghLink, direction = -1
            ),
        "security_hotspot" to
            AttributeDescriptor(
                title = "Security Hotspots",
                description = "Number of security hotspots", link = ghLink, direction = -1
            ),
        "vulnerability" to
            AttributeDescriptor(
                title = "Number of Vulnerabilities",
                description = "Number of vulnerability issues", link = ghLink, direction = -1
            ),
        "bug" to
            AttributeDescriptor(
                title = "Number of Bugs", description = "Number of bug issues", link = ghLink,
                direction = -1
            ),
        "sonar_issue_other" to
            AttributeDescriptor(
                title = "Other Sonar Issues",
                description = "Total number of other sonar issues", link = ghLink, direction = -1
            )
    )
}
