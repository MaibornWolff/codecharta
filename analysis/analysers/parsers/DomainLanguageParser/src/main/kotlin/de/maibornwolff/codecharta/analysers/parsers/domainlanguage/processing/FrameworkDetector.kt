package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import de.maibornwolff.codecharta.util.Logger
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject
import java.io.File
import java.nio.file.Path
import kotlin.io.path.readText

enum class Framework {
    REACT,
    ANGULAR,
    ASPNET,
    ENTITYFRAMEWORK
}

class FrameworkDetector {
    fun detectFrameworks(directoryPath: Path): Map<Path, Set<Framework>> {
        val frameworksByPath = mutableMapOf<Path, Set<Framework>>()
        val perEcosystem = listOf(detectJavaScriptFrameworks(directoryPath), detectCSharpFrameworks(directoryPath))
        for (detected in perEcosystem) {
            detected.forEach { (path, frameworks) ->
                frameworksByPath.merge(path, frameworks) { existing, new -> existing + new }
            }
        }
        return frameworksByPath
    }

    private fun detectJavaScriptFrameworks(directoryPath: Path): Map<Path, Set<Framework>> = detectFrameworksIn(
        projectFiles = findPackageJsonFiles(directoryPath),
        fileKind = "package.json",
        extractReferences = ::extractAllDependencies,
        identifyFrameworks = ::identifyJavaScriptFrameworks
    )

    private fun detectCSharpFrameworks(directoryPath: Path): Map<Path, Set<Framework>> = detectFrameworksIn(
        projectFiles = findCsprojFiles(directoryPath),
        fileKind = ".csproj",
        extractReferences = ::extractPackageReferences,
        identifyFrameworks = ::identifyCSharpFrameworks
    )

    // The two ecosystems share one skeleton: find the project files, read their references, map those to
    // frameworks, and store the non-empty result under the file's directory. Keeping it in one place also
    // keeps the per-directory merge strategy identical across ecosystems.
    private fun detectFrameworksIn(
        projectFiles: List<Path>,
        fileKind: String,
        extractReferences: (Path) -> Set<String>,
        identifyFrameworks: (Set<String>) -> Set<Framework>
    ): Map<Path, Set<Framework>> {
        val frameworksByPath = mutableMapOf<Path, Set<Framework>>()
        projectFiles.forEach { projectFile ->
            try {
                val frameworks = identifyFrameworks(extractReferences(projectFile))
                if (frameworks.isNotEmpty()) {
                    frameworksByPath.merge(projectFile.parent, frameworks) { existing, new -> existing + new }
                }
            } catch (e: Exception) {
                Logger.warn(e) { "Failed to parse $fileKind at $projectFile, skipping framework detection" }
            }
        }
        return frameworksByPath
    }

    // node_modules is excluded because every dependency ships its own package.json, which would
    // register the frameworks of libraries the project merely depends on as if they were its own.
    // findCsprojFiles needs no such guard: NuGet restores to a global cache, not into the source tree.
    private fun findPackageJsonFiles(directoryPath: Path): List<Path> = walkFiles(directoryPath) { file ->
        file.name == "package.json" && !file.path.contains("node_modules")
    }

    private fun findCsprojFiles(directoryPath: Path): List<Path> = walkFiles(directoryPath) { file ->
        file.isFile && file.extension == "csproj"
    }

    private fun walkFiles(directoryPath: Path, matches: (File) -> Boolean): List<Path> = directoryPath
        .toFile()
        .walkTopDown()
        .filter(matches)
        .map { it.toPath() }
        .toList()

    private fun extractPackageReferences(csprojPath: Path): Set<String> {
        val csprojContent = csprojPath.readText()
        val packageReferencePattern = Regex("""<PackageReference\s+Include="([^"]+)"""")
        return packageReferencePattern
            .findAll(csprojContent)
            .map { it.groupValues[1] }
            .toSet()
    }

    private fun extractAllDependencies(packageJsonPath: Path): Set<String> {
        val packageJsonContent = packageJsonPath.readText()
        val jsonObject = Json.parseToJsonElement(packageJsonContent).jsonObject
        val dependencies = extractDependencyKeys(jsonObject, "dependencies")
        val devDependencies = extractDependencyKeys(jsonObject, "devDependencies")
        return dependencies + devDependencies
    }

    private fun identifyJavaScriptFrameworks(dependencies: Set<String>) = buildSet {
        if (dependencies.contains("react")) {
            add(Framework.REACT)
        }
        if (dependencies.contains("@angular/core")) {
            add(Framework.ANGULAR)
        }
    }

    private fun identifyCSharpFrameworks(packageReferences: Set<String>) = buildSet {
        if (packageReferences.any { it.startsWith("Microsoft.AspNetCore") || it.startsWith("Microsoft.AspNet") }) {
            add(Framework.ASPNET)
        }
        if (packageReferences.any { it.startsWith("Microsoft.EntityFrameworkCore") || it.startsWith("EntityFramework") }) {
            add(Framework.ENTITYFRAMEWORK)
        }
    }

    private fun extractDependencyKeys(jsonObject: JsonObject, fieldName: String): Set<String> = jsonObject[fieldName]
        ?.jsonObject
        ?.keys
        ?: emptySet()
}
