package de.maibornwolff.codecharta.analysers.parsers.dependency.processing.dependencies

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Dependency
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeDependencies
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.TypeOfUsage
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.build
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

class DependencyResolverServiceTest {
    @Test
    fun `should resolve used type from same file`() {
        // Arrange
        val aClass = Node.build(
            pathWithName = Path(listOf("de", "mw", "A")),
            physicalPath = "de/mw/A.java",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.JAVA,
            dependencies = setOf(
                Dependency(Path(listOf("de", "mw")), true)
            ),
            usedTypes = setOf(Type("B", TypeOfUsage.USAGE, emptyList()))
        )

        val bClass = Node.build(
            pathWithName = Path(listOf("de", "mw", "B")),
            physicalPath = "de/mw/B.java",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.JAVA,
            dependencies = setOf(
                Dependency(Path(listOf("de", "mw")), true)
            ),
            usedTypes = setOf()
        )

        val report = FileReport(
            nodes = listOf(aClass, bClass)
        )

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(report))

        // Assert
        val expected = aClass.copy(
            resolvedNodeDependencies = NodeDependencies(
                internalDependencies = setOf(Dependency(bClass.pathWithName)),
                externalDependencies = emptySet()
            )
        )
        val actual = resolvedNodes.first { it.pathWithName.parts.last() == "A" }

