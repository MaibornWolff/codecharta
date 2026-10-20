package de.maibornwolff.codecharta.analysers.importers.sonar

import de.maibornwolff.codecharta.model.AttributeDescriptor

// sonar provides descriptions for all metrics via their api here: https://sonarcloud.io/api/metrics/search?p=1&ps=500

private const val METRIC_DEFINITIONS_LINK = "https://docs.sonarcloud.io/digging-deeper/metric-definitions/"
private const val LOWER_IS_BETTER = -1
private const val HIGHER_IS_BETTER = 1
private const val SONAR_IMPORTER = "sonarImporter"

internal fun getAttributeDescriptors(): Map<String, AttributeDescriptor> = lowerIsBetterDescriptors() + higherIsBetterDescriptors()

private fun lowerIsBetterDescriptors(): Map<String, AttributeDescriptor> = mapOf(
    "accepted_issues" to lowerIsBetter("Accepted Issues", "Accepted issues"),
    "blocker_violations" to lowerIsBetter("Blocker Violations", "Total count of issues of the severity blocker"),
    "bugs" to lowerIsBetter("Number of Bugs", "Number of bugs"),
    "class_complexity" to lowerIsBetter("Complexity per class", "Average cyclomatic complexity of classes"),
    "classes" to lowerIsBetter("Number of Classes", "Number of classes (including nested classes, interfaces, enums and annotations"),
    "code_smells" to lowerIsBetter("Code Smells", "Total count of code smell issues"),
    "cognitive_complexity" to
        lowerIsBetter(
            "Cognitive Complexity",
            "A sonar excluside metric to measure how hard is it to understand the control flow of code",
            "https://www.sonarsource.com/resources/cognitive-complexity/"
        ),
    "comment_lines" to lowerIsBetter("Comment Lines", "Number of lines containing either a comment or commented-out code"),
    "comment_lines_density" to lowerIsBetter("Comment line Density", "Density of comment lines in relation to total lines of code"),
    "complexity" to
        lowerIsBetter(
            "Cyclomatic Complexity",
            "Cyclomatic complexity based on the number of paths through the code (similar but not equal to McCabe complexity)"
        ),
    "complexity_in_classes" to lowerIsBetter("Class Complexity", "Cyclomatic complexity of classes"),
    "complexity_in_functions" to lowerIsBetter("Function Complexity", "Cyclomatic complexity of functions"),
    "conditions_by_line" to lowerIsBetter("Conditions by line", "Number of conditions by line"),
    "conditions_to_cover" to lowerIsBetter("Conditions to Cover", "Number of conditions which could be covered by unit tests"),
    "confirmed_issues" to lowerIsBetter("Confirmed Issues", "Total count of issues in the confirmed state"),
    "critical_violations" to lowerIsBetter("Critical Violations", "Total count of issues of the severity critical"),
    "directories" to lowerIsBetter("Number of Directories", "Number of directories"),
    "duplicated_blocks" to lowerIsBetter("Duplicated Blocks", "Number of duplicated blocks of lines"),
    "duplicated_files" to lowerIsBetter("Duplicated Files", "Number of files involved in duplications"),
    "duplicated_lines" to lowerIsBetter("Duplicated Lines", "Number of lines involved in duplications"),
    "duplicated_lines_density" to lowerIsBetter("Duplicated Line Density", "Density of duplicated lines"),
    "false_positive_issues" to lowerIsBetter("False Positive Issues", "Total count of issues marked false positive"),
    "file_complexity" to lowerIsBetter("Complexity per file", "Average cyclomatic complexity of files"),
    "files" to lowerIsBetter("Number of Files", "Number of files"),
    "function_complexity" to lowerIsBetter("Complexity per function", "Average cyclomatic complexity of functions"),
    "functions" to lowerIsBetter("Number of Functions", "Number of functions"),
    "generated_lines" to lowerIsBetter("Generated Lines", "Number of generated lines of code (includes comments and empty lines)"),
    "generated_ncloc" to lowerIsBetter("Generated Real Lines of Code", "Number of generated non-empty lines of code"),
    "high_impact_accepted_issues" to lowerIsBetter("High Impact Accepted Issues", "Accepted issues with high impact"),
    "info_violations" to lowerIsBetter("Info Violations", "Total count of issues of the severity info"),
    "lines" to lowerIsBetter("Number of Lines", "Number of code lines (number of carriage returns)"),
    "lines_to_cover" to lowerIsBetter("Lines to Cover", "Number of lines of code which could be covered by unit tests"),
    "major_violations" to lowerIsBetter("Major Violations", "Total count of issues of the severity major"),
    "minor_violations" to lowerIsBetter("Minor Violations", "Total count of issues of the severity minor"),
    "ncloc" to
        lowerIsBetter(
            "Real Lines of Code",
            "Number of code lines that contain at least one character which is neither a whitespace nor a tabulation nor part of a comment"
        ),
    "new_accepted_issues" to lowerIsBetter("New Accepted Issues", "New accepted issues"),
    "new_blocker_violations" to
        lowerIsBetter(
            "Blocker Violations on new code",
            "Number of issues of the severity blocker raised for the first time in the new code period"
        ),
    "new_bugs" to lowerIsBetter("Number of New Bugs", "Number of new bug issues"),
    "new_code_smells" to
        lowerIsBetter(
            "Code Smells on new code",
            "Total count of code smell issues raised for the first time in the new code period"
        ),
    "new_conditions_to_cover" to
        lowerIsBetter(
            "Conditions to Cover on new code",
            "Number of new/updated conditions which could be covered by unit tests"
        ),
    "new_critical_violations" to
        lowerIsBetter(
            "Critical Violations on new code",
            "Number of issues of the severity critical raised for the first time in the new code period"
        ),
    "new_development_cost" to lowerIsBetter("Development Cost on new code", "Development cost of new/updated code"),
    "new_duplicated_blocks" to lowerIsBetter("Duplicated Blocks on new code", "Number of duplicated blocks of lines in new/updated code"),
    "new_duplicated_lines" to lowerIsBetter("Duplicated Lines on new code", "Number of lines involved in duplications in new/updated code"),
    "new_duplicated_lines_density" to
        lowerIsBetter(
            "Duplicated Lines Density on new code",
            "Density of duplicated lines in new/updated code"
        ),
    "new_info_violations" to
        lowerIsBetter(
            "Info Violations on new code",
            "Number of issues of the severity info raised for the first time in the new code period"
        ),
    "new_lines" to lowerIsBetter("Number of New Lines", "Number of new/updated lines of code"),
    "new_lines_to_cover" to
        lowerIsBetter(
            "Lines to Cover on new code",
            "Number of new/updated lines of code which could be covered by unit tests"
        ),
    "new_major_violations" to
        lowerIsBetter(
            "Major Violations on new code",
            "Number of issues of the severity major raised for the first time in the new code period"
        ),
    "new_minor_violations" to
        lowerIsBetter(
            "Minor Violations on new code",
            "Number of issues of the severity minor raised for the first time in the new code period"
        ),
    "new_security_hotspots" to lowerIsBetter("Security Hotspots on new code", "Number of new security hotspots in the new code period"),
    "new_security_hotspots_reviewed_status" to
        lowerIsBetter(
            "Security Hotspots Reviewed Status on new code",
            "Total number of reviewed security hotspots in new code period"
        ),
    "new_security_hotspots_to_review_status" to
        lowerIsBetter(
            "Security Hotspots to Review Status on new code",
            "Number of security hotspots to review in new code period"
        ),
    "new_sqale_debt_ratio" to lowerIsBetter("Technical Debt Ratio on New Code", "Technical Debt Ratio of new/changed code."),
    "new_uncovered_conditions" to
        lowerIsBetter(
            "Uncovered Conditions on new code",
            "Total number of uncovered conditions in new/updated code"
        ),
    "new_uncovered_lines" to lowerIsBetter("Uncovered Lines on new code", "Total number of uncovered lines in new/updated code"),
    "new_violations" to lowerIsBetter("Issues on new code", "Number of issues raised for the first time in the new code period"),
    "new_vulnerabilities" to lowerIsBetter("Vulnerabilities on new code", "Number of new vulnerability issues"),
    "open_issues" to lowerIsBetter("Number of Open Issues", "Total count of issues in the open state"),
    "projects" to lowerIsBetter("Number of Projects", "Total number of projects"),
    "public_api" to lowerIsBetter("Public API", "Public api available"),
    "public_undocumented_api" to lowerIsBetter("Public Undocumented API", "Public undocumented classes, functions and variables available"),
    "reopened_issues" to lowerIsBetter("Number of Reopened Issues", "Total count of issues in the reopened state"),
    "security_hotspots" to lowerIsBetter("Security Hotspots", "Number of security hotspots"),
    "security_hotspots_reviewed_status" to lowerIsBetter("Security Hotspots Reviewed Status", "Total number of reviewed security hotspots"),
    "security_hotspots_to_review_status" to lowerIsBetter("Security Hotspots to Review Status", "Number of security hotspots to review"),
    "skipped_tests" to lowerIsBetter("Number of skipped Tests", "Number of skipped unit tests"),
    "sqale_debt_ratio" to
        lowerIsBetter(
            "Technical Debt Ratio",
            "Ratio of the actual technical debt compared to the estimated cost to develop the whole source code from scratch"
        ),
    "statements" to lowerIsBetter("Number of Statements", "Number of statements"),
    "test_errors" to lowerIsBetter("Number of Test Errors", "Number of unit tests that have thrown errors"),
    "test_failures" to lowerIsBetter("Number of Test Failures", "Number of unit test failures"),
    "uncovered_conditions" to lowerIsBetter("Uncovered Conditions", "Total number of uncovered conditions"),
    "uncovered_lines" to lowerIsBetter("Uncovered Lines", "Total number of uncovered lines"),
    "violations" to lowerIsBetter("Number of Violations", "Total count of issues in all states"),
    "vulnerabilities" to lowerIsBetter("Number of Vulnerabilities", "Number of vulnerability issues"),
    "wont_fix_issues" to lowerIsBetter("Number of Won't Fix Issues", "Total count of issues in the wont fix state")
)

