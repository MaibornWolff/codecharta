package de.maibornwolff.treesitter.excavationsite.shared.domain

// ensure LINES_OF_CODE is always the last entry as we use the enums ordinal and skip calculation for this metric
enum class AvailableFileMetrics(val metricName: String) {
    COMPLEXITY("complexity"),
    LOGIC_COMPLEXITY("logic_complexity"),
    COMMENT_LINES("comment_lines"),
    NUMBER_OF_FUNCTIONS("number_of_functions"),
    MESSAGE_CHAINS("message_chains"),
    REAL_LINES_OF_CODE("rloc"),
    LONG_METHOD("long_method"),
    LONG_PARAMETER_LIST("long_parameter_list"),
    EXCESSIVE_COMMENTS("excessive_comments"),
    COMMENT_RATIO("comment_ratio"),
    LINES_OF_CODE("loc")
}

// each of these metrics has max/min/mean/median and is calculated for each function/method in a file
enum class AvailableFunctionMetrics(val metricName: String) {
    PARAMETERS("parameters"),
    COMPLEXITY("complexity"),
    RLOC("rloc")
}
