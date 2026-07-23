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
    private data class Ecosystem(
        val fileKind: String,
        val findProjectFiles: (Path) -> List<Path>,
        val extractReferences: (Path) -> Set<String>,
        val identifyFrameworks: (Set<String>) -> Set<Framework>
    )

    private val ecosystems = listOf(
        Ecosystem("package.json", ::findPackageJsonFiles, ::extractAllDependencies, ::identifyJavaScriptFrameworks),
        Ecosystem(".csproj", ::findCsprojFiles, ::extractPackageReferences, ::identifyCSharpFrameworks)
    )

    fun detectFrameworks(directoryPath: Path): Map<Path, Set<Framework>> {
        val frameworksByPath = mutableMapOf<Path, Set<Framework>>()
        for (ecosystem in ecosystems) {
            ecosystem.findProjectFiles(directoryPath).forEach { projectFile ->
                addFrameworksOf(projectFile, ecosystem, frameworksByPath)
            }
        }
        return frameworksByPath
    }

    private fun addFrameworksOf(projectFile: Path, ecosystem: Ecosystem, frameworksByPath: MutableMap<Path, Set<Framework>>) {
        val frameworks = identifyFrameworks(projectFile, ecosystem)
        if (frameworks.isEmpty()) return
        frameworksByPath.merge(projectFile.parent, frameworks) { existing, new -> existing + new }
    }

    private fun identifyFrameworks(projectFile: Path, ecosystem: Ecosystem): Set<Framework> = try {
        ecosystem.identifyFrameworks(ecosystem.extractReferences(projectFile))
    } catch (e: Exception) {
        Logger.warn(e) { "Failed to parse ${ecosystem.fileKind} at $projectFile, skipping framework detection" }
        emptySet()
    }

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
