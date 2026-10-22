package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp.CSharpAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies.DependencyResolverService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class CSharpAnalyzerTest {
    @Test
    fun `should extract field types correctly`() {
        // Arrange
        val cSharpCode = """
            using System;

            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers
            {
                public class CSharpAnalyzerTest
                {
                    private string name;
                    private int age;
                }
            }
        """.trimIndent()

        // Act
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(
                Type.simple("string"),
                Type.simple("int")
            )
        )
    }

    @Test
    fun `should extract method return types correctly`() {
        // Arrange
        val cSharpCode = """
            using System;

            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers
            {
            
                public class CSharpAnalyzerTest 
                {
                    public string getName() 
                    {
                        return "name";
                    }
                
                    public int getAge() 
                    {
                        return 42;
                    }
                }
            }
        """.trimIndent()

        // Act
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(
                Type.simple("string"),
                Type.simple("int")
            )
        )
    }

    @Test
    fun `should extract method parameter types correctly`() {
        // Arrange
        val cSharpCode = """
            using System;

            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers
            {
            
                public class CSharpAnalyzerTest 
                {
                
                    public void setName(string name) 
                    {
                    }
                
                    public void setAge(int age) 
                    {
                    }
                }
            }
        """.trimIndent()

        // Act
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(
                Type.simple("string"),
                Type.simple("int")
            )
        )
    }

    @Test
    fun `should extract constructor parameter types correctly`() {
        // Arrange
        val cSharpCode = """
            using System;

            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers
            {
                public class CSharpAnalyzerTest 
                {
                    public CSharpAnalyzerTest(string name, int age) 
                    {
                    }
                }
            }
        """.trimIndent()

        // Act
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(
                Type.simple("string"),
                Type.simple("int")
            )
        )
    }

    @Test
    fun `should extract used attributes correctly`() {
        // Arrange
        val cSharpCode = """
            using System;

            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers
            
                public class JavaAnalyzerTest
                {
                    [Obsolete, OtherAttribute]
                    [System.Diagnostics.CodeAnalysis.SuppressMessage("Usage", "CA1801:Review unused parameters", Justification = "This is just a test method.")]
                    public void SetName(string name)
                    {
                    }
                }
            }
        """.trimIndent()

        // Act
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsExactlyInAnyOrder(
            Type.simple("Obsolete"),
            Type.simple("ObsoleteAttribute"),
            Type.simple("OtherAttributeAttribute"),
            Type.simple("OtherAttribute"),
            Type.simple("System.Diagnostics.CodeAnalysis.SuppressMessage"),
            Type.simple("System.Diagnostics.CodeAnalysis.SuppressMessageAttribute"),
            Type.simple("string"),
            Type.simple("void")
        )
    }

    @Test
    fun `should create node for each class, enum, record, annotation and interface in a given file`() {
        // Arrange
        val cSharpCode = """
            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers
            {
                public class TestClass
                {
                }

                public enum TestEnum
                {
                }

                public record TestRecord();

                public interface TestInterface
                {
                }
                
                public struct TestStruct
                {
                }
                
                public delegate int TestDelegate() 
               
            }
        """.trimIndent()

        // Act
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(6, nodes.size)
        assertEquals("TestClass", nodes[0].pathWithName.parts.last())
        assertEquals("TestEnum", nodes[1].pathWithName.parts.last())
        assertEquals("TestRecord", nodes[2].pathWithName.parts.last())
        assertEquals("TestInterface", nodes[3].pathWithName.parts.last())
        assertEquals("TestStruct", nodes[4].pathWithName.parts.last())
        assertEquals("TestDelegate", nodes[5].pathWithName.parts.last())
    }

    @Test
    fun `should extract generic types correctly`() {
        // Arrange
        val cSharpCode = """
            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers
            {
            
                public class CSharpAnalyzerTest 
                {
                    private List<string> names;
                    private Map<string, int> nameToAge;
                }
            }
        """.trimIndent()

        // Act
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(
                Type.generic("List", listOf(Type.simple("string"))),
                Type.generic("Map", listOf(Type.simple("string"), Type.simple("int")))
            )
        )
    }

    @Test
    fun `should parse imports correctly and add them to the node's dependencies`() {
        // Arrange
        val cSharpCode = """
            using System;
            using System.Collections.Generic;
            
            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers 
            {
                using Microsoft.Extensions.Options; 
                
                public class CSharpAnalyzerTest 
                {
                    private List<string> names;
                    private Map<string, int> nameToAge;
                }
            
            }
        """.trimIndent()

        // Act
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertEquals(4, dependencies.size)
        assertThat(dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("De.Maibornwolff.DependaCharta.Analysis.Analyzers"), true),
            Dependency(Path.fromStringWithDots("System"), true, scope = emptyList()),
            Dependency(Path.fromStringWithDots("System.Collections.Generic"), true, scope = emptyList()),
            Dependency(
                Path.fromStringWithDots("Microsoft.Extensions.Options"),
                true,
                scope = listOf("De", "Maibornwolff", "DependaCharta", "Analysis", "Analyzers")
            )
        )
    }

    @Test
    fun `should add namespace specific imports only to the nodes of that namespace`() {
        // Arrange
        val cSharpCode = """
            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers1 
            {
                using System;
                using System.Collections.Generic;
                using Microsoft.Extensions.Options; 
                
                public class CSharpAnalyzerTest 
                {
                    private List<string> names;
                    private Map<string, int> nameToAge;
                }
            
            }
            
            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers2 
            {
                public class CSharpAnalyzerTest 
                {
                }
            }
        """.trimIndent()

        // Act
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // Assert
        assertThat(report.nodes).hasSize(2)
        val node1 = report.nodes[0]
        assertThat(node1.dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("De.Maibornwolff.DependaCharta.Analysis.Analyzers1"), true),
            Dependency(
                Path.fromStringWithDots("System"),
                true,
                scope = listOf("De", "Maibornwolff", "DependaCharta", "Analysis", "Analyzers1")
            ),
            Dependency(
                Path.fromStringWithDots("System.Collections.Generic"),
                true,
                scope = listOf("De", "Maibornwolff", "DependaCharta", "Analysis", "Analyzers1")
            ),
            Dependency(
                Path.fromStringWithDots("Microsoft.Extensions.Options"),
                true,
                scope = listOf("De", "Maibornwolff", "DependaCharta", "Analysis", "Analyzers1")
            )
        )
        val node2 = report.nodes[1]
        assertThat(node2.dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("De.Maibornwolff.DependaCharta.Analysis.Analyzers2"), true)
        )
    }

    @Test
    fun `should add namespace specific imports only to the nodes of that simple namespace`() {
        // Arrange
        val cSharpCode = """
            namespace Simple 
            {
                using System;
                using System.Collections.Generic;
                using Microsoft.Extensions.Options; 
                
                public class CSharpAnalyzerTest 
                {
                    private List<string> names;
                    private Map<string, int> nameToAge;
                }
            
            }
            
            namespace OtherSimple 
            {
                public class CSharpAnalyzerTest 
                {
                }
            }
        """.trimIndent()

        // Act
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // Assert
        assertThat(report.nodes).hasSize(2)
        val node1 = report.nodes[0]
        assertThat(node1.dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("Simple"), true),
            Dependency(Path.fromStringWithDots("System"), true, scope = listOf("Simple")),
            Dependency(Path.fromStringWithDots("System.Collections.Generic"), true, scope = listOf("Simple")),
            Dependency(Path.fromStringWithDots("Microsoft.Extensions.Options"), true, scope = listOf("Simple"))
        )
        val node2 = report.nodes[1]
        assertThat(node2.dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("OtherSimple"), true)
        )
    }

    @Test
    fun `should give a nested type the namespace and the usings of the type around it`() {
        // Arrange
        val cSharpCode = """
            namespace Shop
            {
                using System;

                public class Outer
                {
                    public class Inner
                    {
                    }
                }
            }
        """.trimIndent()

        // Act
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // Assert
        val inner = report.nodes.single { it.name() == "Inner" }
        assertThat(inner.dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("Shop"), true),
            Dependency(Path.fromStringWithDots("Shop.Outer"), true),
            Dependency(Path.fromStringWithDots("System"), true, scope = listOf("Shop"))
        )
    }

    @Test
    fun `should add the path of the classes package as an implicit wildcard dependency`() {
        // Arrange
        val cSharpCode = """
            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers
            {
                public class CSharpAnalyzerTest 
                {
                }
            }
        """.trimIndent()

        // Act
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertEquals(1, dependencies.size)
        assertThat(dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("De.Maibornwolff.DependaCharta.Analysis.Analyzers"), true)
        )
    }

    @Test
    fun `should extract inheritance of a class to the usedTypes field`() {
        // Arrange
        val cSharpCode = """
            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers
            {
                public class ChildClass : ParentClass
                {
                }
            }
        """.trimIndent()

        // Act
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // Assert
        val usedTypes = report.nodes[0].usedTypes
        assertThat(usedTypes).containsExactlyInAnyOrder(
            Type.simple("ParentClass")
        )
    }

    @Test
    fun `should extract constructor calls to the usedTypes field`() {
        // Arrange
        val cSharpCode = """
            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers
            {
                public class ChildClass
                {
                    public ChildClass()
                    {
                        new ParentClass();
                    }
                }
            }
        """.trimIndent()

        // Act
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // Assert
        val usedTypes = report.nodes[0].usedTypes
        assertThat(usedTypes).containsExactlyInAnyOrder(
            Type.simple("ParentClass")
        )
    }

    @Test
    fun `should extract static member accesses to the usedTypes field`() {
        // Arrange
        val cSharpCode = """
            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers
            {
                public class ChildClass
                {
                    public void test()
                    {
                        ParentClass.staticMethod();
                    }
                }
            }
        """.trimIndent()

        // Act
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // Assert
        val usedTypes = report.nodes[0].usedTypes
        assertThat(usedTypes).contains(
            Type.simple("ParentClass")
        )
    }

    @Test
    fun `should parse file scoped simple namespace declaration correctly`() {
        // Arrange
        val cSharpCode = """
namespace MyNameSpace;
public class TestClass(){ }
        """.trimIndent()

        // Act
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // Assert
        val node = report.nodes.first()
        assertThat(node.pathWithName.parts).containsExactly("MyNameSpace", "TestClass")
    }

    @Test
    fun `should parse file qualified namespaces declaration correctly`() {
        // Arrange
        val cSharpCode = """
namespace My.Name.Space;
public class TestClass(){ }
        """.trimIndent()

        // Act
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // Assert
        val node = report.nodes.first()
        assertThat(node.pathWithName.parts).containsExactly("My", "Name", "Space", "TestClass")
    }

    @Test
    fun `should overwrite file scoped namespace declaration with class scoped namespace declaration`() {
        // Arrange
        val cSharpCode = """
            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers;
            
            namespace De.Maibornwolff.DependaCharta.Analysis.OverwrittenNamespace
            {
                public class TestClass
                {
                }
            }
        """.trimIndent()

        // Act
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // Assert
        val node = report.nodes.first()
        assertThat(
            node.pathWithName.parts
        ).containsExactly("De", "Maibornwolff", "DependaCharta", "Analysis", "OverwrittenNamespace", "TestClass")
    }

    @Test
    fun `should not take a type parameter for a used type`() {
        // Arrange
        val cSharpCode = """
            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers
            {
                public class TestClass<TFoo, TBar> where TFoo : class, IFoobar
                {
                public TFoo Bar(){}
                }
            }
        """.trimIndent()

        // Act
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // Assert
        val node = report.nodes.first()
        assertThat(node.usedTypes).containsExactlyInAnyOrder(Type.simple("IFoobar"))
    }

    @Test
    fun `should resolve a using alias to the type or the namespace it stands for and import nothing else`() {
        // Arrange
        val aliases = "using Settings = B.Config;\nusing Remote = B.Settings;\n"
        val byTypeAlias = csharpFile("a/ByTypeAlias.cs", aliases + "namespace A { public class ByTypeAlias { public Settings Current; } }")
        val byTargetName = csharpFile("a/ByTargetName.cs", aliases + "namespace A { public class ByTargetName { public Config Current; } }")
        val byNamespaceAlias = csharpFile(
            "a/ByNamespaceAlias.cs",
            aliases + "namespace A { public class ByNamespaceAlias { public Remote.Section Current; } }"
        )
        val config = csharpFile("b/Config.cs", "namespace B { public class Config { } }")
        val section = csharpFile("b/settings/Section.cs", "namespace B.Settings { public class Section { } }")
        val files = arrayOf(byTypeAlias, byTargetName, byNamespaceAlias, config, section)

        // Act
        val typeAliasTargets = internalTargetsOf("ByTypeAlias", *files)
        val targetNameTargets = internalTargetsOf("ByTargetName", *files)
        val namespaceAliasTargets = internalTargetsOf("ByNamespaceAlias", *files)

        // Assert
        assertThat(typeAliasTargets).containsExactly("B.Config")
        assertThat(targetNameTargets).isEmpty()
        assertThat(namespaceAliasTargets).containsExactly("B.Settings.Section")
    }

    @Test
    fun `should look a simple name up in each enclosing namespace outwards, its types before its using directives`() {
        // Arrange
        val topUsing = csharpFile("a/b/Top.cs", "using C;\nnamespace A.B { public class Top { public Config Settings; } }")
        val innerUsing = csharpFile("a/b/Inner.cs", "namespace A.B { using C; public class Inner { public Config Settings; } }")
        val outerConfig = csharpFile("a/Config.cs", "namespace A { public class Config { } }")
        val importedConfig = csharpFile("c/Config.cs", "namespace C { public class Config { } }")
        val files = arrayOf(topUsing, innerUsing, outerConfig, importedConfig)

        // Act
        val topTargets = internalTargetsOf("Top", *files)
        val innerTargets = internalTargetsOf("Inner", *files)

        // Assert
        assertThat(topTargets).containsExactly("A.Config")
        assertThat(innerTargets).containsExactly("C.Config")
    }

    @Test
    fun `should not resolve a simple name that two using directives of one namespace both import`() {
        // Arrange
        val app = csharpFile("a/App.cs", "using B;\nusing C;\nnamespace A { public class App { public Config Settings; } }")
        val first = csharpFile("b/Config.cs", "namespace B { public class Config { } }")
        val second = csharpFile("c/Config.cs", "namespace C { public class Config { } }")

        // Act
        val targets = internalTargetsOf("App", app, first, second)

        // Assert
        assertThat(targets).isEmpty()
    }

    @Test
    fun `should not count a using alias of a namespace among the using directives that make a name ambiguous`() {
        // Arrange
        val facade =
            csharpFile("a/Facade.cs", "using Domain;\nusing Dto = A.Dto;\nnamespace A { public class Facade { public Creature Current; } }")
        val domainCreature = csharpFile("domain/Creature.cs", "namespace Domain { public class Creature { } }")
        val dtoCreature = csharpFile("a/dto/Creature.cs", "namespace A.Dto { public class Creature { } }")

        // Act
        val targets = internalTargetsOf("Facade", facade, domainCreature, dtoCreature)

        // Assert
        assertThat(targets).containsExactly("Domain.Creature")
    }

    @Test
    fun `should find the nested types of the base class the namespace rules resolve`() {
        // Arrange
        val report = csharpFile("a/b/Report.cs", "using X;\nnamespace A.B { public class Report : Document { public Section Part; } }")
        val outerDocument = csharpFile("a/Document.cs", "namespace A { public class Document { public class Section { } } }")
        val importedDocument = csharpFile("x/Document.cs", "namespace X { public class Document { public class Section { } } }")

        // Act
        val targets = internalTargetsOf("Report", report, outerDocument, importedDocument)

        // Assert
        assertThat(targets).containsExactlyInAnyOrder("A.Document", "A.Document.Section")
    }

    private fun csharpFile(physicalPath: String, content: String) = FileInfo(SupportedLanguage.C_SHARP, physicalPath, content)

    private fun internalTargetsOf(nodeName: String, vararg files: FileInfo): List<String> {
        val reports = files.map { CSharpAnalyzer(it).analyze() }
        val node = DependencyResolverService.resolveNodes(reports).first { it.name() == nodeName }
        return node.resolvedNodeDependencies.internalDependencies.map { it.withDots() }
    }
}
