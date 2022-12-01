/*
This file contains descriptions of the metrics
*/

export const metricTitles: Map<string, string> = new Map([
	["loc", "lines of code"],
	["rloc", "real lines of code"],
	["comment_lines", "number of code lines with comments"],
	["mcc", "cyclomatic complexity"],
	["avgCommits", "average number of commits from this file"],
	["functions", "number of functions"],
	["pairingRate", "pairing rate of selected building"],
	["unary", "-"],
	["line_coverage", "number of code lines covered by tests"],
	["sonar_code_smells", "number of smells Sonar has identified"],
	["avg_code_churn", "average number of lines added or removed from this file"],
	["number_of_authors", "number of authors that have edited this file"],
	["statements", "number of statements"]
])
