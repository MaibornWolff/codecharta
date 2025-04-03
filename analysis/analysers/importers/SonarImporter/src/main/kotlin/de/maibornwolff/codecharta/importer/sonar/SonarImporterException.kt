package de.maibornwolff.codecharta.analysis.importer.sonar

class SonarImporterException : RuntimeException {
    constructor(e: Exception) : super(e)

    constructor(s: String, e: Exception) : super(s, e)

    constructor(s: String) : super(s)
}
