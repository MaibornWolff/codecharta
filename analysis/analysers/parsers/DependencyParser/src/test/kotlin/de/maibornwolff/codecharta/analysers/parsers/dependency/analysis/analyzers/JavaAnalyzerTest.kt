package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.java.JavaAnalyzer
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.TypeOfUsage
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import kotlin.test.assertContains
import kotlin.test.assertTrue

class JavaAnalyzerTest {
    @Test
    fun `should extract field types correctly`() {
        // Arrange
        val javaCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers;
            
            public class JavaAnalyzerTest {
                private String name;
                private int age;
            }
        """.trimIndent()

        // Act
        val report = JavaAnalyzer(FileInfo(SupportedLanguage.JAVA, "./path", javaCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(Type.simple("String"), Type.simple("int"))
        )
    }

    @Test
    fun `should extract method return types correctly`() {
        // Arrange
        val javaCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers;
            
            public class JavaAnalyzerTest {
                public String getName() {
                    return "name";
                }
                
                public int getAge() {
                    return 42;
                }
            }
        """.trimIndent()

        // Act
        val report = JavaAnalyzer(FileInfo(SupportedLanguage.JAVA, "./path", javaCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(Type.simple("String"), Type.simple("int"))
        )
    }

    @Test
    fun `should extract method parameter types correctly`() {
        // Arrange
        val javaCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers;
            
            public class JavaAnalyzerTest {
                public void setName(String name) {
                }
                
                public void setAge(int age) {
                }
            }
        """.trimIndent()

        // Act
        val report = JavaAnalyzer(FileInfo(SupportedLanguage.JAVA, "./path", javaCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(Type.simple("String"), Type.simple("int"))
        )
    }

    @Test
    fun `should extract constructor parameter types correctly`() {
        // Arrange
        val javaCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers;
            
            public class JavaAnalyzerTest {
                public JavaAnalyzerTest(String name, int age) {
                }
            }
        """.trimIndent()

        // Act
        val report = JavaAnalyzer(FileInfo(SupportedLanguage.JAVA, "./path", javaCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(Type.simple("String"), Type.simple("int"))
        )
    }

    @Test
    fun `should extract used annotation types correctly`() {
        // Arrange
        val javaCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers;
            
            import java.lang.Override;
            import java.lang.SuppressWarnings;
            
            public class JavaAnalyzerTest {
                @Override
                @SuppressWarnings("unused")
                public void setName(String name) {
                }
            }
        """.trimIndent()

        // Act
        val report = JavaAnalyzer(FileInfo(SupportedLanguage.JAVA, "./path", javaCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(Type.simple("Override"), Type.simple("SuppressWarnings"))
        )
    }

    @Test
    fun `should create node for each class, enum, record, annotation and interface in a given file`() {
        // Arrange
        val javaCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers;
            
            public class JavaAnalyzerTest {
            }
            
            enum TestEnum {
            }
            
            record TestRecord() {
            }
            
            @interface TestAnnotation {
            }
            
            interface TestInterface {
            }
        """.trimIndent()

        // Act
        val report = JavaAnalyzer(FileInfo(SupportedLanguage.JAVA, "./path", javaCode)).analyze()

        // Assert
        val nodes = report.nodes
        assertEquals(5, nodes.size)
        assertEquals("JavaAnalyzerTest", nodes[0].pathWithName.parts.last())
        assertEquals("TestEnum", nodes[1].pathWithName.parts.last())
        assertEquals("TestRecord", nodes[2].pathWithName.parts.last())
        assertEquals("TestAnnotation", nodes[3].pathWithName.parts.last())
        assertEquals("TestInterface", nodes[4].pathWithName.parts.last())
    }

    @Test
    fun `should create node for each class and detect their usages of each other but not the resolved dependencies`() {
        // Arrange
        val javaCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers;
            
            public class A {
                private final B b = B();
            }
            
            public class B {
                private final A a = A();
            }
            
        """.trimIndent()

        // Act
        val report = JavaAnalyzer(FileInfo(SupportedLanguage.JAVA, "./path", javaCode)).analyze()

        // Assert
        val classA = report.nodes[0]
        assertContains(classA.usedTypes, Type("B", TypeOfUsage.USAGE, emptyList()))
        // Resolving happens in a later step of the processing pipeline.
        assertTrue(classA.resolvedNodeDependencies.internalDependencies.isEmpty())

        val classB = report.nodes[1]
        assertContains(classB.usedTypes, Type("A", TypeOfUsage.USAGE, emptyList()))
        assertTrue(classB.resolvedNodeDependencies.internalDependencies.isEmpty())
    }

    @Test
    fun `should extract types of generics correctly`() {
        // Arrange
        val javaCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers;
            
            public class JavaAnalyzerTest {
                private List<String> names;
                private Map<String, Integer> nameToAge;
            }
        """.trimIndent()

        // Act
        val report = JavaAnalyzer(FileInfo(SupportedLanguage.JAVA, "./path", javaCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsAll(
            listOf(
                Type.generic("List", listOf(Type.simple("String"))),
                Type.generic("Map", listOf(Type.simple("String"), Type.simple("Integer")))
            )
        )
    }

    @Test
    fun `should parse imports and add them to the node's dependencies`() {
        // Arrange
        val javaCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers;
            
            import java.util.List;
            import java.util.Map;
            
            public class JavaAnalyzerTest {
                private List<String> names;
                private Map<String, Integer> nameToAge;
            }
        """.trimIndent()

        // Act
        val report = JavaAnalyzer(FileInfo(SupportedLanguage.JAVA, "./path", javaCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertEquals(3, dependencies.size)
        assertThat(dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("de.maibornwolff.dependacharta.analysis.analyzers"), true),
            Dependency(Path.fromStringWithDots("java.util.List")),
            Dependency(Path.fromStringWithDots("java.util.Map"))
        )
    }

    @Test
    fun `should add implicit dependency on the class's package`() {
        // Arrange
        val javaCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers;
            
            public class JavaAnalyzerTest {
            }
        """.trimIndent()

        // Act
        val report = JavaAnalyzer(FileInfo(SupportedLanguage.JAVA, "./path", javaCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertEquals(1, dependencies.size)
        assertThat(dependencies).containsExactlyInAnyOrder(
            Dependency(Path.fromStringWithDots("de.maibornwolff.dependacharta.analysis.analyzers"), true)
        )
    }

    @Test
    fun `should extract types of throws clauses`() {
        // Arrange
        val javaCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers;
            
            public class JavaAnalyzerTest {
                public void setName(String name) throws IllegalArgumentException {
                }
                
                public void setAge(int age) throws IllegalArgumentException, IllegalStateException {
                }
            }
        """.trimIndent()

        // Act
        val report = JavaAnalyzer(FileInfo(SupportedLanguage.JAVA, "./path", javaCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).contains(
            Type.simple("IllegalArgumentException"),
            Type.simple("IllegalStateException")
        )
    }

    @Test
    fun `should extract the superclass of a class correctly`() {
        // Arrange
        val javaCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers;
            
            public class JavaAnalyzerTest extends SuperClass {
            }
        """.trimIndent()

        // Act
        val report = JavaAnalyzer(FileInfo(SupportedLanguage.JAVA, "./path", javaCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsExactlyInAnyOrder(
            Type.simple("SuperClass")
        )
    }

    @Test
    fun `should extract the interfaces of a class correctly`() {
        // Arrange
        val javaCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers;
            
            public class JavaAnalyzerTest implements Interface1, Interface2 {
            }
        """.trimIndent()

        // Act
        val report = JavaAnalyzer(FileInfo(SupportedLanguage.JAVA, "./path", javaCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsExactlyInAnyOrder(
            Type.simple("Interface1"),
            Type.simple("Interface2")
        )
    }

    @Test
    fun `should extract the extends clause of an interface correctly`() {
        // Arrange
        val javaCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers;
            
            public interface JavaAnalyzerTest extends Interface1, Interface2 {
            }
        """.trimIndent()

        // Act
        val report = JavaAnalyzer(FileInfo(SupportedLanguage.JAVA, "./path", javaCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).containsExactlyInAnyOrder(
            Type.simple("Interface1"),
            Type.simple("Interface2")
        )
    }

    @Test
    fun `should extract constructor calls to usedTypes correctly`() {
        // Arrange
        val javaCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers;
            
            public class JavaAnalyzerTest {
                public void someMethod() {
                    new SomeClass();
                }
            }
        """.trimIndent()

        // Act
        val report = JavaAnalyzer(FileInfo(SupportedLanguage.JAVA, "./path", javaCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).contains(
            Type.simple("SomeClass")
        )
    }

    @Test
    fun `should extract static field accesses to usedTypes correctly`() {
        // Arrange
        val javaCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers;
            
            public class JavaAnalyzerTest {
                public void someMethod() {
                    SomeClass.someField;
                }
            }
        """.trimIndent()

        // Act
        val report = JavaAnalyzer(FileInfo(SupportedLanguage.JAVA, "./path", javaCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).contains(
            Type.simple("SomeClass")
        )
    }

    @Test
    fun `should extract static method accesses to usedTypes correctly`() {
        // Arrange
        val javaCode = """
            package de.maibornwolff.dependacharta.analysis.analyzers;
            
            public class JavaAnalyzerTest {
                public void someMethod() {
                    SomeClass.someMethod();
                }
            }
        """.trimIndent()

        // Act
        val report = JavaAnalyzer(FileInfo(SupportedLanguage.JAVA, "./path", javaCode)).analyze()

        // Assert
        val usedTypes = report.nodes.first().usedTypes
        assertThat(usedTypes).contains(
            Type.simple("SomeClass")
        )
    }

    @Test
    fun `should not add empty-path wildcard dependency for package-less file`() {
        // Arrange
        val javaCode = """
            public class NoPackageClass {
                private String name;
            }
        """.trimIndent()

        // Act
        val report = JavaAnalyzer(FileInfo(SupportedLanguage.JAVA, "./path", javaCode)).analyze()

        // Assert
        val dependencies = report.nodes.first().dependencies
        assertThat(dependencies).noneMatch { it.path.parts.isEmpty() }
    }
}
