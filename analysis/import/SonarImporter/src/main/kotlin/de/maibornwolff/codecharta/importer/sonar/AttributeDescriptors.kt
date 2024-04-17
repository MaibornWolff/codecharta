package de.maibornwolff.codecharta.importer.sonar

import de.maibornwolff.codecharta.model.AttributeDescriptor

fun getAttributeDescriptors(): Map<String, AttributeDescriptor> {
    val metricLink = "https://docs.sonarcloud.io/digging-deeper/metric-definitions/"
    return getAttributeDescriptorsWithNegativeDirection(metricLink) +
           getAttributeDescriptorsWithPositiveDirection(
                   metricLink,
                                                       )
}

fun getAttributeDescriptorsWithNegativeDirection(metricLink: String): Map<String, AttributeDescriptor> {
    return mapOf(
            "accepted_issues" to createAttributeDescriptor("Accepted Issues", "Accepted issues", -1, metricLink),
            "blocker_violations" to
                    createAttributeDescriptor(
                            "Blocker Violations",
                            "Total count of issues of the severity blocker", -1, metricLink,
                                             ),
            "bugs" to createAttributeDescriptor("Number of Bugs", "Number of bug issues", -1, metricLink),
            "class_complexity" to
                    createAttributeDescriptor(
                            "Cyclic Class Complexity",
                            "Maximum cyclomatic complexity based on paths through a class by McCabe", -1, metricLink,
                                             ),
            "classes" to
                    createAttributeDescriptor(
                            "Number of Classes",
                            "Number of classes (including nested classes, interfaces, enums and annotations", -1,
                            metricLink,
                                             ),
            "code_smells" to
                    createAttributeDescriptor(
                            "Code Smells", "Total count of code smell issues", -1,
                            metricLink,
                                             ),
            "cognitive_complexity" to
                    createAttributeDescriptor(
                            "Cognitive Complexity",
                            "How hard is it to understand the code's control flow", -1,
                            "https://www.sonarsource.com/resources/cognitive-complexity/",
                                             ),
            "comment_lines" to
                    createAttributeDescriptor(
                            "Comment Lines",
                            "Number of lines containing either a comment or commented-out code", -1, metricLink,
                                             ),
            "comment_lines_density" to
                    createAttributeDescriptor(
                            "Comment Density",
                            "Density of comment lines in relation to total lines of code", -1, metricLink,
                                             ),
            "complexity" to
                    createAttributeDescriptor(
                            "Maximum Cyclomatic Complexity",
                            "Maximum cyclic complexity based on paths through the code by McCabe", -1, metricLink,
                                             ),
            "complexity_in_classes" to
                    createAttributeDescriptor(
                            "Class Complexity",
                            "Maximum cyclomatic complexity based on paths through a class by McCabe", -1, metricLink,
                                             ),
            "complexity_in_functions" to
                    createAttributeDescriptor(
                            "Function Complexity",
                            "Maximum cyclomatic complexity based on paths through a function by McCabe", -1, metricLink,
                                             ),
            "conditions_by_line" to
                    createAttributeDescriptor(
                            "Conditions by line", "Number of conditions by line", -1,
                            metricLink,
                                             ),
            "conditions_to_cover" to
                    createAttributeDescriptor(
                            "Conditions to Cover",
                            "Number of conditions which could be covered by unit tests", -1, metricLink,
                                             ),
            "confirmed_issues" to
                    createAttributeDescriptor(
                            "Confirmed Issues",
                            "Total count of issues in the confirmed state", -1, metricLink,
                                             ),
            "critical_violations" to
                    createAttributeDescriptor(
                            "Critical Violations",
                            "Total count of issues of the severity critical", -1, metricLink,
                                             ),
            "directories" to
                    createAttributeDescriptor(
                            "Number of Directories", "Number of directories", -1,
                            metricLink,
                                             ),
            "duplicated_blocks" to
                    createAttributeDescriptor(
                            "Duplicated Blocks",
                            "Number of duplicated blocks of lines", -1, metricLink,
                                             ),
            "duplicated_files" to
                    createAttributeDescriptor(
                            "Duplicated Files",
                            "Number of files involved in duplications", -1, metricLink,
                                             ),
            "duplicated_lines" to
                    createAttributeDescriptor(
                            "Duplicated Lines",
                            "Number of lines involved in duplications", -1, metricLink,
                                             ),
            "duplicated_lines_density" to
                    createAttributeDescriptor(
                            "Duplicated Line Density",
                            "Density of duplicated lines", -1, metricLink,
                                             ),
            "false_positive_issues" to
                    createAttributeDescriptor(
                            "False Positive Issues",
                            "Total count of issues marked false positive", -1, metricLink,
                                             ),
            "file_complexity" to
                    createAttributeDescriptor(
                            "File Complexity",
                            "Maximum cyclomatic complexity based on paths through a file by McCabe", -1, metricLink,
                                             ),
            "files" to createAttributeDescriptor("Number of Files", "Number of files", -1, metricLink),
            "function_complexity" to
                    createAttributeDescriptor(
                            "Function Complexity",
                            "Maximum cyclomatic complexity based on paths through a function by McCabe", -1, metricLink,
                                             ),
            "functions" to createAttributeDescriptor("Number of Functions", "Number of functions", -1, metricLink),
            "generated_lines" to
                    createAttributeDescriptor(
                            "Generated Lines", "Number of generated lines of code", -1,
                            metricLink,
                                             ),
            "generated_ncloc" to
                    createAttributeDescriptor(
                            "Generated Real Lines of Code",
                            "Number of generated non-empty lines of code", -1, metricLink,
                                             ),
            "high_impact_accepted_issues" to
                    createAttributeDescriptor(
                            "High Impact Accepted Issues",
                            "Accepted issues with high impact", -1, metricLink,
                                             ),
            "info_violations" to
                    createAttributeDescriptor(
                            "Info Violations",
                            "Total count of issues of the severity info", -1, metricLink,
                                             ),
            "lines" to
                    createAttributeDescriptor(
                            "Number of Lines",
                            "Number of physical lines (number of carriage returns)", -1, metricLink,
                                             ),
            "lines_to_cover" to
                    createAttributeDescriptor(
                            "Lines to Cover",
                            "Number of lines of code which could be covered by unit tests", -1, metricLink,
                                             ),
            "major_violations" to
                    createAttributeDescriptor(
                            "Major Violations",
                            "Total count of issues of the severity major", -1, metricLink,
                                             ),
            "minor_violations" to
                    createAttributeDescriptor(
                            "Minor Violations",
                            "Total count of issues of the severity minor", -1, metricLink,
                                             ),
            "ncloc" to
                    createAttributeDescriptor(
                            "Real Lines of Code",
                            "Number of physical lines that contain at least one character which is neither a whitespace nor a tabulation nor part of a comment",
                            -1, metricLink,
                                             ),
            "new_accepted_issues" to
                    createAttributeDescriptor(
                            "New Accepted Issues", "New accepted issues", -1,
                            metricLink,
                                             ),
            "new_blocker_violations" to
                    createAttributeDescriptor(
                            "New Blocker Violations",
                            "Number of issues of the severity blocker raised for the first time in the new code period",
                            -1,
                            metricLink,
                                             ),
            "new_bugs" to createAttributeDescriptor("Number of New Bugs", "Number of new bug issues", -1, metricLink),
            "new_code_smells" to
                    createAttributeDescriptor(
                            "New Code Smells",
                            "Total count of code smell issues raised for the first time in the new code period", -1,
                            metricLink,
                                             ),
            "new_conditions_to_cover" to
                    createAttributeDescriptor(
                            "New Conditions to Cover",
                            "Number of new/updated conditions which could be covered by unit tests", -1, metricLink,
                                             ),
            "new_critical_violations" to
                    createAttributeDescriptor(
                            "New Critical Violations",
                            "Number of issues of the severity critical raised for the first time in the new code period",
                            -1,
                            metricLink,
                                             ),
            "new_development_cost" to
                    createAttributeDescriptor(
                            "New Development Cost",
                            "Development cost of new/updated code", -1, metricLink,
                                             ),
            "new_duplicated_blocks" to
                    createAttributeDescriptor(
                            "New Duplicated Blocks",
                            "Number of duplicated blocks of lines in new/updated code", -1, metricLink,
                                             ),
            "new_duplicated_lines" to
                    createAttributeDescriptor(
                            "New Duplicated Lines",
                            "Number of lines involved in duplications in new/updated code", -1, metricLink,
                                             ),
            "new_duplicated_lines_density" to
                    createAttributeDescriptor(
                            "New Duplicated Lines Density",
                            "Density of duplicated lines in new/updated code", -1, metricLink,
                                             ),
            "new_info_violations" to
                    createAttributeDescriptor(
                            "New Info Violations",
                            "Number of issues of the severity info raised for the first time in the new code period",
                            -1,
                            metricLink,
                                             ),
            "new_lines" to
                    createAttributeDescriptor(
                            "Number of New Lines", "Number of new/updated lines of code", -1,
                            metricLink,
                                             ),
            "new_lines_to_cover" to
                    createAttributeDescriptor(
                            "New Lines to Cover",
                            "Number of new/updated lines of code which could be covered by unit tests", -1, metricLink,
                                             ),
            "new_major_violations" to
                    createAttributeDescriptor(
                            "New Major Violations",
                            "Number of issues of the severity major raised for the first time in the new code period",
                            -1,
                            metricLink,
                                             ),
            "new_minor_violations" to
                    createAttributeDescriptor(
                            "New Minor Violations",
                            "Number of issues of the severity minor raised for the first time in the new code period",
                            -1,
                            metricLink,
                                             ),
            "new_security_hotspots" to
                    createAttributeDescriptor(
                            "New Security Hotspots",
                            "Number of new security hotspots in the new code period", -1, metricLink,
                                             ),
            "new_security_hotspots_reviewed_status" to
                    createAttributeDescriptor(
                            "New Security Hotspots Reviewed Status",
                            "Total number of reviewed security hotspots in new code period", -1, metricLink,
                                             ),
            "new_security_hotspots_to_review_status" to
                    createAttributeDescriptor(
                            "New Security Hotspots to Review Status",
                            "Number of security hotspots to review in new code period", -1, metricLink,
                                             ),
            "new_sqale_debt_ratio" to
                    createAttributeDescriptor(
                            "New SQale Debt Ratio",
                            "Ratio between the cost to develop the software and the cost to fix it in new/updated code",
                            -1,
                            metricLink,
                                             ),
            "new_uncovered_conditions" to
                    createAttributeDescriptor(
                            "New Uncovered Conditions",
                            "Total number of uncovered conditions in new/updated code", -1, metricLink,
                                             ),
            "new_uncovered_lines" to
                    createAttributeDescriptor(
                            "New Uncovered Lines",
                            "Total number of uncovered lines in new/updated code", -1, metricLink,
                                             ),
            "new_violations" to
                    createAttributeDescriptor(
                            "New Violations",
                            "Number of issues raised for the first time in the new code period", -1, metricLink,
                                             ),
            "new_vulnerabilities" to
                    createAttributeDescriptor(
                            "New Vulnerabilities",
                            "Number of new vulnerability issues", -1, metricLink,
                                             ),
            "open_issues" to
                    createAttributeDescriptor(
                            "Number of Open Issues",
                            "Total count of issues in the open state", -1, metricLink,
                                             ),
            "projects" to createAttributeDescriptor("Number of Projects", "Total number of projects", -1, metricLink),
            "public_api" to createAttributeDescriptor("Public API", "Public api available", -1, metricLink),
            "public_undocumented_api" to
                    createAttributeDescriptor(
                            "Public Undocumented API",
                            "Undocumented api available", -1, metricLink,
                                             ),
            "reopened_issues" to
                    createAttributeDescriptor(
                            "Number of Reopened Issues",
                            "Total count of issues in the reopened state", -1, metricLink,
                                             ),
            "security_hotspots" to
                    createAttributeDescriptor(
                            "Security Hotspots", "Number of security hotspots", -1,
                            metricLink,
                                             ),
            "security_hotspots_reviewed_status" to
                    createAttributeDescriptor(
                            "Security Hotspots Reviewed Status",
                            "Total number of reviewed security hotspots", -1, metricLink,
                                             ),
            "security_hotspots_to_review_status" to
                    createAttributeDescriptor(
                            "Security Hotspots to Review Status",
                            "Number of security hotspots to review", -1, metricLink,
                                             ),
            "skipped_tests" to
                    createAttributeDescriptor(
                            "Number of skipped Tests", "Number of skipped unit tests", -1,
                            metricLink,
                                             ),
            "sqale_debt_ratio" to
                    createAttributeDescriptor(
                            "SQale Debt Ratio",
                            "Ratio between the cost to develop the software and the cost to fix it", -1, metricLink,
                                             ),
            "statements" to createAttributeDescriptor("Number of Statements", "Number of statements", -1, metricLink),
            "test_errors" to
                    createAttributeDescriptor(
                            "Number of Test Errors", "Number of unit tests that have failed",
                            -1, metricLink,
                                             ),
            "test_failures" to
                    createAttributeDescriptor(
                            "Number of Test Failures",
                            "Number of unit tests that have failed with an unexpected exception", -1, metricLink,
                                             ),
            "test_failures" to
                    createAttributeDescriptor(
                            "Number of Test Failures",
                            "Number of unit tests that have failed with an unexpected exception", -1, metricLink,
                                             ),
            "uncovered_conditions" to
                    createAttributeDescriptor(
                            "Uncovered Conditions",
                            "Total number of uncovered conditions", -1, metricLink,
                                             ),
            "uncovered_lines" to
                    createAttributeDescriptor(
                            "Uncovered Lines", "Total number of uncovered lines", -1,
                            metricLink,
                                             ),
            "violations" to
                    createAttributeDescriptor(
                            "Number of Violations", "Total count of issues in all states", -1,
                            metricLink,
                                             ),
            "vulnerabilities" to
                    createAttributeDescriptor(
                            "Number of Vulnerabilities",
                            "Number of vulnerability issues", -1, metricLink,
                                             ),
            "wont_fix_issues" to
                    createAttributeDescriptor(
                            "Number of Won't Fix Issues",
                            "Total count of issues in the wont fix state", -1, metricLink,
                                             ),
                )
}

