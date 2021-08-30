export const clusterMetricThresholds = {
	java: {
		// Thresholds derived without any pre-clustering from benchmark data
		notClustered: {
			mcc: {
				percentile70: 58,
				percentile80: 90,
				percentile90: 165,
				percentile95: 271
			},
			rloc: {
				percentile70: 365,
				percentile80: 554,
				percentile90: 1001,
				percentile95: 1665
			},
			loc: {
				percentile70: 365,
				percentile80: 554,
				percentile90: 1001,
				percentile95: 1665
			},
			cognitive_complexity: {
				percentile70: 30,
				percentile80: 56,
				percentile90: 124,
				percentile95: 226
			},
			code_smell: {
				percentile70: 5,
				percentile80: 9,
				percentile90: 22,
				percentile95: 50
			},
			comment_lines: {
				percentile70: 35,
				percentile80: 62,
				percentile90: 135,
				percentile95: 273
			},
			max_nesting_level: {
				percentile70: 2,
				percentile80: 3,
				percentile90: 4,
				percentile95: 5
			},
			functions: {
				percentile70: 29,
				percentile80: 44,
				percentile90: 75,
				percentile95: 126
			},
			statements: {
				percentile70: 157,
				percentile80: 245,
				percentile90: 439,
				percentile95: 727
			}
		}
	}
}
