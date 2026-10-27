package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.delphi

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.Node
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class DelphiAnalyzerTest {
    private fun analyze(code: String, physicalPath: String = "Game.Model.pas"): FileReport =
        DelphiAnalyzer(FileInfo(SupportedLanguage.DELPHI, physicalPath, code.trimIndent())).analyze()

    private fun File.withFiles(vararg files: Pair<String, String>): File {
        files.forEach { (path, content) -> resolve(path).also { it.parentFile.mkdirs() }.writeText(content.trimIndent()) }
        return this
    }

    private fun analyzeIn(root: File, physicalPath: String): FileReport =
        DelphiAnalyzer(FileInfo(SupportedLanguage.DELPHI, physicalPath, root.resolve(physicalPath).readText(), root)).analyze()

    private fun FileReport.usesOf(name: String) = nodes.single { it.pathWithName.parts.last() == name }.usedTypes.map { it.name }

    private fun unit(
        name: String,
        interfacePart: String,
        implementationPart: String = "",
        uses: String = "",
        implementationUses: String = ""
    ) = listOfNotNull(
        "unit $name;",
        "interface",
        uses.takeIf { it.isNotEmpty() }?.let { "uses $it;" },
        interfacePart,
        "implementation",
        implementationUses.takeIf { it.isNotEmpty() }?.let { "uses $it;" },
        implementationPart,
        "end."
    ).joinToString("\n")

    private val itemOfA = "Game.A.pas" to unit("Game.A", "type TItem = class end;")
    private val itemOfB = "Game.B.pas" to unit("Game.B", "type TItem = class end;")

    @Nested
    inner class Declarations {
        @Test
        fun `should place each type at the unit name plus its own, a member type below its outer type`() {
            // Arrange
            val code = """
                unit Game.Model;
                interface
                type
                  TCreature = class
                  public type
                    TStats = record end;
                  end;
                  IFight = interface end;
                  TKind = (kMonster, kBeast);
                implementation
                end.
            """

            // Act
            val report = analyze(code)

            // Assert
            assertThat(report.nodes).extracting({ it.pathWithName.parts }, { it.nodeType }).containsExactly(
                tuple(listOf("Game", "Model", "TCreature"), NodeType.CLASS),
                tuple(listOf("Game", "Model", "TCreature", "TStats"), NodeType.CLASS),
                tuple(listOf("Game", "Model", "IFight"), NodeType.INTERFACE),
                tuple(listOf("Game", "Model", "TKind"), NodeType.ENUM)
            )
        }

        @Test
        fun `should make every other type, a routine, a constant and a variable a declaration (decision 1)`() {
            // Arrange
            val code = """
                unit Game.Dice;
                interface
                type
                  TCreature = class end;
                  TEntity = TCreature;
                  PCreature = ^TCreature;
                const MaxHp = 100;
                var Current: TCreature;
                function Roll: Integer;
                implementation
                function Roll: Integer;
                begin
                  Result := MaxHp;
                end;
                end.
            """

            // Act
            val report = analyze(code)

            // Assert
            val usedTypeNames = { node: Node -> node.usedTypes.map { it.name } }
            assertThat(report.nodes).extracting({ it.pathWithName.parts.last() }, { it.nodeType }, usedTypeNames).containsExactly(
                tuple("TCreature", NodeType.CLASS, emptyList<String>()),
                tuple("TEntity", NodeType.CLASS, listOf("Game.Dice.TCreature")),
                tuple("PCreature", NodeType.CLASS, listOf("Game.Dice.TCreature")),
                tuple("MaxHp", NodeType.VARIABLE, emptyList<String>()),
                tuple("Current", NodeType.VARIABLE, listOf("Game.Dice.TCreature")),
                tuple("Roll", NodeType.FUNCTION, listOf("Game.Dice.MaxHp"))
            )
        }

        @Test
        fun `should set the language and the physical path of every node`() {
            // Arrange
            val code = "unit Game.Model;\ninterface\ntype TCreature = class end;\nimplementation\nend."

            // Act
            val node = analyze(code, "src/Game.Model.pas").nodes.single()

            // Assert
            assertThat(node.language).isEqualTo(SupportedLanguage.DELPHI)
            assertThat(node.physicalPath).isEqualTo("src/Game.Model.pas")
        }

        @Test
        fun `should report nothing for an empty file`() {
            // Arrange
            val code = ""

            // Act
            val report = analyze(code)

            // Assert
            assertThat(report.nodes).isEmpty()
        }

        @Test
        fun `should draw no use of the declaration itself`() {
            // Arrange
            val code = "unit Game.Node;\ninterface\ntype TNode = class Next: TNode; end;\nimplementation\nend."

            // Act
            val report = analyze(code)

            // Assert
            assertThat(report.usesOf("TNode")).isEmpty()
        }
    }

    @Nested
    inner class Lookup {
        @Test
        fun `should write a name the own unit declares as its full path`() {
            // Arrange
            val code = """
                unit Game.Model;
                interface
                type
                  TStats = record end;
                  TCreature = class Stats: TStats; end;
                implementation
                end.
            """

            // Act
            val report = analyze(code)

            // Assert
            assertThat(report.usesOf("TCreature")).containsExactly("Game.Model.TStats")
        }

        @Test
        fun `should take the unit listed last in the uses clause`(
            @TempDir root: File
        ) {
            // Arrange
            val user = unit("Game.User", "type TUser = class Item: TItem; end;", uses = "Game.A, Game.B")
            root.withFiles(itemOfA, itemOfB, "Game.User.pas" to user)

            // Act
            val report = analyzeIn(root, "Game.User.pas")

            // Assert
            assertThat(report.usesOf("TUser")).containsExactly("Game.B.TItem")
        }

        @Test
        fun `should look into the implementation uses first in a method body and only into the interface uses in the interface`(
            @TempDir root: File
        ) {
            // Arrange
            val user = unit(
                "Game.User",
                "type TUser = class Item: TItem; procedure Run; end;",
                "procedure TUser.Run; var Other: TItem; begin end;",
                uses = "Game.A",
                implementationUses = "Game.B"
            )
            root.withFiles(itemOfA, itemOfB, "Game.User.pas" to user)

            // Act
            val report = analyzeIn(root, "Game.User.pas")

            // Assert
            assertThat(report.usesOf("TUser")).containsExactly("Game.A.TItem", "Game.B.TItem")
        }

        @Test
        fun `should prefer the own unit over every used unit`(
            @TempDir root: File
        ) {
            // Arrange
            val mine = unit("Game.Mine", "type TItem = class end; TUser = class Item: TItem; end;", uses = "Game.A")
            root.withFiles(itemOfA, "Game.Mine.pas" to mine)

            // Act
            val report = analyzeIn(root, "Game.Mine.pas")

            // Assert
            assertThat(report.usesOf("TUser")).containsExactly("Game.Mine.TItem")
        }

        @Test
        fun `should not see what another unit declares in its implementation section`(
            @TempDir root: File
        ) {
            // Arrange
            val hiding = "Game.B.pas" to unit("Game.B", "", "type TItem = class end;")
            val user = unit("Game.User", "type TUser = class Item: TItem; end;", uses = "Game.A, Game.B")
            root.withFiles(itemOfA, hiding, "Game.User.pas" to user)

            // Act
            val report = analyzeIn(root, "Game.User.pas")

            // Assert
            assertThat(report.usesOf("TUser")).containsExactly("Game.A.TItem")
        }

        @Test
        fun `should draw no use for a name only a library unit can declare`(
            @TempDir root: File
        ) {
            // Arrange
            root.withFiles("Game.User.pas" to unit("Game.User", "type TUser = class Error: Exception; end;", uses = "System.SysUtils"))

            // Act
            val report = analyzeIn(root, "Game.User.pas")

            // Assert
            assertThat(report.usesOf("TUser")).isEmpty()
        }
    }

    @Nested
    inner class Members {
        @Test
        fun `should mean a member type a project ancestor in another unit declares (decision 4)`(
            @TempDir root: File
        ) {
            // Arrange
            val base = unit("Game.Base", "type TBase = class public type TItem = class end; end;")
            val child = unit("Game.Child", "type TChild = class(TBase) Item: TItem; end;", uses = "Game.Base, Game.A")
            root.withFiles(itemOfA, "Game.Base.pas" to base, "Game.Child.pas" to child)

            // Act
            val report = analyzeIn(root, "Game.Child.pas")

            // Assert
            assertThat(report.usesOf("TChild")).containsExactly("Game.Base.TBase", "Game.Base.TBase.TItem")
        }

        @Test
        fun `should let an inherited member hide a name of the used units in a method body (decision 4)`(
            @TempDir root: File
        ) {
            // Arrange
            val base = unit("Game.Base", "type TBase = class TItem: Integer; end;")
            val child = unit(
                "Game.Child",
                "type TChild = class(TBase) procedure Run; end;",
                "procedure TChild.Run; begin TItem := 1; end;",
                uses = "Game.Base, Game.A"
            )
            root.withFiles(itemOfA, "Game.Base.pas" to base, "Game.Child.pas" to child)

            // Act
            val report = analyzeIn(root, "Game.Child.pas")

            // Assert
            assertThat(report.usesOf("TChild")).containsExactly("Game.Base.TBase")
        }

        @Test
        fun `should let a helper see the members of the type it extends`(
            @TempDir root: File
        ) {
            // Arrange
            val model = unit("Game.Model", "type TCreature = class TItem: Integer; end;")
            val helper = unit(
                "Game.Helper",
                "type THelper = class helper for TCreature procedure Run; end;",
                "procedure THelper.Run; begin TItem := 1; end;",
                uses = "Game.Model, Game.A"
            )
            root.withFiles(itemOfA, "Game.Model.pas" to model, "Game.Helper.pas" to helper)

            // Act
            val report = analyzeIn(root, "Game.Helper.pas")

            // Assert
            assertThat(report.usesOf("THelper")).containsExactly("Game.Model.TCreature")
        }
    }

    @Nested
    inner class QualifiedNames {
        @Test
        fun `should take the unit a name is qualified with, whatever a later uses entry offers`(
            @TempDir root: File
        ) {
            // Arrange
            val facade = unit("Game.Facade", "type TFacade = class Item: Game.A.TItem; end;", uses = "Game.A, Game.B")
            root.withFiles(itemOfA, itemOfB, "Game.Facade.pas" to facade)

            // Act
            val report = analyzeIn(root, "Game.Facade.pas")

            // Assert
            assertThat(report.usesOf("TFacade")).containsExactly("Game.A.TItem")
        }

        @Test
        fun `should take the longest prefix that names a unit in scope`(
            @TempDir root: File
        ) {
            // Arrange
            val user = unit("Game.User", "type TUser = class Who: Game.Model.Extra.TWho; end;", uses = "Game.Model, Game.Model.Extra")
            root.withFiles(
                "Game.Model.pas" to unit("Game.Model", "type Extra = class end;"),
                "Game.Model.Extra.pas" to unit("Game.Model.Extra", "type TWho = class end;"),
                "Game.User.pas" to user
            )

            // Act
            val report = analyzeIn(root, "Game.User.pas")

            // Assert
            assertThat(report.usesOf("TUser")).containsExactly("Game.Model.Extra.TWho")
        }

        @Test
        fun `should mean the type for a member below it and a member type for a nested type`(
            @TempDir root: File
        ) {
            // Arrange
            val model = unit("Game.Model", "type TOuter = class public type TInner = class end; class function Make: TOuter; end;")
            val user = unit(
                "Game.User",
                "type TUser = class Inner: TOuter.TInner; procedure Run; end;",
                "procedure TUser.Run; begin TOuter.Make.Free; end;",
                uses = "Game.Model"
            )
            root.withFiles("Game.Model.pas" to model, "Game.User.pas" to user)

            // Act
            val report = analyzeIn(root, "Game.User.pas")

            // Assert
            assertThat(report.usesOf("TUser")).containsExactly("Game.Model.TOuter.TInner", "Game.Model.TOuter")
        }
    }

    @Nested
    inner class Case {
        @Test
        fun `should draw a use only for a name and a uses entry in their declared case`(
            @TempDir root: File
        ) {
            // Arrange
            root.withFiles(
                itemOfA,
                "Game.User.pas" to unit("Game.User", "type TUser = class Item: titem; end;", uses = "Game.A"),
                "Game.Lower.pas" to unit("Game.Lower", "type TLower = class Item: TItem; end;", uses = "game.a")
            )

            // Act
            val user = analyzeIn(root, "Game.User.pas")
            val lower = analyzeIn(root, "Game.Lower.pas")

            // Assert
            assertThat(user.usesOf("TUser") + lower.usesOf("TLower")).isEmpty()
        }

        @Test
        fun `should stop the lookup at a declaration written in another case`(
            @TempDir root: File
        ) {
            // Arrange
            root.withFiles(
                itemOfA,
                "Game.B.pas" to unit("Game.B", "type TITEM = class end;"),
                "Game.User.pas" to unit("Game.User", "type TUser = class Item: TItem; end;", uses = "Game.A, Game.B")
            )

            // Act
            val report = analyzeIn(root, "Game.User.pas")

            // Assert
            assertThat(report.usesOf("TUser")).isEmpty()
        }
    }

    @Nested
    inner class Attributes {
        @Test
        fun `should mean the type with the Attribute suffix before the name as written`(
            @TempDir root: File
        ) {
            // Arrange
            val mapping = unit("Game.Mapping", "type TableAttribute = class end; Table = class end; Column = class end;")
            val entityType = "type\n  [Table]\n  TEntity = class\n    [Column]\n    Name: string;\n  end;"
            val entity = unit("Game.Entity", entityType, uses = "Game.Mapping")
            root.withFiles("Game.Mapping.pas" to mapping, "Game.Entity.pas" to entity)

            // Act
            val report = analyzeIn(root, "Game.Entity.pas")

            // Assert
            assertThat(report.usesOf("TEntity")).containsExactly("Game.Mapping.TableAttribute", "Game.Mapping.Column")
        }
    }
}
