package de.maibornwolff.treesitter.excavationsite.languages.delphi

import de.maibornwolff.treesitter.excavationsite.api.DelphiDeclarationKind
import de.maibornwolff.treesitter.excavationsite.api.DelphiSection
import de.maibornwolff.treesitter.excavationsite.api.DelphiUnitKind
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class DelphiUnitTest {
    private fun unitOf(code: String) = TreeSitterDependencies.delphiUnit(code.trimIndent())

    @Nested
    inner class Units {
        @Test
        fun `should report the name and the entries of both uses clauses of a unit`() {
            // Arrange
            val code = """
                unit Game.Arena;
                interface
                uses Game.Model, System.SysUtils;
                implementation
                uses Game.Dice;
                end.
            """

            // Act
            val unit = unitOf(code)

            // Assert
            assertThat(unit.kind).isEqualTo(DelphiUnitKind.UNIT)
            assertThat(unit.name).containsExactly("Game", "Arena")
            assertThat(unit.interfaceUses).containsExactly(listOf("Game", "Model"), listOf("System", "SysUtils"))
            assertThat(unit.implementationUses).containsExactly(listOf("Game", "Dice"))
        }

        @Test
        fun `should report the uses of a program as its implementation uses and its routines in the implementation`() {
            // Arrange
            val code = """
                program Arena;
                uses Game.Model in 'src\Game.Model.pas', Game.Dice;
                procedure Configure;
                begin
                end;
                begin
                  Configure;
                end.
            """

            // Act
            val unit = unitOf(code)

            // Assert
            assertThat(unit.kind).isEqualTo(DelphiUnitKind.PROGRAM)
            assertThat(unit.name).containsExactly("Arena")
            assertThat(unit.interfaceUses).isEmpty()
            assertThat(unit.implementationUses).containsExactly(listOf("Game", "Model"), listOf("Game", "Dice"))
            assertThat(unit.declarations)
                .extracting("name", "kind", "section")
                .containsExactly(tuple("Configure", DelphiDeclarationKind.ROUTINE, DelphiSection.IMPLEMENTATION))
        }

        @Test
        fun `should report a library`() {
            // Arrange
            val code = """
                library Plugin;
                uses Game.Model;
                begin
                end.
            """

            // Act
            val unit = unitOf(code)

            // Assert
            assertThat(unit.kind).isEqualTo(DelphiUnitKind.LIBRARY)
            assertThat(unit.implementationUses).containsExactly(listOf("Game", "Model"))
        }
    }

    @Nested
    inner class Declarations {
        @Test
        fun `should report every kind of type with its section`() {
            // Arrange
            val code = """
                unit Game.Types;
                interface
                type
                  TCreature = class end;
                  TSpeed = record end;
                  IFight = interface end;
                  THelper = class helper for TCreature end;
                  TColor = (clRed, clBlue);
                  TEntity = TCreature;
                  PCreature = ^TCreature;
                  TCreatureClass = class of TCreature;
                  TColors = set of TColor;
                implementation
                type
                  TSecret = class end;
                end.
            """

            // Act
            val declarations = unitOf(code).declarations

            // Assert
            assertThat(declarations).extracting("name", "kind", "section").containsExactly(
                tuple("TCreature", DelphiDeclarationKind.CLASS, DelphiSection.INTERFACE),
                tuple("TSpeed", DelphiDeclarationKind.RECORD, DelphiSection.INTERFACE),
                tuple("IFight", DelphiDeclarationKind.INTERFACE, DelphiSection.INTERFACE),
                tuple("THelper", DelphiDeclarationKind.HELPER, DelphiSection.INTERFACE),
                tuple("TColor", DelphiDeclarationKind.ENUM, DelphiSection.INTERFACE),
                tuple("TEntity", DelphiDeclarationKind.TYPE, DelphiSection.INTERFACE),
                tuple("PCreature", DelphiDeclarationKind.TYPE, DelphiSection.INTERFACE),
                tuple("TCreatureClass", DelphiDeclarationKind.TYPE, DelphiSection.INTERFACE),
                tuple("TColors", DelphiDeclarationKind.TYPE, DelphiSection.INTERFACE),
                tuple("TSecret", DelphiDeclarationKind.CLASS, DelphiSection.IMPLEMENTATION)
            )
        }

        @Test
        fun `should report a class without a body and leave a forward declaration to the full one`() {
            // Arrange
            val code = """
                unit Game.Errors;
                interface
                type
                  EFail = class(Exception);
                  TNode = class;
                  TTree = class Root: TNode; end;
                  TNode = class Next: TNode; end;
                implementation
                end.
            """

            // Act
            val declarations = unitOf(code).declarations

            // Assert
            assertThat(declarations).extracting("name", "baseTypes").containsExactly(
                tuple("EFail", listOf(listOf("Exception"))),
                tuple("TTree", emptyList<List<String>>()),
                tuple("TNode", emptyList<List<String>>())
            )
        }

        @Test
        fun `should report routines, constants, resource strings and variables, one routine per name`() {
            // Arrange
            val code = """
                unit Game.Dice;
                interface
                const MaxHp = 100;
                resourcestring SName = 'name';
                var Current, Previous: Integer;
                threadvar PerThread: Integer;
                function Roll(Sides: Integer): Integer; overload;
                function Roll: Integer; overload;
                implementation
                function Roll(Sides: Integer): Integer;
                begin
                  Result := Sides;
                end;
                function Roll: Integer;
                begin
                  Result := 20;
                end;
                procedure Helper;
                begin
                end;
                end.
            """

            // Act
            val declarations = unitOf(code).declarations

            // Assert
            assertThat(declarations).extracting("name", "kind", "section").containsExactly(
                tuple("MaxHp", DelphiDeclarationKind.CONSTANT, DelphiSection.INTERFACE),
                tuple("SName", DelphiDeclarationKind.CONSTANT, DelphiSection.INTERFACE),
                tuple("Current", DelphiDeclarationKind.VARIABLE, DelphiSection.INTERFACE),
                tuple("Previous", DelphiDeclarationKind.VARIABLE, DelphiSection.INTERFACE),
                tuple("PerThread", DelphiDeclarationKind.VARIABLE, DelphiSection.INTERFACE),
                tuple("Roll", DelphiDeclarationKind.ROUTINE, DelphiSection.INTERFACE),
                tuple("Helper", DelphiDeclarationKind.ROUTINE, DelphiSection.IMPLEMENTATION)
            )
        }

        @Test
        fun `should leave method bodies and nested routines out`() {
            // Arrange
            val code = """
                unit Game.Arena;
                interface
                type
                  TArena = class
                    procedure Fight;
                  end;
                implementation
                procedure TArena.Fight;
                  procedure Nested;
                  begin
                  end;
                begin
                  Nested;
                end;
                end.
            """

            // Act
            val declarations = unitOf(code).declarations

            // Assert
            assertThat(declarations).extracting("name").containsExactly("TArena")
        }
    }

    @Nested
    inner class Types {
        @Test
        fun `should report the members of a class, its base types and its generic parameters`() {
            // Arrange
            val code = """
                unit Game.Arena;
                interface
                type
                  TArena<T: class> = class(Game.Base.TBase, IFight)
                    FBoss, FGuard: T;
                    const Max = 3;
                    class var Total: Integer;
                  public
                    property Boss: T read FBoss;
                    function Fight: Integer;
                  end;
                implementation
                end.
            """

            // Act
            val arena = unitOf(code).declarations.single()

            // Assert
            assertThat(arena.members).containsExactly("FBoss", "FGuard", "Max", "Total", "Boss", "Fight")
            assertThat(arena.baseTypes).containsExactly(listOf("Game", "Base", "TBase"), listOf("IFight"))
            assertThat(arena.genericParameters).containsExactly("T")
        }

        @Test
        fun `should report a member type as a declaration below its outer type and as a member`() {
            // Arrange
            val code = """
                unit Game.Model;
                interface
                type
                  TOuter = class
                  public type
                    TInner = class
                      X: Integer;
                    end;
                  public
                    Inner: TInner;
                  end;
                implementation
                end.
            """

            // Act
            val declarations = unitOf(code).declarations

            // Assert
            assertThat(declarations).extracting("name", "outerTypes", "members").containsExactly(
                tuple("TOuter", emptyList<String>(), listOf("TInner", "Inner")),
                tuple("TInner", listOf("TOuter"), listOf("X"))
            )
        }

        @Test
        fun `should report the values of an enum as its members`() {
            // Arrange
            val code = """
                unit Game.Kinds;
                interface
                type
                  TKind = (kMonster, kBeast);
                implementation
                end.
            """

            // Act
            val kind = unitOf(code).declarations.single()

            // Assert
            assertThat(kind.members).containsExactly("kMonster", "kBeast")
        }

        @Test
        fun `should report the type a helper extends as its first base type`() {
            // Arrange
            val code = """
                unit Game.Helper;
                interface
                type
                  TCreatureHelper = class helper for TCreature
                    function Title: string;
                  end;
                implementation
                end.
            """

            // Act
            val helper = unitOf(code).declarations.single()

            // Assert
            assertThat(helper.baseTypes).containsExactly(listOf("TCreature"))
            assertThat(helper.members).containsExactly("Title")
        }
    }
}
