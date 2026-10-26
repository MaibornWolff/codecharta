package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Path
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Type
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CppAnalyzerTest {
    private fun analyze(code: String, file: String = "game/units.hpp") = CppAnalyzer(FileInfo(SupportedLanguage.CPP, file, code)).analyze()

    private fun usesOf(code: String, node: String) = analyze(code).nodes.first { it.name() == node }.usedTypes

    @Test
    fun `should write the class of each constructor invocation form as its path`() {
        // Arrange
        val names = listOf("Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta", "Iota", "Kappa")
        val code = """
            namespace t {
            ${names.joinToString("\n") { "struct $it { $it(int value = 0) {} };" }}
            class Foo {
                Alpha a;
                Beta b(42);
                Gamma g{b};
                Delta* d = new Delta;
                Epsilon* e = new Epsilon(99);
                Zeta z = Zeta{5};
                Eta* eta = new Eta(1);
                Theta t{1};
                Iota i = Iota(2);
                Kappa* k = new Kappa(7);
            };
            }
        """.trimIndent()

        // Act
        val usedTypes = usesOf(code, "Foo")

        // Assert
        assertThat(usedTypes.map { it.name }).containsAll(names.map { "t.$it" })
    }

    @Test
    fun `should keep the template arguments of a library template as uses of their own`() {
        // Arrange
        val code = """
            namespace t {
            struct UniqueTarget {};
            template <class E, class K> struct Repository {};
            struct Entity {};
            class Foo {
                std::unique_ptr<UniqueTarget> owned;
                std::shared_ptr<Repository<Entity, std::string>> repository;
            };
            }
        """.trimIndent()

        // Act
        val usedTypes = usesOf(code, "Foo")

        // Assert
        assertThat(usedTypes).containsExactlyInAnyOrder(
            Type.simple("t.UniqueTarget"),
            Type.generic("t.Repository", listOf(Type.simple("t.Entity")))
        )
    }

    @Test
    fun `should write a class named in a static call of an out-of-line member as its path`() {
        // Arrange
        val code = """
            namespace t {
            struct Assembler { static bool fits(int value); };
            struct Address { bool doSomething(int offset); };
            inline bool Address::doSomething(int offset) { return Assembler::fits(offset); }
            }
        """.trimIndent()

        // Act
        val usedTypes = usesOf(code, "Address")

        // Assert
        assertThat(usedTypes).contains(Type.simple("t.Assembler"))
    }

    @Test
    fun `should leave out the uses that no declaration of the include closure declares`() {
        // Arrange
        val code = """
            namespace t {
            struct Address { bool fits(int64_t offset, uint shift, std::string text, unsigned more, signed less, Missing missing); };
            }
        """.trimIndent()

        // Act
        val usedTypes = usesOf(code, "Address")

        // Assert
        assertThat(usedTypes).isEmpty()
    }

    @Test
    fun `should find a class of an enclosing namespace and one a using-directive brings in`() {
        // Arrange
        val code = """
            namespace game::app { struct CreatureFacade { static const int STANDARD = 1; }; }
            namespace game { struct HitPoints {}; }
            using namespace game::app;
            namespace game::model {
            struct Creature { Creature(const HitPoints& hitPoints); int type; };
            Creature::Creature(const HitPoints& hitPoints) : type(CreatureFacade::STANDARD) {}
            }
        """.trimIndent()

        // Act
        val usedTypes = usesOf(code, "Creature")

        // Assert
        assertThat(usedTypes.map { it.name }).containsExactlyInAnyOrder("game.HitPoints", "game.app.CreatureFacade")
    }

    @Test
    fun `should set the path of a node outside every namespace to its name alone`() {
        // Arrange
        val cppCode = """
            class Foo {
            };
        """.trimIndent()

        // Act
        val report =
            CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./foo/bar/classes/DummyClasses.cpp", cppCode)).analyze()

        // Assert
        assertThat(report.nodes.first().pathWithName).isEqualTo(Path("Foo"))
    }

    @Test
    fun `should set path of node to namespace if there is a namespace it resides in`() {
        // Arrange
        val cppCode = """
            namespace de::maibornwolff::codecharta::analysers::parsers::dependency::analysis {
                class DummyClass {
                    // This class is just a placeholder to test the include statement
                };
            }
        """.trimIndent()

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./foo/bar/classes", cppCode)).analyze()

        // Assert
        assertThat(
            report.nodes.first().pathWithName
        ).isEqualTo(Path.fromStringWithDots("de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.DummyClass"))
    }

    @Test
    fun `should set path of node to namespace it resides in, even when namespace is nested`() {
        // Arrange
        val cppCode = """
            namespace de::maibornwolff::codecharta::analysers::parsers::dependency::analysis {
                class FooClass {
                };
                namespace analyzers {
                    class BarClass {
                    };
                }
            }
        """.trimIndent()

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./path", cppCode)).analyze()

        // Assert
        assertThat(
            report.nodes.first().pathWithName
        ).isEqualTo(Path.fromStringWithDots("de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.FooClass"))
        assertThat(
            report.nodes[1].pathWithName
        ).isEqualTo(Path.fromStringWithDots("de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.BarClass"))
    }

    @Test
    fun `should handle nested namespaces`() {
        // Arrange
        val cppCode = """
            namespace de::maibornwolff::codecharta::analysers::parsers::dependency {
                namespace analysis {
                    namespace analyzers {
                        class DummyClass {
                        };
                    }
                }
            }
        """.trimIndent()

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./path", cppCode)).analyze()

        // Assert
        assertThat(
            report.nodes.first().pathWithName
        ).isEqualTo(Path.fromStringWithDots("de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.DummyClass"))
    }

    @Test
    fun `should recognize type declared inside of class as own node and with namespace of declared class`() {
        // Arrange
        val cppCode = """
            class B {
                enum Foo {
                    BAR,
                    BAZ
                };
            }
        """.trimIndent()

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "./path", cppCode)).analyze()

        // Assert
        assertThat(report.nodes.map { it.name() }).containsExactlyInAnyOrder("Foo", "B")
        val fooNode = report.nodes.first { it.name() == "Foo" }
        assertThat(fooNode.pathWithName.withoutName().last()).isEqualTo("B")
    }

    @Test
    fun `should give a global class declared in a header and its implementation file the same path`() {
        // Arrange — header declares the class; .cpp defines an out-of-class method for it.
        val headerCode = """
            class Executor {
                Executor(const Settings& settings);
            };
        """.trimIndent()
        val implCode = """
            Executor::Executor(const Settings& settings) {}
        """.trimIndent()

        // Act
        val headerReport = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "cli/executor.h", headerCode)).analyze()
        val implReport = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "cli/executor.cpp", implCode)).analyze()

        // Assert
        val headerExecutor = headerReport.nodes.single { it.name() == "Executor" }
        val implExecutor = implReport.nodes.single { it.name() == "Executor" }
        assertThat(implExecutor.pathWithName).isEqualTo(headerExecutor.pathWithName)
    }

    @Test
    fun `should make no node of a forward declaration`() {
        // Arrange
        val code = "namespace game { class Creature; }\nstruct Fightable { game::Creature *self; };"

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "fightable.hpp", code)).analyze()

        // Assert
        assertThat(report.nodes.map { it.name() }).containsExactly("Fightable")
    }

    @Test
    fun `should make no dependency of a namespace alias`() {
        // Arrange
        val code = "namespace m = game::model;\nstruct App { m::Creature *creature; };"

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "app.hpp", code)).analyze()

        // Assert
        assertThat(report.nodes.single().dependencies).noneMatch { it.path == Path("game", "model") }
    }

    @Test
    fun `should make no node of a type alias`() {
        // Arrange
        val code = "struct CreatureEntity {};\nusing Entity = CreatureEntity;\ntypedef int Meters;"

        // Act
        val report = CppAnalyzer(FileInfo(SupportedLanguage.CPP, "repo.hpp", code)).analyze()

        // Assert
        assertThat(report.nodes.map { it.name() }).containsExactly("CreatureEntity")
    }
}
