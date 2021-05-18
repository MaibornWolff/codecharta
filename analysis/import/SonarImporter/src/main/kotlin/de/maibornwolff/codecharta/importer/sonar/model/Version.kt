package de.maibornwolff.codecharta.importer.sonar.model

import de.maibornwolff.codecharta.importer.sonar.SonarImporterException

class Version(private val major: Int, private val minor: Int) {
    companion object {
        fun parse(version: String): Version {
            val tokenized = version.split(".").subList(0, 2)
            val versions = tokenized.map { it.toInt() }
            try {
                return Version(versions[0], versions[1])
            } catch (exception: NullPointerException) {
                throw SonarImporterException("Could not parse version $version.")
            }
        }
    }

    fun isSmallerThan(version: Version): Boolean {
        return major < version.major || major == version.major && minor < version.minor
    }
}
