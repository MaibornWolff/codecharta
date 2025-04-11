package de.maibornwolff.codecharta.analysers.importers.sonar.model

import de.maibornwolff.codecharta.analysers.importers.sonar.SonarImporterException

class Version(val major: Int, val minor: Int) {
    companion object {
        fun parse(version: String): Version {
            if (version.isEmpty()) {
                throw SonarImporterException("Could not parse empty version.")
            }

            val tokenized = ("$version.0.0.0").split(".").subList(0, 2)

            val versions =
                try {
                    tokenized.map { it.toInt() }
                } catch (exception: NumberFormatException) {
                    throw SonarImporterException("Could not parse version $version.", exception)
                }

            return Version(versions[0], versions[1])
        }
    }

    fun isSmallerThan(version: Version): Boolean {
        return major < version.major || major == version.major && minor < version.minor
    }
}
