package de.maibornwolff.codecharta.serialization

enum class FileExtension(
    val primaryExtension: String,
    val otherValidExtensions: Set<String> = setOf()
) {
    JSON(".json"),
    YAML(".yaml"),
    YML(".yml"),
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
    CSHARP(".cs"),
    CPP(".cpp", setOf(".cc", ".cxx", ".c++", ".hh", ".hpp", ".hxx")),
    C(".c", setOf(".h")),
    JAVA(".java"),
    JAVASCRIPT(".js", setOf(".cjs", ".mjs")),
    KOTLIN(".kt"),
    PYTHON(".py"),
    RUBY(".rb"),
    BASH(".sh")
}
