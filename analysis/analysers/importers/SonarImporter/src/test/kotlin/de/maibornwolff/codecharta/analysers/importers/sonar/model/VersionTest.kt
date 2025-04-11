package de.maibornwolff.codecharta.analysers.importers.sonar.model

import de.maibornwolff.codecharta.analysers.importers.sonar.SonarImporterException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class VersionTest {
    @Test
    fun `should parse a full version`() {
        val result = Version.parse("8.9.0.1234")

        assertEquals(result.major, 8)
        assertEquals(result.minor, 9)
    }

    @Test
    fun `should parse a version even though minor is not specified`() {
        val result = Version.parse("8")

        assertEquals(result.major, 8)
        assertEquals(result.minor, 0)
    }

    @Test
    fun `should throw an error if version is empty`() {
        assertThrows<SonarImporterException> { Version.parse("") }
    }

    @Test
    fun `should throw an error if version does not contain a number`() {
        assertThrows<SonarImporterException> { Version.parse("a") }
    }

    @Test
    fun `should return true if major version is smaller`() {
        val version = Version(6, 6)
        val greaterVersion = Version(8, 9)

        assertTrue(version.isSmallerThan(greaterVersion))
    }

    @Test
    fun `should return false if major version is greater`() {
        val version = Version(6, 6)
        val smallerVersion = Version(5, 9)

        assertFalse(version.isSmallerThan(smallerVersion))
    }

    @Test
    fun `should return true if major version is the same but minor version is smaller`() {
        val version = Version(6, 6)
        val greaterVersion = Version(6, 7)

        assertTrue(version.isSmallerThan(greaterVersion))
    }

    @Test
    fun `should return false if major version is the same but minor version is smaller`() {
        val version = Version(6, 6)
        val smallerVersion = Version(6, 5)

        assertFalse(version.isSmallerThan(smallerVersion))
    }

    @Test
    fun `should return false if both are the same`() {
        val version = Version(6, 6)

        assertFalse(version.isSmallerThan(version))
    }
}