fun getAttributeDescriptorsWithPositiveDirection(metricLink: String): Map<String, AttributeDescriptor> {
    return mapOf(
            "branch_coverage" to
                    createAttributeDescriptor(
                            "Branch Coverage",
                            "Density of fully covered boolean conditions in flow control structures", 1, metricLink,
                                             ),
            "coverage" to createAttributeDescriptor("Coverage", "Mix of branch and line coverage", 1, metricLink),
            "line_coverage" to
                    createAttributeDescriptor(
                            "Line Coverage", "Density of fully covered lines of code", 1,
                            metricLink,
                                             ),
            "new_branch_coverage" to
                    createAttributeDescriptor(
                            "New Branch Coverage",
                            "Density of fully covered boolean conditions in flow control structures in new or updated code",
                            1,
                            metricLink,
                                             ),
            "new_coverage" to
                    createAttributeDescriptor(
                            "New Coverage",
                            "Mix of branch and line coverage on new/updated code", 1, metricLink,
                                             ),
            "new_line_coverage" to
                    createAttributeDescriptor(
                            "New Line Coverage",
                            "Density of fully covered lines of new/updated code", 1, metricLink,
                                             ),
            "public_documented_api_density" to
                    createAttributeDescriptor(
                            "Public Documented API Density",
                            "Documented public api available", 1, metricLink,
                                             ),
            "pull_request_fixed_issues" to
                    createAttributeDescriptor(
                            "Pull request fixed issues",
                            "Count of issues that would be fixed by the pull request", 1, metricLink,
                                             ),
            "security_hotspots_reviewed" to
                    createAttributeDescriptor(
                            "Security Hotspots Reviewed",
                            "Percentage of reviewed (fixed or safe) security hotspots", 1, metricLink,
                                             ),
            "test_success_density" to
                    createAttributeDescriptor(
                            "Test Success Density",
                            "Ratio between successful tests and all tests", 1, metricLink,
                                             ),
            "tests" to createAttributeDescriptor("Number of Tests", "Number of unit tests", 1, metricLink),
                )
}

fun createAttributeDescriptor(
title: String,
description: String,
direction: Int,
link: String,
): AttributeDescriptor {
    return AttributeDescriptor(title = title, description = description, link = link, direction = direction)
}
