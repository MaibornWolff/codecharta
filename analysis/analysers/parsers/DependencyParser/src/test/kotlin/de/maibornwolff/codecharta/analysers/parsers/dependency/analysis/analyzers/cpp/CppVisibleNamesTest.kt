package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.cpp

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CppVisibleNamesTest {
    private fun namesOf(vararg files: String) =
        CppVisibleNames(files.map { CppFileFacts.of(TreeSitterDependencies.analyze(it, Language.CPP)) })

    private fun path(dotted: String) = dotted.split(".")

    @Test
    fun `should find a member type of the class before a class of its namespace`() {
        // Arrange
        val names = namesOf("struct Stats {};", "namespace g { struct Outer { struct Stats {}; }; }")

        // Act
        val found = names.resolve(listOf("Stats"), path("g.Outer"))

        // Assert
        assertThat(found).isEqualTo(path("g.Outer.Stats"))
    }

    @Test
    fun `should find a member type of a direct base class`() {
        // Arrange
        val names = namesOf("struct Item {};\nstruct Base { struct Item {}; };\nstruct Derived : Base {};")

        // Act
        val found = names.resolve(listOf("Item"), path("Derived"))

        // Assert
        assertThat(found).isEqualTo(path("Base.Item"))
    }

    @Test
    fun `should find the class of the innermost enclosing namespace`() {
        // Arrange
        val names = namesOf("struct Config {};\nnamespace game { struct Config {}; }\nnamespace game::app { struct App {}; }")

        // Act
        val found = names.resolve(listOf("Config"), path("game.app.App"))

        // Assert
        assertThat(found).isEqualTo(path("game.Config"))
    }

    @Test
    fun `should find what a using-declaration declares before the enclosing namespaces`() {
        // Arrange
        val names = namesOf("namespace lib { struct Widget {}; }\nstruct Widget {};\nnamespace app { using lib::Widget; struct Panel {}; }")

        // Act
        val found = names.resolve(listOf("Widget"), path("app.Panel"))

        // Assert
        assertThat(found).isEqualTo(path("lib.Widget"))
    }

    @Test
    fun `should count the names of a using-directive in the namespace that encloses it and the nominated one`() {
        // Arrange
        val names =
            namesOf("namespace a { struct N {}; }\nnamespace x { struct N {}; }\nnamespace x::y { using namespace a; struct U {}; }")

        // Act
        val found = names.resolve(listOf("N"), path("x.y.U"))

        // Assert
        assertThat(found).isEqualTo(path("x.N"))
    }

    @Test
    fun `should find nothing for a name two using-directives bring in`() {
        // Arrange
        val names =
            namesOf("namespace a { struct W {}; }\nnamespace b { struct W {}; }\nusing namespace a;\nusing namespace b;\nstruct Panel {};")

        // Act
        val found = names.resolve(listOf("W"), path("Panel"))

        // Assert
        assertThat(found).isNull()
    }

    @Test
    fun `should look the first segment of a qualified name up in the enclosing namespaces`() {
        // Arrange
        val names = namesOf(
            "namespace de::domain::model { struct Creature {}; }\nnamespace de::app::dto { struct Creature {}; }\nnamespace de::app { struct Inspector {}; }"
        )

        // Act
        val found = names.resolve(listOf("domain", "model", "Creature"), path("de.app.Inspector"))

        // Assert
        assertThat(found).isEqualTo(path("de.domain.model.Creature"))
    }

    @Test
    fun `should stop at a library name a using-declaration brings in`() {
        // Arrange
        val names = namesOf("struct string {};\nnamespace app { using std::string; struct Panel {}; }")

        // Act
        val found = names.resolve(listOf("string"), path("app.Panel"))

        // Assert
        assertThat(found).isNull()
    }

    @Test
    fun `should find a class the closure only declares forward`() {
        // Arrange
        val names = namesOf("namespace game { class Creature; }\nstruct Fightable {};")

        // Act
        val found = names.resolve(listOf("game", "Creature"), path("Fightable"))

        // Assert
        assertThat(found).isEqualTo(path("game.Creature"))
    }

    @Test
    fun `should read a namespace alias as the namespace it names`() {
        // Arrange
        val names = namesOf("namespace mylib::models { struct User {}; }\nnamespace m = mylib::models;\nnamespace app { struct App {}; }")

        // Act
        val found = names.resolve(listOf("m", "User"), path("app.App"))

        // Assert
        assertThat(found).isEqualTo(path("mylib.models.User"))
    }

    @Test
    fun `should read a type alias as a qualifier as the class it names`() {
        // Arrange
        val names = namesOf("namespace lib { struct Outer { struct Node {}; }; }\nnamespace app { using O = lib::Outer; struct User {}; }")

        // Act
        val found = names.resolve(listOf("O", "Node"), path("app.User"))

        // Assert
        assertThat(found).isEqualTo(path("lib.Outer.Node"))
    }

    @Test
    fun `should stop at a type alias that hides a class of an enclosing namespace`() {
        // Arrange
        val names =
            namesOf("struct Entity {};", "namespace repo { struct CreatureEntity {}; using Entity = CreatureEntity; struct Repo {}; }")

        // Act
        val found = names.resolve(listOf("Entity"), path("repo.Repo"))

        // Assert
        assertThat(found).isEqualTo(path("repo.Entity"))
    }
}
