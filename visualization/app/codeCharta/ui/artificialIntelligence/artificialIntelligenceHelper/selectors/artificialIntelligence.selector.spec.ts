import { calculate } from "./artificialIntelligence.selector"
import { VALID_NODE_JAVA } from "../../../../util/dataMocks"
import { BlacklistItem, BlacklistType, NodeType } from "../../../../codeCharta.model"

describe("ArtificialIntelligenceSelector", () => {
	it("should return undefined when experimental features are disabled ", () => {
		const actual = calculate(false, { unifiedMapNode: VALID_NODE_JAVA }, [])
		expect(actual).toBeUndefined()
	})

	it("should calculate suspicious metrics and risk profile when experimental features are enabled ", () => {
		const actual = calculate(true, { unifiedMapNode: VALID_NODE_JAVA }, [])

		expect(actual).toEqual({
			analyzedProgrammingLanguage: "java",
			riskProfile: { highRisk: 37, lowRisk: 46, moderateRisk: 17, veryHighRisk: 0 },
			suspiciousMetricSuggestionLinks: [
				{ from: 365, isOutlier: true, metric: "loc", to: 554 },
				{ from: 29, isOutlier: true, metric: "functions", to: 44 },
				{ from: 48, metric: "mcc", to: 71 }
			],
			unsuspiciousMetrics: ["rloc (real lines of code)"],
			untrackedMetrics: []
		})
	})

	it("should ignore excluded nodes when experimental features are enabled", () => {
		const blacklist: BlacklistItem[] = [{ path: "file1.java", type: BlacklistType.exclude }]
		const blacklistedNode = {
			name: "file1.java",
			path: "file1.java",
			type: NodeType.FILE,
			attributes: { rloc: 70, mcc: 1000 }
		}

		const actual = calculate(true, { unifiedMapNode: blacklistedNode }, blacklist)

		expect(actual).toEqual({
			riskProfile: {
				highRisk: 0,
				lowRisk: 0,
				moderateRisk: 0,
				veryHighRisk: 0
			},
			suspiciousMetricSuggestionLinks: [],
			unsuspiciousMetrics: [],
			untrackedMetrics: []
		})
	})
})
