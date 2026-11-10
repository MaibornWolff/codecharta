package de.maibornwolff.codecharta.analysers.importers.sbom.versions

/** Whether a version is a release rather than a pre-release, by the rules of its ecosystem (the purl type). */
object StableVersions {
    private val MAVEN_PRE_RELEASE = Regex("""(?i)(alpha|beta|rc|cr|milestone|snapshot|preview|incubating|\bea\b|(?<![a-z])m\d+)""")
    private val PYPI_PRE_RELEASE = Regex("""(?i)(\d(a|b|c|rc|alpha|beta|pre|preview)\d*|\.?dev\d*)""")
    private val ANY_LETTER = Regex("[A-Za-z]")
    private val GENERIC_PRE_RELEASE = Regex("""(?i)(alpha|beta|\brc|pre|preview|snapshot|canary|nightly|next|dev|experimental|insiders)""")

    fun isStable(version: String, ecosystem: String?): Boolean = when (ecosystem) {
        "npm", "cargo", "nuget", "golang", "composer" -> '-' !in version.removePrefix("v")
        "maven" -> !MAVEN_PRE_RELEASE.containsMatchIn(version)
        "pypi" -> !PYPI_PRE_RELEASE.containsMatchIn(version)
        "gem" -> !ANY_LETTER.containsMatchIn(version)
        else -> !GENERIC_PRE_RELEASE.containsMatchIn(version)
    }
}
