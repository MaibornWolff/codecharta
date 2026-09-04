package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.csharp.CSharpAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class CSharpAnalyzerTest {
    @Test
    fun `should extract field types correctly`() {
        // given
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

        // when
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // then
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
        // given
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

        // when
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // then
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
        // given
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

        // when
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // then
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
        // given
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

        // when
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // then
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
        // given
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

        // when
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // then
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
        // given
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

        // when
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // then
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
        // given
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

        // when
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // then
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
        // given
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

        // when
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // then
        val dependencies = report.nodes.first().dependencies
        assertEquals(4, dependencies.size)
        assertThat(dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("De.Maibornwolff.DependaCharta.Analysis.Analyzers"), true),
            Dependency(Path.fromStringWithDots("System"), true),
            Dependency(Path.fromStringWithDots("System.Collections.Generic"), true),
            Dependency(Path.fromStringWithDots("Microsoft.Extensions.Options"), true)
        )
    }

    @Test
    fun `should add namespace specific imports only to the nodes of that namespace`() {
        // given
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

        // when
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // then
        assertThat(report.nodes).hasSize(2)
        val node1 = report.nodes[0]
        assertThat(node1.dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("De.Maibornwolff.DependaCharta.Analysis.Analyzers1"), true),
            Dependency(Path.fromStringWithDots("System"), true),
            Dependency(Path.fromStringWithDots("System.Collections.Generic"), true),
            Dependency(Path.fromStringWithDots("Microsoft.Extensions.Options"), true)
        )
        val node2 = report.nodes[1]
        assertThat(node2.dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("De.Maibornwolff.DependaCharta.Analysis.Analyzers2"), true)
        )
    }

    @Test
    fun `should add namespace specific imports only to the nodes of that simple namespace`() {
        // given
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

        // when
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // then
        assertThat(report.nodes).hasSize(2)
        val node1 = report.nodes[0]
        assertThat(node1.dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("Simple"), true),
            Dependency(Path.fromStringWithDots("System"), true),
            Dependency(Path.fromStringWithDots("System.Collections.Generic"), true),
            Dependency(Path.fromStringWithDots("Microsoft.Extensions.Options"), true)
        )
        val node2 = report.nodes[1]
        assertThat(node2.dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("OtherSimple"), true)
        )
    }

    @Test
    fun `should add the path of the classes package as an implicit wildcard dependency`() {
        // given
        val cSharpCode = """
            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers
            {
                public class CSharpAnalyzerTest 
                {
                }
            }
        """.trimIndent()

        // when
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // then
        val dependencies = report.nodes.first().dependencies
        assertEquals(1, dependencies.size)
        assertThat(dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("De.Maibornwolff.DependaCharta.Analysis.Analyzers"), true)
        )
    }

    @Test
    fun `should extract inheritance of a class to the usedTypes field`() {
        // given
        val cSharpCode = """
            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers
            {
                public class ChildClass : ParentClass
                {
                }
            }
        """.trimIndent()

        // when
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // then
        val usedTypes = report.nodes[0].usedTypes
        assertThat(usedTypes).containsExactlyInAnyOrder(
            Type.simple("ParentClass")
        )
    }

    @Test
    fun `should extract constructor calls to the usedTypes field`() {
        // given
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

        // when
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // then
        val usedTypes = report.nodes[0].usedTypes
        assertThat(usedTypes).containsExactlyInAnyOrder(
            Type.simple("ParentClass")
        )
    }

    @Test
    fun `should extract static member accesses to the usedTypes field`() {
        // given
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

        // when
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // then
        val usedTypes = report.nodes[0].usedTypes
        assertThat(usedTypes).contains(
            Type.simple("ParentClass")
        )
    }

    @Test
    fun `should parse file scoped simple namespace declaration correctly`() {
        // given
        val cSharpCode = """
namespace MyNameSpace;
public class TestClass(){ }
        """.trimIndent()

        // when
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // then
        val node = report.nodes.first()
        assertThat(node.pathWithName.parts).containsExactly("MyNameSpace", "TestClass")
    }

    @Test
    fun `should parse file qualified namespaces declaration correctly`() {
        // given
        val cSharpCode = """
namespace My.Name.Space;
public class TestClass(){ }
        """.trimIndent()

        // when
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // then
        val node = report.nodes.first()
        assertThat(node.pathWithName.parts).containsExactly("My", "Name", "Space", "TestClass")
    }

    @Test
    fun `should overwrite file scoped namespace declaration with class scoped namespace declaration`() {
        // given
        val cSharpCode = """
            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers;
            
            namespace De.Maibornwolff.DependaCharta.Analysis.OverwrittenNamespace
            {
                public class TestClass
                {
                }
            }
        """.trimIndent()

        // when
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // then
        val node = report.nodes.first()
        assertThat(
            node.pathWithName.parts
        ).containsExactly("De", "Maibornwolff", "DependaCharta", "Analysis", "OverwrittenNamespace", "TestClass")
    }

    @Test
    fun `should test generic type parameter`() {
        // given
        val cSharpCode = """
            namespace De.Maibornwolff.DependaCharta.Analysis.Analyzers
            {
                public class TestClass<TFoo, TBar> where TFoo : class, IFoobar
                {
                public TFoo Bar(){}
                }
            }
        """.trimIndent()

        // when
        val report = CSharpAnalyzer(FileInfo(SupportedLanguage.C_SHARP, "./path", cSharpCode)).analyze()

        // then
        val node = report.nodes.first()
        assertThat(node.usedTypes).containsExactlyInAnyOrder(Type.simple("TFoo"), Type.simple("IFoobar"))
    }
}
