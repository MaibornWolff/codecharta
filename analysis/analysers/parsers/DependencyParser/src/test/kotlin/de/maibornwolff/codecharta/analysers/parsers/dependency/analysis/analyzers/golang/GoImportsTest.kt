package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.golang

import de.maibornwolff.treesitter.excavationsite.api.ImportDeclaration
import de.maibornwolff.treesitter.excavationsite.api.UsedType
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class GoImportsTest {
    private val folders = mapOf(
        listOf("example.com", "m", "domain", "model") to listOf("domain", "model"),
        listOf("example.com", "m", "v2", "models") to listOf("v2", "models"),
        listOf("gopkg.in", "yaml.v3") to listOf("vendor", "gopkg.in", "yaml.v3"),
        listOf("example.com", "m", "redis") to listOf("redis")
    )
    private val packageNames = mapOf(listOf("domain", "model") to "model", listOf("vendor", "gopkg.in", "yaml.v3") to "yaml")

    private fun importsOf(vararg imports: ImportDeclaration) = GoImports(imports.toList(), { folders[it.path] }) { packageNames[it] }

    private fun import(path: String, bindingName: String? = null) =
        ImportDeclaration(path.split("/"), isWildcard = false, bindingName = bindingName)

    @Test
    fun `should write a selector through the package name of an import as the full path of the declaration`() {
        // Arrange
        val imports = importsOf(import("example.com/m/domain/model"))

        // Act
        val name = imports.nameOf(UsedType("Creature", namespacePrefix = listOf("model")))

        // Assert
        assertThat(name).isEqualTo("domain.model.Creature")
    }

    @Test
    fun `should write a qualified type as written through its import as well`() {
        // Arrange
        val imports = importsOf(import("example.com/m/domain/model"))

        // Act
        val name = imports.nameOf(UsedType("model.Creature"))

        // Assert
        assertThat(name).isEqualTo("domain.model.Creature")
    }

    @Test
    fun `should bind an aliased import to its alias only`() {
        // Arrange
        val imports = importsOf(import("example.com/m/v2/models", bindingName = "m2"))

        // Act
        val names = listOf("m2", "models").map { imports.nameOf(UsedType("User", namespacePrefix = listOf(it))) }

        // Assert
        assertThat(names).containsExactly("v2.models.User", null)
    }

    @Test
    fun `should escape the dots of a folder as the logical path does`() {
        // Arrange
        val imports = importsOf(import("gopkg.in/yaml.v3"))

        // Act
        val name = imports.nameOf(UsedType("Unmarshal", namespacePrefix = listOf("yaml")))

        // Assert
        assertThat(name).isEqualTo("vendor.gopkg_in.yaml_v3.Unmarshal")
    }

    @Test
    fun `should name nothing through a blank import, a library or a value`() {
        // Arrange
        val imports = importsOf(import("example.com/m/redis", bindingName = "_"), import("github.com/google/uuid"))

        // Act
        val names = listOf("redis", "uuid", "creature").map { imports.nameOf(UsedType("Do", namespacePrefix = listOf(it))) }

        // Assert
        assertThat(names).containsExactly(null, null, null)
    }

    @Test
    fun `should keep a simple name as written`() {
        // Arrange
        val imports = importsOf(import("example.com/m/domain/model"))

        // Act
        val name = imports.nameOf(UsedType("Creature"))

        // Assert
        assertThat(name).isEqualTo("Creature")
    }
}
