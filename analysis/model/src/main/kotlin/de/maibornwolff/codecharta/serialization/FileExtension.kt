package de.maibornwolff.codecharta.serialization

enum class FileExtension(
    val extension: String
) {
    JSON(".json"),
    CSV(".csv"),
    CODECHARTA(".cc"),
    GZIP(".gz"),
    CCJSON(CODECHARTA.extension + JSON.extension),
    CCGZ(CCJSON.extension + GZIP.extension),
    JS_TS_COVERAGE(".info"),
}
