package de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing

import de.maibornwolff.codecharta.analysers.parsers.domainlanguage.processing.keywords.Framework
import org.junit.jupiter.api.io.TempDir
import java.nio.file.Files
import java.nio.file.Path
import kotlin.io.path.writeText
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class FrameworkDetectorTest {
    @Test
    fun `should return empty map when no project files exist`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir)

        // Assert
        assertTrue(frameworksByPath.isEmpty())
    }

    @Test
    fun `should map directory to detected framework from package json`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val frontendDir = Files.createDirectory(tempDir.resolve("frontend"))
        val packageJson = frontendDir.resolve("package.json")
        packageJson.writeText(
            """
            {
              "name": "angular-project",
              "dependencies": {
                "@angular/core": "^17.0.0"
              }
            }
            """.trimIndent()
        )
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir)

        // Assert
        assertEquals(1, frameworksByPath.size)
        assertEquals(setOf(Framework.ANGULAR), frameworksByPath[frontendDir])
    }

    @Test
    fun `should map multiple directories to their respective frameworks`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val angularDir = Files.createDirectory(tempDir.resolve("angular-app"))
        val reactDir = Files.createDirectory(tempDir.resolve("react-app"))

        angularDir.resolve("package.json").writeText(
            """{"dependencies": {"@angular/core": "^17.0.0"}}"""
        )
        reactDir.resolve("package.json").writeText(
            """{"dependencies": {"react": "^18.0.0"}}"""
        )
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir)

        // Assert
        assertEquals(2, frameworksByPath.size)
        assertEquals(setOf(Framework.ANGULAR), frameworksByPath[angularDir])
        assertEquals(setOf(Framework.REACT), frameworksByPath[reactDir])
    }

    @Test
    fun `should return empty map when package json has no dependencies`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val packageJson = tempDir.resolve("package.json")
        packageJson.writeText("""{"name": "test-project"}""")
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir)

        // Assert
        assertTrue(frameworksByPath.isEmpty())
    }

    @Test
    fun `should detect React in dependencies`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val packageJson = tempDir.resolve("package.json")
        packageJson.writeText(
            """
            {
              "name": "react-project",
              "dependencies": {
                "react": "^18.0.0",
                "react-dom": "^18.0.0"
              }
            }
            """.trimIndent()
        )
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir)

        // Assert
        assertEquals(setOf(Framework.REACT), frameworksByPath[tempDir])
    }

    @Test
    fun `should detect Angular in dependencies`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val packageJson = tempDir.resolve("package.json")
        packageJson.writeText(
            """
            {
              "name": "angular-project",
              "dependencies": {
                "@angular/core": "^17.0.0",
                "@angular/common": "^17.0.0"
              }
            }
            """.trimIndent()
        )
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir)

        // Assert
        assertEquals(setOf(Framework.ANGULAR), frameworksByPath[tempDir])
    }

    @Test
    fun `should detect both React and Angular in same directory`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val packageJson = tempDir.resolve("package.json")
        packageJson.writeText(
            """
            {
              "name": "multi-framework-project",
              "dependencies": {
                "react": "^18.0.0",
                "@angular/core": "^17.0.0"
              }
            }
            """.trimIndent()
        )
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir)

        // Assert
        assertEquals(setOf(Framework.REACT, Framework.ANGULAR), frameworksByPath[tempDir])
    }

    @Test
    fun `should detect React in devDependencies`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val packageJson = tempDir.resolve("package.json")
        packageJson.writeText(
            """
            {
              "name": "react-dev-project",
              "devDependencies": {
                "react": "^18.0.0"
              }
            }
            """.trimIndent()
        )
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir)

        // Assert
        assertEquals(setOf(Framework.REACT), frameworksByPath[tempDir])
    }

    @Test
    fun `should detect Angular in devDependencies`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val packageJson = tempDir.resolve("package.json")
        packageJson.writeText(
            """
            {
              "name": "angular-dev-project",
              "devDependencies": {
                "@angular/core": "^17.0.0"
              }
            }
            """.trimIndent()
        )
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir)

        // Assert
        assertEquals(setOf(Framework.ANGULAR), frameworksByPath[tempDir])
    }

    @Test
    fun `should handle invalid JSON gracefully`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val packageJson = tempDir.resolve("package.json")
        packageJson.writeText("invalid json content {{{")
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir)

        // Assert
        assertTrue(frameworksByPath.isEmpty())
    }

    @Test
    fun `should return empty map when no framework is detected`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val packageJson = tempDir.resolve("package.json")
        packageJson.writeText(
            """
            {
              "name": "other-project",
              "dependencies": {
                "express": "^4.18.0",
                "lodash": "^4.17.21"
              }
            }
            """.trimIndent()
        )
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir)

        // Assert
        assertTrue(frameworksByPath.isEmpty())
    }

    @Test
    fun `should detect ASP NET from csproj file`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val csprojFile = tempDir.resolve("TestProject.csproj")
        csprojFile.writeText(
            """
            <Project Sdk="Microsoft.NET.Sdk.Web">
              <PropertyGroup>
                <TargetFramework>net8.0</TargetFramework>
              </PropertyGroup>
              <ItemGroup>
                <PackageReference Include="Microsoft.AspNetCore.Mvc" Version="2.2.0" />
                <PackageReference Include="Newtonsoft.Json" Version="13.0.1" />
              </ItemGroup>
            </Project>
            """.trimIndent()
        )
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir)

        // Assert
        assertEquals(setOf(Framework.ASPNET), frameworksByPath[tempDir])
    }

    @Test
    fun `should detect Entity Framework from csproj file`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val csprojFile = tempDir.resolve("TestProject.csproj")
        csprojFile.writeText(
            """
            <Project Sdk="Microsoft.NET.Sdk">
              <PropertyGroup>
                <TargetFramework>net8.0</TargetFramework>
              </PropertyGroup>
              <ItemGroup>
                <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
                <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
              </ItemGroup>
            </Project>
            """.trimIndent()
        )
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir)

        // Assert
        assertEquals(setOf(Framework.ENTITYFRAMEWORK), frameworksByPath[tempDir])
    }

    @Test
    fun `should detect both ASP NET and Entity Framework from csproj file`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val csprojFile = tempDir.resolve("TestProject.csproj")
        csprojFile.writeText(
            """
            <Project Sdk="Microsoft.NET.Sdk.Web">
              <PropertyGroup>
                <TargetFramework>net8.0</TargetFramework>
              </PropertyGroup>
              <ItemGroup>
                <PackageReference Include="Microsoft.AspNetCore.Mvc" Version="2.2.0" />
                <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
              </ItemGroup>
            </Project>
            """.trimIndent()
        )
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir)

        // Assert
        assertEquals(setOf(Framework.ASPNET, Framework.ENTITYFRAMEWORK), frameworksByPath[tempDir])
    }

    @Test
    fun `should merge frameworks from multiple csproj files in same directory`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val csprojFile1 = tempDir.resolve("WebProject.csproj")
        csprojFile1.writeText(
            """
            <Project Sdk="Microsoft.NET.Sdk.Web">
              <ItemGroup>
                <PackageReference Include="Microsoft.AspNetCore.Mvc" Version="2.2.0" />
              </ItemGroup>
            </Project>
            """.trimIndent()
        )
        val csprojFile2 = tempDir.resolve("DataProject.csproj")
        csprojFile2.writeText(
            """
            <Project Sdk="Microsoft.NET.Sdk">
              <ItemGroup>
                <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
              </ItemGroup>
            </Project>
            """.trimIndent()
        )
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir)

        // Assert
        assertEquals(setOf(Framework.ASPNET, Framework.ENTITYFRAMEWORK), frameworksByPath[tempDir])
    }

    @Test
    fun `should return empty map when csproj file has no recognized packages`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val csprojFile = tempDir.resolve("TestProject.csproj")
        csprojFile.writeText(
            """
            <Project Sdk="Microsoft.NET.Sdk">
              <PropertyGroup>
                <TargetFramework>net8.0</TargetFramework>
              </PropertyGroup>
              <ItemGroup>
                <PackageReference Include="Newtonsoft.Json" Version="13.0.1" />
              </ItemGroup>
            </Project>
            """.trimIndent()
        )
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir)

        // Assert
        assertTrue(frameworksByPath.isEmpty())
    }

    @Test
    fun `should map both package json and csproj to same directory when colocated`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val packageJson = tempDir.resolve("package.json")
        packageJson.writeText(
            """
            {
              "name": "fullstack-project",
              "dependencies": {
                "react": "^18.0.0"
              }
            }
            """.trimIndent()
        )
        val csprojFile = tempDir.resolve("Backend.csproj")
        csprojFile.writeText(
            """
            <Project Sdk="Microsoft.NET.Sdk.Web">
              <ItemGroup>
                <PackageReference Include="Microsoft.AspNetCore.Mvc" Version="2.2.0" />
              </ItemGroup>
            </Project>
            """.trimIndent()
        )
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir)

        // Assert
        assertEquals(1, frameworksByPath.size)
        assertTrue(frameworksByPath[tempDir]?.contains(Framework.REACT) == true)
        assertTrue(frameworksByPath[tempDir]?.contains(Framework.ASPNET) == true)
    }

    @Test
    fun `should skip the project files of folders the gitignore excludes`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        tempDir.resolve(".gitignore").writeText("node_modules/")
        val dependencyFolder = Files.createDirectories(tempDir.resolve("node_modules/some-package"))
        dependencyFolder.resolve("package.json").writeText(REACT_PACKAGE_JSON)
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir)

        // Assert
        assertTrue(frameworksByPath.isEmpty())
    }

    @Test
    fun `should skip a project file the gitignore excludes in a kept folder`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        tempDir.resolve(".gitignore").writeText("legacy/package.json")
        val legacyFolder = Files.createDirectories(tempDir.resolve("legacy"))
        legacyFolder.resolve("package.json").writeText(REACT_PACKAGE_JSON)
        legacyFolder.resolve("Kept.csproj").writeText(ASPNET_CSPROJ)
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir)

        // Assert
        assertEquals(mapOf(legacyFolder to setOf(Framework.ASPNET)), frameworksByPath)
    }

    @Test
    fun `should read the project files of ignored folders when the gitignore is bypassed`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        tempDir.resolve(".gitignore").writeText("generated/")
        val generatedFolder = Files.createDirectories(tempDir.resolve("generated/client"))
        generatedFolder.resolve("package.json").writeText(REACT_PACKAGE_JSON)
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir, useGitignore = false)

        // Assert
        assertEquals(setOf(Framework.REACT), frameworksByPath[generatedFolder])
    }

    @Test
    fun `should skip node_modules when the gitignore is bypassed`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val dependencyFolder = Files.createDirectories(tempDir.resolve("node_modules/some-package"))
        dependencyFolder.resolve("package.json").writeText(REACT_PACKAGE_JSON)
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir, useGitignore = false)

        // Assert
        assertTrue(frameworksByPath.isEmpty())
    }

    @Test
    fun `should skip the git folder when the gitignore is bypassed`(
        @TempDir tempDir: Path
    ) {
        // Arrange
        val gitFolder = Files.createDirectories(tempDir.resolve(".git/objects"))
        gitFolder.resolve("package.json").writeText(REACT_PACKAGE_JSON)
        val detector = FrameworkDetector()

        // Act
        val frameworksByPath = detector.detectFrameworks(tempDir, useGitignore = false)

        // Assert
        assertTrue(frameworksByPath.isEmpty())
    }

    companion object {
        private val ASPNET_CSPROJ =
            """
            <Project Sdk="Microsoft.NET.Sdk.Web">
              <ItemGroup>
                <PackageReference Include="Microsoft.AspNetCore.Mvc" Version="2.2.0" />
              </ItemGroup>
            </Project>
            """.trimIndent()

        private val REACT_PACKAGE_JSON =
            """
            {
              "name": "react-project",
              "dependencies": {
                "react": "^18.0.0"
              }
            }
            """.trimIndent()
    }
}
