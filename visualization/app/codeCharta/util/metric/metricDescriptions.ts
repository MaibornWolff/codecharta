/*
This file contains descriptions of the metrics
*/

const metricDescriptions: Map<string, string> = new Map([
	["rloc", "real lines of code"],
	["mcc", "cyclomatic complexity"],
	["avgCommits", "average number of commits from this file"],
	["functions", "number of files from this file"],
	["pairingRate", "pairing rate of selected building"],
	["unary", "-"],
	["line_coverage", "number of code lines covered by tests"],
	["sonar_code_smells", "number of smells Sonar has identified"],
	["avg_code_churn", "average number of lines added or removed from this file"],
	["number_of_authors", "number of authors that have edited this file"]
])

export function getMetricDescriptions() {
	return metricDescriptions
}
