/*
This file contains descriptions of the metrics
*/

export const metricTitles: Map<string, string> = new Map([
	["loc", "Lines of Code"],
	["rloc", "Real Lines of Code"],
	["comment_lines", "Number of Code Lines with Comments"],
	["mcc", "Cyclomatic Complexity"],
	["avgCommits", "Average Number of Commits from this file"],
	["functions", "Number of Functions"],
	["pairingRate", "Pairing Rate of selected building"],
	["unary", "unary"],
	["line_coverage", "Number of Code Lines covered by tests"],
	["sonar_code_smells", "Number of Smells Sonar has identified"],
	["avg_code_churn", "Average Number of Lines added or removed from this file"],
	["number_of_authors", "Number of Authors that have edited this file"],
	["statements", "Number of Statements"]
])
