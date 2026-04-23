package de.maibornwolff.codecharta.serialization

/** Canonical file extensions recognized by CodeCharta analysers. */
enum class FileExtension(
    /** The primary extension string, including the leading dot (e.g. `".java"`). */
    val primaryExtension: String,
    /** Additional valid extensions for this language beyond the primary one. */
    val otherValidExtensions: Set<String> = setOf()
) {
    JSON(".json"),
    CSV(".csv"),
    CODECHARTA(".cc"),
    GZIP(".gz"),
    CCJSON(CODECHARTA.primaryExtension + JSON.primaryExtension),
    CCGZ(CCJSON.primaryExtension + GZIP.primaryExtension),
    INFO(".info"),
    XML(".xml"),
    GO(".go"),
    PHP(".php"),
    TYPESCRIPT(".ts", setOf("cts", ".mts")),
    TSX(".tsx"),
    CSHARP(".cs"),
    CPP(".cpp", setOf(".cc", ".cxx", ".c++", ".hh", ".hpp", ".hxx")),
    C(".c", setOf(".h")),
    JAVA(".java"),
    JAVASCRIPT(".js", setOf(".cjs", ".mjs", ".jsx")),
    KOTLIN(".kt"),
    OBJECTIVE_C(".m"),
    PYTHON(".py"),
    RUBY(".rb"),
    SWIFT(".swift"),
    BASH(".sh"),
    VUE(".vue"),
    DELPHI(".pas", setOf(".dpr"))
}
