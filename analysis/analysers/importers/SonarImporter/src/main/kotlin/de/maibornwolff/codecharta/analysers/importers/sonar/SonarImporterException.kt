package de.maibornwolff.codecharta.analysers.importers.sonar

class SonarImporterException : RuntimeException {
    constructor(e: Exception) : super(e)

    constructor(s: String, e: Exception) : super(s, e)

    constructor(s: String) : super(s)
}
