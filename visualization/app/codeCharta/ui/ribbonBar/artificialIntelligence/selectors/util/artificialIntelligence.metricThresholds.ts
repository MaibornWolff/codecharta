export interface Percentiles {
    percentile70: number
    percentile80: number
    percentile90: number
    percentile95: number
}

export interface MetricThresholds {
    [key: string]: Percentiles
}

export interface MetricThresholdsByLanguage {
    java: MetricThresholds
    miscellaneous: MetricThresholds
}

export const metricThresholdsByLanguage: MetricThresholdsByLanguage = {
    java: {
        // Thresholds derived without any pre-clustering from benchmark data
        //  that means that 241 heterogeneous open source projects were included in the benchmark:
        //  e.g. young and old (2-10 years) old projects, projects with few lines of code or with quite a lot
        //  on this basis thresholds were derived
        complexity: {
            percentile70: 48,
            percentile80: 71,
            percentile90: 117,
            percentile95: 191
        },
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
        complexity: {
            percentile70: 50,
            percentile80: 70,
            percentile90: 120,
            percentile95: 190
        },
        mcc: {
            percentile70: 50,
            percentile80: 70,
            percentile90: 120,
            percentile95: 190
        },
        rloc: {
            percentile70: 370,
            percentile80: 560,
            percentile90: 1011,
            percentile95: 1670
        },
        loc: {
            percentile70: 370,
            percentile80: 560,
            percentile90: 1010,
            percentile95: 1670
        },
        cognitive_complexity: {
            percentile70: 35,
            percentile80: 60,
            percentile90: 130,
            percentile95: 230
        },
        code_smell: {
            percentile70: 6,
            percentile80: 10,
            percentile90: 25,
            percentile95: 55
        },
        comment_lines: {
            percentile70: 40,
            percentile80: 65,
            percentile90: 140,
            percentile95: 275
        },
        max_nesting_level: {
            percentile70: 3,
            percentile80: 4,
            percentile90: 5,
            percentile95: 6
        },
        functions: {
            percentile70: 30,
            percentile80: 50,
            percentile90: 80,
            percentile95: 130
        },
        statements: {
            percentile70: 160,
            percentile80: 260,
            percentile90: 440,
            percentile95: 730
        }
    }
}
