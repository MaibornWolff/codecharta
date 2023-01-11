package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.model.AttributeDescriptor

fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val ghLink = "https://github.com/MaibornWolff/codecharta/blob/main/analysis/import/SourceCodeParser/README.md"
    return mapOf(
        "rloc" to AttributeDescriptor(title = "Real Lines of Code", description = "Number of physical lines that contain at least one character which is neither a whitespace nor a tabulation nor part of a comment", link = ghLink),
        "classes" to AttributeDescriptor(title = "Number of Classes", description = "Number of classes (including nested classes, interfaces, enums and annotations", link = ghLink),
        "functions" to AttributeDescriptor(title = "Number of Functions", description = "Number of functions", link = ghLink),
        "statements" to AttributeDescriptor(title = "Number of Statements", description = "Number of statements", link = ghLink),
        "comment_lines" to AttributeDescriptor(title = "Comment Lines", description = "Number of lines containing either a comment or commented-out code", link = ghLink),
        "mcc" to AttributeDescriptor(title = "Maximum Cyclic Complexity", description = "Maximum cyclic complexity based on paths through the code by McCabe", link = ghLink),
        "cognitive_complexity" to AttributeDescriptor(title = "Cognitive Complexity", description = "How hard is it to understand the code's control flow", link = "https://www.sonarsource.com/resources/cognitive-complexity/"),
        "commented_out_code_blocks" to AttributeDescriptor(title = "Commented-out Code Blocks", description = "Number of blocks of commented-out code", link = ghLink),
        "max_nesting_level" to AttributeDescriptor(title = "Maximum Nesting Level", description = "Maximum nested level/depth found", link = ghLink),
        "code_smell" to AttributeDescriptor(title = "Code Smells", description = "Total count of code smell issues", link = ghLink),
        "security_hotspot" to AttributeDescriptor(title = "Security Hotspots", description = "Number of security hotspots", link = ghLink),
        "vulnerability" to AttributeDescriptor(title = "Number of Vulnerabilities", description = "Number of vulnerability issues", link = ghLink),
        "bug" to AttributeDescriptor(title = "Number of Bugs", description = "Number of bug issues", link = ghLink),
        "sonar_issue_other" to AttributeDescriptor(title = "Other Sonar Issues", description = "Total number of other sonar issues", link = ghLink)
    )
}
