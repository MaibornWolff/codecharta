package de.maibornwolff.codecharta.importer.sourcecodeparser

import de.maibornwolff.codecharta.model.AttributeDescriptor

fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val descriptors = mutableMapOf<String, AttributeDescriptor>()
    val ghLink = "https://github.com/MaibornWolff/codecharta/blob/main/analysis/import/SourceCodeParser/README.md"
    descriptors["rloc"] = AttributeDescriptor(title = "Real Lines of Code", description = "Number of physical lines that contain at least one character which is neither a whitespace nor a tabulation nor part of a comment", link = ghLink)
    descriptors["classes"] = AttributeDescriptor(title = "Number of Classes", description = "Number of classes (including nested classes, interfaces, enums and annotations", link = ghLink)
    descriptors["functions"] = AttributeDescriptor(title = "Number of Functions", description = "Number of functions", link = ghLink)
    descriptors["statements"] = AttributeDescriptor(title = "Number of Statements", description = "Number of statements", link = ghLink)
    descriptors["comment_lines"] = AttributeDescriptor(title = "Comment Lines", description = "Number of lines containing either a comment or commented-out code", link = ghLink)
    descriptors["mcc"] = AttributeDescriptor(title = "Maximum Cyclic Complexity", description = "Maximum cyclic complexity based on paths through the code by McCabe", link = ghLink)
    descriptors["cognitive_complexity"] = AttributeDescriptor(title = "Cognitive Complexity", description = "How hard is it to understand the code's control flow", link = "https://www.sonarsource.com/resources/cognitive-complexity/")
    descriptors["commented_out_code_blocks"] = AttributeDescriptor(title = "Commented-out Code Blocks", description = "Number of blocks of commented-out code", link = ghLink)
    descriptors["max_nesting_level"] = AttributeDescriptor(title = "Maximum Nesting Level", description = "Maximum nested level/depth found", link = ghLink)
    descriptors["code_smell"] = AttributeDescriptor(title = "Code Smells", description = "Total count of code smell issues", link = ghLink)
    descriptors["security_hotspot"] = AttributeDescriptor(title = "Security Hotspots", description = "Number of security hotspots", link = ghLink)
    descriptors["vulnerability"] = AttributeDescriptor(title = "Number of Vulnerabilities", description = "Number of vulnerability issues", link = ghLink)
    descriptors["bug"] = AttributeDescriptor(title = "Number of Bugs", description = "Number of bug issues", link = ghLink)
    descriptors["sonar_issue_other"] = AttributeDescriptor(title = "Other Sonar Issues", description = "Total number of other sonar issues", link = ghLink)

    return descriptors.toMap()
}
