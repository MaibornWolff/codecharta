package de.maibornwolff.codecharta.analysers.parsers.dependency

import com.google.gson.JsonObject
import com.google.gson.JsonParser
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import picocli.CommandLine
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.PrintStream
import java.nio.file.Path
import kotlin.io.path.createDirectories
import kotlin.io.path.writeText

class DependencyParserTest {
    @Test
    fun `should label itself experimental wherever ccsh lists it`() {
        // Act
        val description = DependencyParser().getAnalyserDescription()

        // Assert
        assertThat(description).startsWith("[experimental]")
    }

    @Test
    fun `should not be applicable when the resource is blank`() {
        // Act
        val isApplicable = DependencyParser().isApplicable("   ")

        // Assert
        assertThat(isApplicable).isFalse()
    }

    @Test
    fun `should be applicable when the resource is a supported source file`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val sourceFile = tempDir.resolve("Service.kt")
        sourceFile.writeText("class Service")

        // Act
        val isApplicable = DependencyParser().isApplicable(sourceFile.toString())

        // Assert
        assertThat(isApplicable).isTrue()
    }

    @Test
    fun `should not be applicable when the resource is a file of an unsupported extension`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val unsupportedFile = tempDir.resolve("notes.txt")
        unsupportedFile.writeText("just prose")

        // Act
        val isApplicable = DependencyParser().isApplicable(unsupportedFile.toString())

        // Assert
        assertThat(isApplicable).isFalse()
    }

    @Test
    fun `should be applicable when a nested directory contains a supported source file`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val nestedDirectory = tempDir.resolve("src/main/kotlin")
        nestedDirectory.createDirectories()
        nestedDirectory.resolve("Deep.kt").writeText("class Deep")

        // Act
        val isApplicable = DependencyParser().isApplicable(tempDir.toString())

        // Assert
        assertThat(isApplicable).isTrue()
    }

    @Test
    fun `should not be applicable when the path does not exist`(
        @TempDir tempDir: Path
    ) {
        // Act
        val isApplicable = DependencyParser().isApplicable(tempDir.resolve("this/does/not/exist").toString())

        // Assert
        assertThat(isApplicable).isFalse()
    }

    @Test
    fun `should stop execution when the input file does not exist`() {
        // Act
        val exitCode = CommandLine(DependencyParser()).execute("thisDoesNotExist")

        // Assert
        assertThat(exitCode).isNotZero()
    }

    @Test
    fun `should emit a dependency lens with an edge between the two files of a dependency`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val projectDir = dependingFiles(tempDir)

        // Act
        val lenses = dependencyLensOf(runParser(projectDir))

        // Assert
        val edge = lenses.getAsJsonArray("edges").single().asJsonObject
        assertThat(edge.get("attributes").asJsonObject.get("dependencies").asInt).isEqualTo(1)
    }

    @Test
    fun `should levelize the folder tree by default`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val projectDir = dependingFiles(tempDir)

        // Act
        val lenses = dependencyLensOf(runParser(projectDir))

        // Assert
        assertThat(lenses.getAsJsonObject("nodes").entrySet()).isNotEmpty
    }

    @Test
    fun `should skip cycles and levels when graph analysis is omitted`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val projectDir = dependingFiles(tempDir)

        // Act
        val lenses = dependencyLensOf(runParser(projectDir, "--omit-graph-analysis"))

        // Assert
        assertThat(lenses.getAsJsonArray("edges")).isNotEmpty
        assertThat(lenses.has("nodes")).isFalse()
    }

    @Test
    fun `should exclude test files by default`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val projectDir = dependingFiles(tempDir)
        tempDir.resolve("InventoryServiceTest.kt").writeText("class InventoryServiceTest { fun test() {} }")

        // Act
        val output = runParser(projectDir)

        // Assert
        assertThat(output).doesNotContain("InventoryServiceTest.kt")
    }

    @Test
    fun `should include test files when asked to`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val projectDir = dependingFiles(tempDir)
        tempDir.resolve("InventoryServiceTest.kt").writeText("class InventoryServiceTest { fun test() {} }")

        // Act
        val output = runParser(projectDir, "--include-tests")

        // Assert
        assertThat(output).contains("InventoryServiceTest.kt")
    }

    @Test
    fun `should skip files at or above the size limit`(
        @TempDir tempDir: Path
    ) {
        // Arrange: a class padded past two kilobytes, next to the small fixture files.
        val projectDir = dependingFiles(tempDir)
        tempDir.resolve("Bulky.kt").writeText("package shop\n\nclass Bulky {\n" + "    fun pad() {}\n".repeat(200) + "}")

        // Act
        val output = runParser(projectDir, "--max-file-size", "2")

        // Assert
        assertThat(output).contains("InventoryService.kt")
        assertThat(output).doesNotContain("Bulky.kt")
    }

    @Test
    fun `should analyse only that file when the input is a single file`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        dependingFiles(tempDir)

        // Act
        val output = runParser(tempDir.resolve("InventoryService.kt").toString())

        // Assert
        assertThat(output).contains("InventoryService.kt")
        assertThat(output).doesNotContain("InventoryItem.kt")
    }

    @Test
    fun `should exclude files matching the exclude patterns`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val projectDir = dependingFiles(tempDir)

        // Act
        val output = runParser(projectDir, "-e", "Item")

        // Assert
        assertThat(output).contains("InventoryService.kt")
        assertThat(output).doesNotContain("InventoryItem.kt")
    }

    @Test
    fun `should exclude build folders when the project has no gitignore`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val projectDir = dependingFiles(tempDir)
        tempDir.resolve("build").createDirectories()
        tempDir.resolve("build/Generated.kt").writeText("package shop\n\nclass Generated")

        // Act
        val output = runParser(projectDir)

        // Assert
        assertThat(output).contains("InventoryService.kt")
        assertThat(output).doesNotContain("Generated.kt")
    }

    @Test
    fun `should include build folders when asked to`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val projectDir = dependingFiles(tempDir)
        tempDir.resolve("build").createDirectories()
        tempDir.resolve("build/Generated.kt").writeText("package shop\n\nclass Generated")

        // Act
        val output = runParser(projectDir, "--include-build-folders")

        // Assert
        assertThat(output).contains("Generated.kt")
    }

    @Test
    fun `should refuse the options that only make sense for a per-file analysis`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val projectDir = dependingFiles(tempDir)

        // Act
        val baseFileExitCode = CommandLine(DependencyParser()).execute(projectDir, "--base-file", "base.cc.json")
        val localChangesExitCode = CommandLine(DependencyParser()).execute(projectDir, "--local-changes")

        // Assert
        assertThat(baseFileExitCode).isNotZero()
        assertThat(localChangesExitCode).isNotZero()
    }

    @Test
    fun `should warn and continue when the piped project cannot be deserialized`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val projectDir = dependingFiles(tempDir)
        val outputStream = ByteArrayOutputStream()
        val parser = DependencyParser(ByteArrayInputStream("not a cc.json".toByteArray()), PrintStream(outputStream))

        // Act
        val exitCode = CommandLine(parser).execute(projectDir, "-", "-nc")

        // Assert
        assertThat(exitCode).isZero()
        assertThat(outputStream.toString()).contains("InventoryService.kt")
    }

    @Test
    fun `should draw an edge from an Angular template to each component and pipe it uses`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val projectDir = angularFiles(tempDir)

        // Act
        val output = runParser(projectDir)

        // Assert
        assertThat(fileEdgeNames(output)).containsExactlyInAnyOrder(
            "cave.component.html" to "torch.component.ts",
            "cave.component.html" to "gold-coins.pipe.ts"
        )
    }

    @Test
    fun `should draw an edge from an Angular component to its template file`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        tempDir.resolve("cave").createDirectories()
        tempDir.resolve("cave/cave.component.html").writeText("<p>{{ name }}</p>")
        tempDir.resolve("cave/cave.component.ts").writeText(
            """
            @Component({ selector: 'app-cave', templateUrl: './cave.component.html' })
            export class CaveComponent {}
            """.trimIndent()
        )

        // Act
        val output = runParser(tempDir.toString())

        // Assert
        assertThat(fileEdgeNames(output)).containsExactly("cave.component.ts" to "cave.component.html")
    }

    @Test
    fun `should draw an edge from an Angular component to the components and pipes of its inline template`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        tempDir.resolve("vault.component.ts").writeText(
            """
            @Component({ selector: 'app-vault', template: `<app-torch />{{ gold | goldCoins }}` })
            export class VaultComponent {}
            """.trimIndent()
        )
        tempDir.resolve("torch.component.ts").writeText("@Component({ selector: 'app-torch' })\nexport class TorchComponent {}")
        tempDir.resolve("gold-coins.pipe.ts").writeText("@Pipe({ name: 'goldCoins' })\nexport class GoldCoinsPipe {}")

        // Act
        val output = runParser(tempDir.toString())

        // Assert
        assertThat(fileEdgeNames(output)).containsExactlyInAnyOrder(
            "vault.component.ts" to "torch.component.ts",
            "vault.component.ts" to "gold-coins.pipe.ts"
        )
    }

    private fun fileEdgeNames(output: String): List<Pair<String, String>> {
        val namesById = fileNamesById(output)
        return dependencyLensOf(output).getAsJsonArray("edges").map { edge ->
            namesById.getValue(edge.asJsonObject.get("fromId").asString) to namesById.getValue(edge.asJsonObject.get("toId").asString)
        }
    }

    private fun fileNamesById(output: String): Map<String, String> {
        val namesById = HashMap<String, String>()

        fun collect(node: JsonObject) {
            namesById[node.get("id").asString] = node.get("name").asString
            node.getAsJsonArray("children")?.forEach { collect(it.asJsonObject) }
        }
        JsonParser.parseString(output).asJsonObject.getAsJsonArray("files").forEach { collect(it.asJsonObject) }
        return namesById
    }

    private fun angularFiles(tempDir: Path): String {
        tempDir.resolve("cave.component.html").writeText(
            """
            <app-torch [lit]="isLit" />
            <p>{{ treasure | goldCoins }}</p>
            <router-outlet />
            """.trimIndent()
        )
        tempDir.resolve("torch.component.ts").writeText(
            """
            @Component({ selector: 'app-torch', templateUrl: './torch.component.html' })
            export class TorchComponent {}
            """.trimIndent()
        )
        tempDir.resolve("gold-coins.pipe.ts").writeText(
            """
            @Pipe({ name: 'goldCoins' })
            export class GoldCoinsPipe {}
            """.trimIndent()
        )
        return tempDir.toString()
    }

    private fun dependingFiles(tempDir: Path): String {
        tempDir.resolve("InventoryItem.kt").writeText("package shop\n\nclass InventoryItem")
        tempDir.resolve("InventoryService.kt").writeText(
            """
            package shop

            class InventoryService {
                fun reserve(): InventoryItem = InventoryItem()
            }
            """.trimIndent()
        )
        return tempDir.toString()
    }

    private fun runParser(projectDir: String, vararg options: String): String {
        val outputStream = ByteArrayOutputStream()
        val parser = DependencyParser(ByteArrayInputStream(ByteArray(0)), PrintStream(outputStream))
        val exitCode = CommandLine(parser).execute(projectDir, "-nc", *options)
        assertThat(exitCode).isZero()
        return outputStream.toString()
    }

    private fun dependencyLensOf(output: String) = JsonParser
        .parseString(output)
        .asJsonObject
        .getAsJsonObject("lenses")
        .getAsJsonObject("dependency")
}
