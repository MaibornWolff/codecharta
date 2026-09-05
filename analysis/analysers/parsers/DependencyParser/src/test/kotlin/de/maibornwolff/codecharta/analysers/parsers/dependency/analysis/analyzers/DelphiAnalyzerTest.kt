package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.delphi.DelphiAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class DelphiAnalyzerTest {
    private fun analyze(code: String) = DelphiAnalyzer(FileInfo(SupportedLanguage.DELPHI, "./path", code)).analyze()

    @Test
    fun `should extract dotted unit name as package path`() {
        // Arrange
        val code = """
            unit MyCo.Utils;
            interface
            type
              THelper = class
              end;
            implementation
            end.
        """.trimIndent()

        // Act
        val report = analyze(code)

        // Assert
        val parts = report.nodes
            .first()
            .pathWithName.parts
        assertThat(parts).containsExactly("MyCo", "Utils", "THelper")
    }

    @Test
    fun `should extract uses clause entries as dependencies`() {
        // Arrange
        val code = """
            unit MyApp.Main;
            interface
            uses
              System.SysUtils,
              System.Classes;
            type
              TMain = class
              end;
            implementation
            end.
        """.trimIndent()

        // Act
        val report = analyze(code)

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertThat(dependencies).contains(
            Dependency(Path.fromStringWithDots("System.SysUtils")),
            Dependency(Path.fromStringWithDots("System.Classes"))
        )
    }

    @Test
    fun `should add implicit wildcard dependency for own unit package`() {
        // Arrange
        val code = """
            unit MyApp.Services;
            interface
            type
              TService = class
              end;
            implementation
            end.
        """.trimIndent()

        // Act
        val report = analyze(code)

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertThat(dependencies).contains(
            Dependency(Path.fromStringWithDots("MyApp.Services"), true)
        )
    }

    @Test
    fun `should create node for each class in a given file`() {
        // Arrange
        val code = """
            unit MyApp.Multiple;
            interface
            type
              TFirst = class
              end;
              TSecond = class
              end;
              TThird = class
              end;
            implementation
            end.
        """.trimIndent()

        // Act
        val report = analyze(code)

        // Assert
        val nodes = report.nodes
        assertEquals(3, nodes.size)
        val names = nodes.map { it.pathWithName.parts.last() }
        assertThat(names).containsExactly("TFirst", "TSecond", "TThird")
        nodes.forEach {
            assertThat(it.pathWithName.parts.dropLast(1)).containsExactly("MyApp", "Multiple")
        }
    }

    @Test
    fun `should extract class, interface, record, and enum declaration types`() {
        // Arrange
        val code = """
            unit MyApp.Types;
            interface
            type
              TMyClass = class
              end;
              IMyInterface = interface
              end;
              TMyRecord = record
              end;
              TMyEnum = (meFirst, meSecond);
            implementation
            end.
        """.trimIndent()

        // Act
        val report = analyze(code)

        // Assert
        val names = report.nodes.map { it.pathWithName.parts.last() }
        assertThat(names).contains("TMyClass", "IMyInterface", "TMyRecord", "TMyEnum")
    }

    @Test
    fun `should extract inheritance types`() {
        // Arrange
        val code = """
            unit MyApp.Derived;
            interface
            type
              TDerived = class(TBase)
              end;
            implementation
            end.
        """.trimIndent()

        // Act
        val report = analyze(code)

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).anyMatch { it.name == "TBase" }
    }

    @Test
    fun `should extract field types`() {
        // Arrange
        val code = """
            unit MyApp.Entity;
            interface
            type
              TEntity = class
                FName: TName;
                FCount: TCounter;
              end;
            implementation
            end.
        """.trimIndent()

        // Act
        val report = analyze(code)

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).anyMatch { it.name == "TName" }
        assertThat(usedTypes).anyMatch { it.name == "TCounter" }
    }

    @Test
    fun `should extract types of generics correctly`() {
        // Arrange
        val code = """
            unit MyApp.Generics;
            interface
            type
              TContainer = class
                FItems: TList<TItem>;
              end;
            implementation
            end.
        """.trimIndent()

        // Act
        val report = analyze(code)

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).contains(
            Type.generic("TList", listOf(Type.simple("TItem")))
        )
    }

    @Test
    fun `should extract method parameter and return types`() {
        // Arrange
        val code = """
            unit MyApp.Service;
            interface
            type
              TService = class
                function GetName(AId: TId): TName;
              end;
            implementation
            end.
        """.trimIndent()

        // Act
        val report = analyze(code)

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).anyMatch { it.name == "TId" }
        assertThat(usedTypes).anyMatch { it.name == "TName" }
    }

    @Test
    fun `should include parent class chain in nested type path`() {
        // Arrange
        val code = """
            unit MyApp.Nested;
            interface
            type
              TOuter = class
              public
                type
                  TInner = class
                  end;
              end;
            implementation
            end.
        """.trimIndent()

        // Act
        val report = analyze(code)

        // Assert
        val innerNode = report.nodes.first { it.pathWithName.parts.last() == "TInner" }
        assertThat(innerNode.pathWithName.parts).containsExactly("MyApp", "Nested", "TOuter", "TInner")
    }

    @Test
    fun `should return empty report for empty file`() {
        // Arrange
        val code = """
            unit MyApp.Empty;
            interface
            implementation
            end.
        """.trimIndent()

        // Act
        val report = analyze(code)

        // Assert
        assertThat(report.nodes).isEmpty()
    }

    @Test
    fun `should extract constructor calls to usedTypes correctly`() {
        // Arrange
        val code = """
            unit MyApp.Service;
            interface
            type
              TService = class
                procedure DoWork;
              end;
            implementation
            procedure TService.DoWork;
            begin
              THelper.Create;
            end;
            end.
        """.trimIndent()

        // Act
        val report = analyze(code)

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).anyMatch { it.name == "THelper" }
    }

    @Test
    fun `should not add empty-path wildcard dependency for package-less file`() {
        // Arrange
        val code = """
            type
              TStandalone = class
              end;
        """.trimIndent()

        // Act
        val report = analyze(code)

        // Assert
        val dependencies = report.nodes.flatMap { it.dependencies }
        assertThat(dependencies).noneMatch { it.path.parts.isEmpty() }
    }

    @Test
    fun `should set correct language and physical path for nodes`() {
        // Arrange
        val code = """
            unit MyApp.Path;
            interface
            type
              TPathUser = class
              end;
            implementation
            end.
        """.trimIndent()

        // Act
        val report = analyze(code)

        // Assert
        val node = report.nodes.first()
        assertEquals(SupportedLanguage.DELPHI, node.language)
        assertEquals("./path", node.physicalPath)
    }
}
