package de.maibornwolff.treesitter.excavationsite.languages.delphi

import de.maibornwolff.treesitter.excavationsite.api.DelphiDeclaration
import de.maibornwolff.treesitter.excavationsite.api.DelphiDeclarationKind
import de.maibornwolff.treesitter.excavationsite.api.DelphiName
import de.maibornwolff.treesitter.excavationsite.api.DelphiSection
import de.maibornwolff.treesitter.excavationsite.api.DelphiUnitKind
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

class DelphiUnitTest {
    private fun unitOf(code: String) = TreeSitterDependencies.delphiUnit(code.trimIndent())

    private fun written(names: List<DelphiName>) = names.map { it.segments.joinToString(".") }

    private fun declarationNamed(code: String, name: String): DelphiDeclaration = unitOf(code).declarations.single { it.name == name }

    @Nested
    inner class Units {
        @Test
        fun `should read the routines after one whose local declarations stand between conditional directives`() {
            // Arrange
            val code = """
                unit Game.Dice;
                interface
                implementation
                function Normalize(Value: Integer): Integer;
                {${'$'}IFDEF MSWINDOWS}
                var
                  Index: Integer;
                (*${'$'}ENDIF*)
                begin
                  Result := Value;
                end;
                function Lookup: Integer;
                begin
                  Result := 1;
                end;
                end.
            """

            // Act
            val unit = unitOf(code)

            // Assert
            assertThat(unit.declarations.map { it.name }).containsExactly("Normalize", "Lookup")
        }

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

    @Nested
    inner class Names {
        @Test
        fun `should report the names a class writes, its base types outside it and its members inside it`() {
            // Arrange
            val code = """
                unit Game.Arena;
                interface
                type
                  TArena = class(TBase, IFight)
                  private
                    FBoss: TCreature;
                  public
                    property Boss: TCreature read FBoss;
                    function Move(Speed: TSpeed): THp;
                  end;
                implementation
                end.
            """

            // Act
            val names = declarationNamed(code, "TArena").names

            // Assert
            assertThat(names).extracting("segments", "section", "memberScope").containsExactly(
                tuple(listOf("TBase"), DelphiSection.INTERFACE, emptyList<String>()),
                tuple(listOf("IFight"), DelphiSection.INTERFACE, emptyList<String>()),
                tuple(listOf("TCreature"), DelphiSection.INTERFACE, listOf("TArena")),
                tuple(listOf("TSpeed"), DelphiSection.INTERFACE, listOf("TArena")),
                tuple(listOf("THp"), DelphiSection.INTERFACE, listOf("TArena"))
            )
        }

        @Test
        fun `should report the names of a method body in the implementation section, seeing its type's members`() {
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
                begin
                  Spawn;
                end;
                end.
            """

            // Act
            val names = declarationNamed(code, "TArena").names

            // Assert
            assertThat(names).extracting("segments", "section", "memberScope").containsExactly(
                tuple(listOf("Spawn"), DelphiSection.IMPLEMENTATION, listOf("TArena"))
            )
        }

        @Test
        fun `should leave out the names local declarations hide, ignoring case`() {
            // Arrange
            val code = """
                unit Game.Arena;
                interface
                type
                  TBox<T> = class
                    function Run<U>(const Hp: Integer): T;
                  end;
                implementation
                function TBox<T>.Run<U>(const Hp: Integer): T;
                const Limit = 3;
                var Count: Integer;
                  procedure Nested;
                  begin
                  end;
                begin
                  Count := HP + LIMIT + MaxHp;
                  for var Index := 0 to Count do Nested;
                  var Boss := TCreature.Create;
                  try
                    Self.Free;
                  except
                    on Error: EFail do Result := nil;
                  end;
                end;
                end.
            """

            // Act
            val names = declarationNamed(code, "TBox").names.filter { it.section == DelphiSection.IMPLEMENTATION }

            // Assert
            assertThat(written(names)).containsExactly("Integer", "MaxHp", "TCreature.Create", "EFail")
        }

        @Test
        fun `should keep a dotted chain up to the first call, index or generic argument list`() {
            // Arrange
            val code = """
                unit Game.Arena;
                interface
                procedure Run;
                implementation
                procedure Run;
                begin
                  Game.Dice.Roll(20);
                  TCreature.Spawn.Free;
                  Spawn(1).Free;
                  TLair(Thing).IsFull;
                  TList<TItem>.Create;
                  Items[0].Free;
                end;
                end.
            """

            // Act
            val names = declarationNamed(code, "Run").names

            // Assert
            assertThat(written(names)).containsExactly(
                "Game.Dice.Roll",
                "TCreature.Spawn.Free",
                "Spawn",
                "TLair",
                "Thing",
                "TList",
                "TItem",
                "Items"
            )
        }

        @Test
        fun `should merge the names of a routine's heading and body, each in its section, and give constants and variables theirs`() {
            // Arrange
            val code = """
                unit Game.Dice;
                interface
                const MaxHp = Base + 1;
                var Current, Previous: TCreature;
                function Roll(Sides: TSides): TResult;
                implementation
                function Roll(Sides: TSides): TResult;
                begin
                  Result := Seed;
                end;
                end.
            """

            // Act
            val declarations = unitOf(code).declarations

            // Assert
            assertThat(declarations).extracting({ it.name }, { written(it.names) }).containsExactly(
                tuple("MaxHp", listOf("Base")),
                tuple("Current", listOf("TCreature")),
                tuple("Previous", listOf("TCreature")),
                tuple("Roll", listOf("TSides", "TResult", "TSides", "TResult", "Seed"))
            )
            assertThat(declarations.last().names.map { it.section }.distinct())
                .containsExactly(DelphiSection.INTERFACE, DelphiSection.IMPLEMENTATION)
        }

        @Test
        fun `should report attributes, also qualified ones, with their arguments as names`() {
            // Arrange
            val code = """
                unit Game.Entity;
                interface
                type
                  [Table(TableName), Game.Mapping.Column]
                  TEntity = class
                  end;
                implementation
                end.
            """

            // Act
            val names = declarationNamed(code, "TEntity").names

            // Assert
            assertThat(names).extracting({ it.segments.joinToString(".") }, { it.isAttribute }).containsExactly(
                tuple("Table", true),
                tuple("TableName", false),
                tuple("Game.Mapping.Column", true)
            )
        }

        @Test
        fun `should report the type of an exception handler with and without a variable`() {
            // Arrange
            val code = """
                unit Game.Rules;
                interface
                procedure Check;
                implementation
                procedure Check;
                begin
                  try
                    Run;
                  except
                    on E: EFail do Exit;
                    on EAbort do Exit;
                  end;
                end;
                end.
            """

            // Act
            val names = declarationNamed(code, "Check").names

            // Assert
            assertThat(written(names)).containsExactly("Run", "EFail", "Exit", "EAbort")
        }

        @Test
        fun `should give a member type its own names`() {
            // Arrange
            val code = """
                unit Game.Model;
                interface
                type
                  TOuter = class
                  public type
                    TInner = class
                      Stat: TStat;
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
            assertThat(declarations).extracting({ it.name }, { written(it.names) }).containsExactly(
                tuple("TOuter", listOf("TInner")),
                tuple("TInner", listOf("TStat"))
            )
        }
    }

    @Nested
    inner class Script {
        @Test
        fun `should report the names of initialization and finalization as the script of a unit`() {
            // Arrange
            val code = """
                unit Game.Bootstrap;
                interface
                implementation
                uses Game.Util;
                initialization
                  Register;
                finalization
                  Unregister;
                end.
            """

            // Act
            val script = unitOf(code).script

            // Assert
            assertThat(script?.names?.let { written(it) }).containsExactly("Register", "Unregister")
        }

        @Test
        fun `should report the main block of a program as its script`() {
            // Arrange
            val code = """
                program Arena;
                uses Game.Model;
                begin
                  TCreature.Create.Free;
                end.
            """

            // Act
            val script = unitOf(code).script

            // Assert
            assertThat(script?.names?.let { written(it) }).containsExactly("TCreature.Create.Free")
        }

        @Test
        fun `should report no script for a program with an empty main block or a unit without initialization`() {
            // Arrange
            val program = "program Arena;\nbegin\nend."
            val unit = "unit Game.Model;\ninterface\nimplementation\nend."

            // Act
            val scripts = listOf(unitOf(program).script, unitOf(unit).script)

            // Assert
            assertThat(scripts).containsOnlyNulls()
        }
    }
}
