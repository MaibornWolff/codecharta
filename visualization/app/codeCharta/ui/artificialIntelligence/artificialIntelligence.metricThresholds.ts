export const metricThresholds = {
	java: {
		// Thresholds derived without any pre-clustering from benchmark data
		//  that means that 241 heterogeneous open source projects were included in the benchmark:
		//    e.g. young and old (2-10 years) old projects, projects with few lines of code or with quite a lot
		//    on this basis thresholds were derived
		mcc: {
			percentile70: 48,
			percentile80: 71,
			percentile90: 117,
			percentile95: 191
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
	},
	miscellaneous: {
		// No derived Thresholds for other programming languages than java
		// Just use empirical thresholds
		mcc: {
			percentile70: 50,
			percentile80: 70,
			percentile90: 120,
			percentile95: 190
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
