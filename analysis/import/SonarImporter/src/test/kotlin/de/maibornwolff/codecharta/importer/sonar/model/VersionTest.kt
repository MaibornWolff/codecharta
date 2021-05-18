package de.maibornwolff.codecharta.importer.sonar.model

import de.maibornwolff.codecharta.importer.sonar.SonarImporterException
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.jupiter.api.assertThrows

class VersionTest {

    @Test
    fun `should parse a full version`() {
        val result = Version.parse("8.9.0.1234")

        assertEquals(result.major, 8)
        assertEquals(result.minor, 9)
    }

    @Test
    fun `should throw an error if version is not parsable`() {
        assertThrows<SonarImporterException> { Version.parse("8") }
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
