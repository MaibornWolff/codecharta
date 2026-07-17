package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import io.github.oshai.kotlinlogging.KotlinLogging
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.jsonObject
import java.nio.file.Path
import kotlin.io.path.readText

private val logger = KotlinLogging.logger {}

enum class Framework {
    REACT,
    ANGULAR,
    ASPNET,
    ENTITYFRAMEWORK
}

class FrameworkDetector {
    fun detectFrameworks(directoryPath: Path): Map<Path, Set<Framework>> {
        val frameworksByPath = mutableMapOf<Path, Set<Framework>>()

        // Detect JavaScript/TypeScript frameworks from package.json
        detectJavaScriptFrameworks(directoryPath).forEach { (path, frameworks) ->
            frameworksByPath.merge(path, frameworks) { existing, new -> existing + new }
        }

        // Detect C# frameworks from .csproj files
        detectCSharpFrameworks(directoryPath).forEach { (path, frameworks) ->
            frameworksByPath.merge(path, frameworks) { existing, new -> existing + new }
        }

        return frameworksByPath
    }

    private fun detectJavaScriptFrameworks(directoryPath: Path): Map<Path, Set<Framework>> {
        val packageJsonFiles = findPackageJsonFiles(directoryPath)

        if (packageJsonFiles.isEmpty()) {
            return emptyMap()
        }

        val frameworksByPath = mutableMapOf<Path, Set<Framework>>()
        packageJsonFiles.forEach { packageJsonPath ->
            try {
                val dependencies = extractAllDependencies(packageJsonPath)
                val frameworks = identifyJavaScriptFrameworks(dependencies)
                if (frameworks.isNotEmpty()) {
                    frameworksByPath[packageJsonPath.parent] = frameworks
                }
            } catch (e: Exception) {
                logger.warn(e) { "Failed to parse package.json at $packageJsonPath, skipping framework detection" }
            }
        }
        return frameworksByPath
    }

    private fun findPackageJsonFiles(directoryPath: Path): List<Path> = directoryPath
        .toFile()
        .walkTopDown()
        .filter { it.name == "package.json" && !it.path.contains("node_modules") }
        .map { it.toPath() }
        .toList()

    private fun detectCSharpFrameworks(directoryPath: Path): Map<Path, Set<Framework>> {
        val csprojFiles = findCsprojFiles(directoryPath)
        if (csprojFiles.isEmpty()) {
            return emptyMap()
        }

        val frameworksByPath = mutableMapOf<Path, Set<Framework>>()
        csprojFiles.forEach { csprojFile ->
            try {
                val packageReferences = extractPackageReferences(csprojFile)
                val frameworks = identifyCSharpFrameworks(packageReferences)
                if (frameworks.isNotEmpty()) {
                    val directory = csprojFile.parent
                    // Merge with existing frameworks if directory already has some
                    val existing = frameworksByPath[directory] ?: emptySet()
                    frameworksByPath[directory] = existing + frameworks
                }
            } catch (e: Exception) {
                logger.warn(e) { "Failed to parse .csproj at $csprojFile, skipping framework detection" }
            }
        }
        return frameworksByPath
    }

    private fun findCsprojFiles(directoryPath: Path): List<Path> = directoryPath
        .toFile()
        .walkTopDown()
        .filter { it.isFile && it.extension == "csproj" }
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
