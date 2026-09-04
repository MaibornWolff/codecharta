package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model

enum class TypeOfUsage(val rawValue: String) {
    USAGE("usage"),
    INHERITANCE("inheritance"),
    IMPLEMENTATION("implementation"),
    CONSTANT_ACCESS("constant_access"),
    RETURN_VALUE("return_value"),
    INSTANTIATION("instantiation"),
    ARGUMENT("argument")
}