        assertEquals(actual.resolvedNodeDependencies.internalDependencies, expected.resolvedNodeDependencies.internalDependencies)
    }

    @Test
    fun `should resolve a C++ use written as the exact path of its declaration`() {
        // Arrange
        val address = Node.build(
            pathWithName = Path(listOf("cpu", "aarch64", "assembler_aarch64_inline_hpp", "Address")),
            physicalPath = "cpu/aarch64/assembler_aarch64.inline.hpp",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.CPP,
            usedTypes = setOf(Type("foo.bar.anywhere.asm.assembler_inline_hpp.Assembler", TypeOfUsage.USAGE, emptyList()))
        )
        val assembler = Node.build(
            pathWithName = Path(listOf("foo", "bar", "anywhere", "asm", "assembler_inline_hpp", "Assembler")),
            physicalPath = "foo/bar/anywhere/asm/assembler.inline.hpp",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.CPP,
            dependencies = setOf(),
            usedTypes = setOf()
        )
        val anotherAssembler = Node.build(
            pathWithName = Path(listOf("de", "somewhere", "cpu", "assembler_aarch64_inline_hpp", "Assembler")),
            physicalPath = "de/somewhere/cpu/assembler_aarch64.inline.hpp",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.CPP,
            dependencies = setOf(),
            usedTypes = setOf()
        )
        val report = FileReport(
            nodes = listOf(anotherAssembler, address, assembler)
        )

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(report))

        // Assert
        val expected = address.copy(
            resolvedNodeDependencies = NodeDependencies(
                internalDependencies = setOf(Dependency(assembler.pathWithName)),
                externalDependencies = emptySet()
            )
        )
        val actual = resolvedNodes.first { it.pathWithName.parts.last() == "Address" }

        assertEquals(actual.resolvedNodeDependencies.internalDependencies, expected.resolvedNodeDependencies.internalDependencies)
    }

    @Test
    fun `should transform a list of nodes into the correct dictionary`() {
        // Arrange
        val node1 = Node.build(
            pathWithName = Path(listOf("de", "maibornwolff", "main")),
            physicalPath = "de/maibornwolff/main"
        )

        val node2 = Node.build(
            pathWithName = Path(listOf("de", "maibornwolff", "helper")),
            physicalPath = "de/maibornwolff/helper"
        )

        // Act
        val dictionary = DependencyResolverService.getDictionary(listOf(node1, node2))

        // Assert
        val expectedDictionary = mapOf("main" to listOf(node1.pathWithName), "helper" to listOf(node2.pathWithName))
        assertThat(dictionary).isEqualTo(expectedDictionary)
    }

    @Test
    fun `should transform a list of nodes into the correct known paths`() {
        // Arrange
        val node1 = Node.build(
            pathWithName = Path(listOf("de", "maibornwolff", "main")),
            physicalPath = "de/maibornwolff/main"
        )

        val node2 = Node.build(
            pathWithName = Path(listOf("de", "maibornwolff", "helper")),
            physicalPath = "de/maibornwolff/helper"
        )

        // Act
        val dictionary = DependencyResolverService.getKnownNodePaths(listOf(node1, node2))

        // Assert
        val expectedDictionary = setOf(node1.pathWithName.withDots(), node2.pathWithName.withDots())
        assertThat(dictionary).isEqualTo(expectedDictionary)
    }

    @Test
    fun `should resolve nodes with the dictionary and known paths`() {
        // Arrange
        val node1 = Node.build(
            pathWithName = Path(listOf("de", "maibornwolff", "main")),
            physicalPath = "de/maibornwolff/main"
        )

        val node2 = Node.build(
            pathWithName = Path(listOf("de", "maibornwolff", "helper")),
            physicalPath = "de/maibornwolff/helper"
        )

        val fileReport1 = FileReport(listOf(node1))
        val fileReport2 = FileReport(listOf(node2))

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(fileReport1, fileReport2))

        // Assert
        val expectedResolvedNodes = resolvedNodes.map { it.pathWithName }
        assertThat(resolvedNodes).hasSize(2)
        assertThat(expectedResolvedNodes).containsExactlyInAnyOrder(node1.pathWithName, node2.pathWithName)
    }

    @Test
    fun `should resolve Kotlin node and filter out standard library types`() {
        // Arrange
        val kotlinClass = Node.build(
            pathWithName = Path(listOf("com", "example", "MyClass")),
            physicalPath = "com/example/MyClass.kt",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.KOTLIN,
            dependencies = setOf(
                Dependency(Path(listOf("com", "example")), true)
            ),
            usedTypes = setOf(
                Type("String", TypeOfUsage.USAGE, emptyList()),
                Type("List", TypeOfUsage.USAGE, emptyList()),
                Type("OtherClass", TypeOfUsage.USAGE, emptyList())
            )
        )

        val otherClass = Node.build(
            pathWithName = Path(listOf("com", "example", "OtherClass")),
            physicalPath = "com/example/OtherClass.kt",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.KOTLIN,
            dependencies = setOf(
                Dependency(Path(listOf("com", "example")), true)
            ),
            usedTypes = setOf()
        )

        val report = FileReport(
            nodes = listOf(kotlinClass, otherClass)
        )

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(report))

        // Assert
        val myClassResolved = resolvedNodes.first { it.pathWithName.parts.last() == "MyClass" }
        assertThat(myClassResolved.resolvedNodeDependencies.internalDependencies)
            .containsExactly(Dependency(otherClass.pathWithName))
        assertThat(myClassResolved.resolvedNodeDependencies.externalDependencies)
            .isEmpty()
    }

    @Test
    fun `should resolve Go node and filter out standard library types`() {
        // Arrange
        val goStruct = Node.build(
            pathWithName = Path(listOf("myapp", "handler", "Server")),
            physicalPath = "handler/server.go",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.GO,
            dependencies = setOf(
                Dependency(Path(listOf("myapp", "handler")), true)
            ),
            usedTypes = setOf(
                Type("error", TypeOfUsage.USAGE, emptyList()),
                Type("string", TypeOfUsage.USAGE, emptyList()),
                Type("Handler", TypeOfUsage.USAGE, emptyList())
            )
        )

        val handler = Node.build(
            pathWithName = Path(listOf("myapp", "handler", "Handler")),
            physicalPath = "handler/handler.go",
            nodeType = NodeType.INTERFACE,
            language = SupportedLanguage.GO,
            dependencies = setOf(
                Dependency(Path(listOf("myapp", "handler")), true)
            ),
            usedTypes = setOf()
        )

        val report = FileReport(nodes = listOf(goStruct, handler))

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(report))

        // Assert
        val serverResolved = resolvedNodes.first { it.pathWithName.parts.last() == "Server" }
        assertThat(serverResolved.resolvedNodeDependencies.internalDependencies)
            .containsExactly(Dependency(handler.pathWithName))
        assertThat(serverResolved.resolvedNodeDependencies.externalDependencies)
            .isEmpty()
    }

    @Test
    fun `should mark a C# base type as implemented when a class names an interface and as inherited otherwise`() {
        // Arrange
        val namespace = Dependency(Path(listOf("Shop")), true)

        fun csharpType(name: String, nodeType: NodeType, vararg baseTypes: String) = Node.build(
            pathWithName = Path(listOf("Shop", name)),
            physicalPath = "$name.cs",
            nodeType = nodeType,
            language = SupportedLanguage.C_SHARP,
            dependencies = setOf(namespace),
            usedTypes = baseTypes.map { Type(it, TypeOfUsage.INHERITANCE, emptyList()) }.toSet()
        )
        val report = FileReport(
            nodes = listOf(
                csharpType("Report", NodeType.CLASS, "Document", "IPrintable"),
                csharpType("Document", NodeType.CLASS),
                csharpType("IPrintable", NodeType.INTERFACE, "IShape"),
                csharpType("IShape", NodeType.INTERFACE)
            )
        )

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(report))

        // Assert
        val internalDependenciesByName = resolvedNodes.associate { it.name() to it.resolvedNodeDependencies.internalDependencies }
        assertThat(internalDependenciesByName["Report"]).containsExactlyInAnyOrder(
            Dependency(Path(listOf("Shop", "Document")), type = TypeOfUsage.INHERITANCE),
            Dependency(Path(listOf("Shop", "IPrintable")), type = TypeOfUsage.IMPLEMENTATION)
        )
        assertThat(internalDependenciesByName["IPrintable"]).containsExactly(
            Dependency(Path(listOf("Shop", "IShape")), type = TypeOfUsage.INHERITANCE)
        )
    }

    @Test
    fun `should resolve a C# name to a nested type of the own type or of its base type before a type of the namespace`() {
        // Arrange
        fun csharpType(vararg pathWithName: String, usedTypes: Set<Type> = emptySet()) = Node.build(
            pathWithName = Path(pathWithName.toList()),
            physicalPath = "${pathWithName[1]}.cs",
            language = SupportedLanguage.C_SHARP,
            dependencies = setOf(Dependency(Path(listOf("Shop")), true)),
            usedTypes = usedTypes
        )
        val order = csharpType(
            "Shop",
            "Order",
            usedTypes = setOf(
                Type("Document", TypeOfUsage.INHERITANCE, emptyList()),
                Type.simple("Line"),
                Type.simple("Section")
            )
        )
        val report = FileReport(
            nodes = listOf(
                order,
                csharpType("Shop", "Order", "Line"),
                csharpType("Shop", "Line"),
                csharpType("Shop", "Document"),
                csharpType("Shop", "Document", "Section"),
                csharpType("Shop", "Section")
            )
        )

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(report))

        // Assert
        val resolvedOrder = resolvedNodes.first { it.pathWithName == order.pathWithName }
        assertThat(resolvedOrder.resolvedNodeDependencies.internalDependencies).containsExactlyInAnyOrder(
            Dependency(Path(listOf("Shop", "Document")), type = TypeOfUsage.INHERITANCE),
            Dependency(Path(listOf("Shop", "Order", "Line"))),
            Dependency(Path(listOf("Shop", "Document", "Section")))
        )
    }

    @Test
    fun `should resolve a C# attribute to whichever of its two names is an attribute class`() {
        // Arrange
        val attribute = Type("Audited", TypeOfUsage.USAGE, emptyList(), alternativeName = "AuditedAttribute")
        val suffixedIsAttribute = listOf(
            csharpClass("App", usedTypes = setOf(attribute)),
            csharpClass("Audited"),
            csharpClass("AuditedAttribute", baseTypes = listOf("System.Attribute"))
        )
        val plainIsAttributeThroughItsBase = listOf(
            csharpClass("App", usedTypes = setOf(attribute)),
            csharpClass("Audited", baseTypes = listOf("AuditBase")),
            csharpClass("AuditBase", baseTypes = listOf("Attribute")),
            csharpClass("AuditedAttribute")
        )

        // Act
        val suffixedTargets = internalTargetsOf("App", suffixedIsAttribute)
        val plainTargets = internalTargetsOf("App", plainIsAttributeThroughItsBase)

        // Assert
        assertThat(suffixedTargets).containsExactly("Shop.AuditedAttribute")
        assertThat(plainTargets).containsExactly("Shop.Audited")
    }

    @Test
    fun `should resolve a C# attribute to the suffixed name when neither is an attribute class and to the one that exists`() {
        // Arrange
        val attribute = Type("Audited", TypeOfUsage.USAGE, emptyList(), alternativeName = "AuditedAttribute")
        val app = csharpClass("App", usedTypes = setOf(attribute, Type.simple("Audited")))
        val bothOrdinary = listOf(app, csharpClass("Audited"), csharpClass("AuditedAttribute"))
        val onlyPlain = listOf(csharpClass("App", usedTypes = setOf(attribute)), csharpClass("Audited"))

        // Act
        val bothOrdinaryTargets = internalTargetsOf("App", bothOrdinary)
        val onlyPlainTargets = internalTargetsOf("App", onlyPlain)

        // Assert
        assertThat(bothOrdinaryTargets).containsExactlyInAnyOrder("Shop.AuditedAttribute", "Shop.Audited")
        assertThat(onlyPlainTargets).containsExactly("Shop.Audited")
    }

    @Test
    fun `should resolve a use to its first fallback that names a declaration when its own name names none`() {
        // Arrange
        val node = Type("app.second.Node", TypeOfUsage.USAGE, emptyList(), fallbacks = listOf(Type.simple("app.first.Node")))
        val nodes = listOf(pythonFunction(listOf("app", "tree", "grow"), setOf(node)), pythonFunction(listOf("app", "first", "Node")))

        // Act
        val targets = internalTargetsOf("grow", nodes)

        // Assert
        assertThat(targets).containsExactly("app.first.Node")
    }

    @Test
    fun `should resolve a use to its own name when that names a declaration, whatever its fallbacks name`() {
        // Arrange
        val node = Type("app.second.Node", TypeOfUsage.USAGE, emptyList(), fallbacks = listOf(Type.simple("app.first.Node")))
        val nodes = listOf(
            pythonFunction(listOf("app", "tree", "grow"), setOf(node)),
            pythonFunction(listOf("app", "first", "Node")),
            pythonFunction(listOf("app", "second", "Node"))
        )

        // Act
        val targets = internalTargetsOf("grow", nodes)

        // Assert
        assertThat(targets).containsExactly("app.second.Node")
    }

    @Test
    fun `should carry the kinds of declaration a use can mean into its dependency`() {
        // Arrange
        val audit = Type.simple("app.second.Node").copy(kinds = setOf("routine"))
        val nodes = listOf(pythonFunction(listOf("app", "tree", "grow"), setOf(audit)), pythonFunction(listOf("app", "second", "Node")))

        // Act
        val dependencies = DependencyResolverService
            .resolveNodes(listOf(FileReport(nodes)))
            .first { it.name() == "grow" }
            .resolvedNodeDependencies.internalDependencies

        // Assert
        assertThat(dependencies.map { it.kinds }).containsExactly(setOf("routine"))
    }

    private fun pythonFunction(pathWithName: List<String>, usedTypes: Set<Type> = emptySet()) = Node.build(
        pathWithName = Path(pathWithName),
        physicalPath = pathWithName.dropLast(1).joinToString("/") + ".py",
        language = SupportedLanguage.PYTHON,
        usedTypes = usedTypes
    )

    private fun csharpClass(name: String, usedTypes: Set<Type> = emptySet(), baseTypes: List<String> = emptyList()) = Node.build(
        pathWithName = Path(listOf("Shop", name)),
        physicalPath = "$name.cs",
        language = SupportedLanguage.C_SHARP,
        dependencies = setOf(Dependency(Path(listOf("Shop")), isWildcard = true, scope = emptyList())),
        usedTypes = usedTypes + baseTypes.map { Type(it, TypeOfUsage.INHERITANCE, emptyList()) }
    )

    private fun internalTargetsOf(name: String, nodes: List<Node>): List<String> = DependencyResolverService
        .resolveNodes(listOf(FileReport(nodes)))
        .first {
            it.name() == name
        }.resolvedNodeDependencies.internalDependencies
        .map {
            it.withDots()
        }

    @Test
    fun `should resolve C# node and filter out standard library types`() {
        // Arrange
        val csClass = Node.build(
            pathWithName = Path(listOf("MyApp", "Services", "UserService")),
            physicalPath = "Services/UserService.cs",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.C_SHARP,
            dependencies = setOf(
                Dependency(Path(listOf("MyApp", "Services")), true)
            ),
            usedTypes = setOf(
                Type("string", TypeOfUsage.USAGE, emptyList()),
                Type("bool", TypeOfUsage.USAGE, emptyList()),
                Type("UserRepository", TypeOfUsage.USAGE, emptyList())
            )
        )

        val repository = Node.build(
            pathWithName = Path(listOf("MyApp", "Services", "UserRepository")),
            physicalPath = "Services/UserRepository.cs",
            nodeType = NodeType.CLASS,
            language = SupportedLanguage.C_SHARP,
            dependencies = setOf(
                Dependency(Path(listOf("MyApp", "Services")), true)
            ),
            usedTypes = setOf()
        )

        val report = FileReport(nodes = listOf(csClass, repository))

        // Act
        val resolvedNodes = DependencyResolverService.resolveNodes(listOf(report))

        // Assert
        val serviceResolved = resolvedNodes.first { it.pathWithName.parts.last() == "UserService" }
        assertThat(serviceResolved.resolvedNodeDependencies.internalDependencies)
            .containsExactly(Dependency(repository.pathWithName))
        assertThat(serviceResolved.resolvedNodeDependencies.externalDependencies)
            .isEmpty()
    }
}
