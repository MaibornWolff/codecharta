package de.maibornwolff.codecharta.analysers.importers.sbom.packages

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class PurlTest {
    @Test
    fun `should give an encoded and a plain scoped npm purl the same key`() {
        // Arrange
        val encoded = "pkg:npm/%40acme/router@2.0.0"
        val plain = "pkg:npm/@acme/router@2.0.0"

        // Act
        val keys = listOf(encoded, plain).map { Purl.parse(it)!!.key }

        // Assert
        assertThat(keys).containsOnly("pkg:npm/%40acme/router@2.0.0")
    }

    @Test
    fun `should drop qualifiers and subpath from the key`() {
        // Arrange
        val purl = "pkg:maven/org.apache.commons/commons-text@1.9?type=jar#src"

        // Act
        val parsed = Purl.parse(purl)!!

        // Assert
        assertThat(parsed.key).isEqualTo("pkg:maven/org.apache.commons/commons-text@1.9")
        assertThat(parsed.version).isEqualTo("1.9")
    }

    @Test
    fun `should name packages the way their registry does`() {
        // Arrange
        val purls =
            listOf(
                "pkg:npm/%40acme/router@2.0.0",
                "pkg:maven/org.apache.commons/commons-text@1.9",
                "pkg:golang/github.com/pkg/errors@v0.9.1",
                "pkg:pypi/requests@2.31.0"
            )

        // Act
        val names = purls.map { Purl.parse(it)!!.packageName }

        // Assert
        assertThat(names).containsExactly("@acme/router", "org.apache.commons:commons-text", "github.com/pkg/errors", "requests")
    }

    @Test
    fun `should read a purl without a version`() {
        // Arrange
        val purl = "pkg:npm/express"

        // Act
        val parsed = Purl.parse(purl)!!

        // Assert
        assertThat(parsed.version).isNull()
        assertThat(parsed.key).isEqualTo("pkg:npm/express")
    }

    @Test
    fun `should not read a string that is no purl`() {
        // Arrange
        val notPurls = listOf("express@4.17.1", "pkg:npm")

        // Act
        val parsed = notPurls.map { Purl.parse(it) }

        // Assert
        assertThat(parsed).containsOnlyNulls()
    }
}