private fun higherIsBetterDescriptors(): Map<String, AttributeDescriptor> = mapOf(
    "branch_coverage" to higherIsBetter("Branch Coverage", "Density of fully covered boolean conditions in flow control structures"),
    "coverage" to higherIsBetter("Test Coverage", "Mix of branch and line coverage"),
    "line_coverage" to higherIsBetter("Line Coverage", "Density of fully covered lines of code"),
    "new_branch_coverage" to
        higherIsBetter(
            "Branch Coverage on new code (%)",
            "Density of fully covered boolean conditions in flow control structures in new or updated code"
        ),
    "new_coverage" to higherIsBetter("Coverage on new code", "Coverage of new/changed code"),
    "new_line_coverage" to higherIsBetter("Line Coverage on new code", "Density of fully covered lines of new/updated code"),
    "public_documented_api_density" to
        higherIsBetter(
            "Public Documented API Density (%)",
            "Public documented classes and functions balanced by rloc"
        ),
    "pull_request_fixed_issues" to higherIsBetter("Pull request fixed issues", "Count of issues that would be fixed by the pull request"),
    "security_hotspots_reviewed" to
        higherIsBetter(
            "Security Hotspots Reviewed",
            "Percentage of reviewed (fixed or safe) security hotspots"
        ),
    "test_success_density" to higherIsBetter("Test Success Density", "Ratio between successful tests and all tests"),
    "tests" to higherIsBetter("Number of Tests", "Number of unit tests")
)

private fun lowerIsBetter(title: String, description: String, link: String = METRIC_DEFINITIONS_LINK): AttributeDescriptor =
    createAttributeDescriptor(title, description, LOWER_IS_BETTER, link)

private fun higherIsBetter(title: String, description: String): AttributeDescriptor =
    createAttributeDescriptor(title, description, HIGHER_IS_BETTER, METRIC_DEFINITIONS_LINK)

private fun createAttributeDescriptor(title: String, description: String, direction: Int, link: String): AttributeDescriptor =
    AttributeDescriptor(
        title = title,
        description = description,
        link = link,
        direction = direction,
        analyzers = setOf(SONAR_IMPORTER)
    )
