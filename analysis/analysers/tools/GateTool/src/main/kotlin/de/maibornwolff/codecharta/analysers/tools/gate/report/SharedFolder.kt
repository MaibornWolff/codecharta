package de.maibornwolff.codecharta.analysers.tools.gate.report

private const val PATH_SEPARATOR = "/"

fun sharedFolder(paths: List<String>): String {
    val shared = paths.map { it.split(PATH_SEPARATOR).dropLast(1) }.reduce(::commonStart)
    return if (shared.isEmpty()) "" else shared.joinToString(PATH_SEPARATOR) + PATH_SEPARATOR
}

private fun commonStart(first: List<String>, second: List<String>): List<String> =
    first.zip(second).takeWhile { (left, right) -> left == right }.map { it.first }
