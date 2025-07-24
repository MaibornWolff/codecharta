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
    INFO(".info"),
    XML(".xml"),
    GO(".go"),
    PHP(".php"),
    TYPESCRIPT(".ts"),
    CSHARP(".cs"),
    CPP(".cpp"),
    C(".c"),
    JAVA(".java"),
    JAVASCRIPT(".js"),
    KOTLIN(".kt"),
    PYTHON(".py"),
    RUBY(".rb"),
    BASH(".sh")
}
