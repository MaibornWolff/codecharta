package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.DeclaringCopy
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FilePath
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class CSharpCopyRulesTest {
    @TempDir
    lateinit var analysisRoot: File

    @Test
    fun `should point at every file of the nearest project that declares the path`() {
        // Arrange
        listOf("first/First.csproj", "second/Second.csproj").forEach { project(it) }
        val declaringFiles = listOf(
            "first/Order.cs",
            "first/generated/Order.g.cs",
            "second/Order.cs",
            "second/generated/Order.g.cs"
        ).map { copy(it) }

        // Act
        val files = CSharpCopyRules(CSharpProjects(analysisRoot)).filesFor(declaringFiles, file("second/Checkout.cs"))

        // Assert
        assertThat(files).containsExactly(file("second/Order.cs"), file("second/generated/Order.g.cs"))
    }

    @Test
    fun `should take the analysed files as one project when none has a csproj`() {
        // Arrange
        val declaringFiles = listOf("first/Util.cs", "second/Util.cs").map { copy(it) }

        // Act
        val files = CSharpCopyRules(CSharpProjects(analysisRoot)).filesFor(declaringFiles, file("second/Checkout.cs"))

        // Assert
        assertThat(files).containsExactly(file("first/Util.cs"), file("second/Util.cs"))
    }

    @Test
    fun `should prefer the own project of the using file over a nearer copy in a nested project`() {
        // Arrange
        listOf("Outer/Outer.csproj", "Outer/Plugins/P/P.csproj").forEach { project(it) }
        val declaringFiles = listOf("Outer/Model/Cfg.cs", "Outer/Plugins/P/Cfg.cs").map { copy(it) }

        // Act
        val files = CSharpCopyRules(CSharpProjects(analysisRoot)).filesFor(declaringFiles, file("Outer/Plugins/Use.cs"))

        // Assert
        assertThat(files).containsExactly(file("Outer/Model/Cfg.cs"))
    }

    @Test
    fun `should let a file type of the using file hide every other copy there`() {
        // Arrange
        val copies = listOf(copy("Domain/A.cs", isFileScoped = true), copy("Model/Types.cs"))

        // Act
        val files = CSharpCopyRules(CSharpProjects(analysisRoot)).filesFor(copies, file("Domain/A.cs"))

        // Assert
        assertThat(files).containsExactly(file("Domain/A.cs"))
    }

    @Test
    fun `should still point at every part when the using file holds a part of a partial type`() {
        // Arrange
        val copies = listOf(copy("Domain/Outer.Gen.cs"), copy("Domain/Outer.cs"))

        // Act
        val files = CSharpCopyRules(CSharpProjects(analysisRoot)).filesFor(copies, file("Domain/Outer.Gen.cs"))

        // Assert
        assertThat(files).containsExactly(file("Domain/Outer.Gen.cs"), file("Domain/Outer.cs"))
    }

    private fun project(path: String) = analysisRoot
        .resolve(path)
        .apply {
            parentFile.mkdirs()
        }.writeText("<Project Sdk=\"Microsoft.NET.Sdk\" />")

    private fun file(path: String) = FilePath(path.split("/"))

    private fun copy(path: String, isFileScoped: Boolean = false) = DeclaringCopy(file(path), isFileScoped)
}
