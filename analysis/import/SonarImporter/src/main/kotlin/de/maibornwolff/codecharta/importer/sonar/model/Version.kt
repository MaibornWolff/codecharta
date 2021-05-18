package de.maibornwolff.codecharta.importer.sonar.model

import de.maibornwolff.codecharta.importer.sonar.SonarImporterException
import java.lang.Exception

class Version(val major: Int, val minor: Int) {

    companion object {
        fun parse(version: String): Version {
            try {
                val tokenized = version.split(".").subList(0, 2)
                val versions = tokenized.map { it.toInt() }
                return Version(versions[0], versions[1])
            } catch (exception: Exception) {
                throw SonarImporterException("Could not parse version $version.")
            }
        }
    }

    fun isSmallerThan(version: Version): Boolean {
        return major < version.major || major == version.major && minor < version.minor
    }
}
