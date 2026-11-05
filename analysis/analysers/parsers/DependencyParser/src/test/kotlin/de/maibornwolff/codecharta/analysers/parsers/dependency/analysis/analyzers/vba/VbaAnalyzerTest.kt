package de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.analyzers.vba

import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileInfo
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.FileReport
import de.maibornwolff.codecharta.analysers.parsers.dependency.analysis.model.NodeType
import de.maibornwolff.codecharta.analysers.parsers.dependency.input.SupportedLanguage
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.tuple
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.io.TempDir
import java.io.File

class VbaAnalyzerTest {
    private fun analyze(code: String, physicalPath: String): FileReport =
        VbaAnalyzer(FileInfo(SupportedLanguage.VBA, physicalPath, code.trimIndent())).analyze()

    private fun FileReport.usesOf(name: String) = nodes.single { it.pathWithName.parts.last() == name }.usedTypes.map { it.name }

    @Test
    fun `should place each declaration of a standard module at the module name plus its own, with its kind`() {
        // Arrange
        val code = """
            Attribute VB_Name = "modOrders"
            Public Type TOrder
                Id As Long
            End Type
            Public Enum EState
                Open
            End Enum
            Public Const LIMIT = 5
            Public gCount As Long
            Public Function Total() As Long
            End Function
        """

        // Act
        val report = analyze(code, "modules/modOrders.bas")

        // Assert
        assertThat(report.nodes).extracting({ it.pathWithName.parts }, { it.nodeType }, { it.language }).containsExactly(
            tuple(listOf("modOrders", "TOrder"), NodeType.CLASS, SupportedLanguage.VBA),
            tuple(listOf("modOrders", "EState"), NodeType.ENUM, SupportedLanguage.VBA),
            tuple(listOf("modOrders", "LIMIT"), NodeType.VARIABLE, SupportedLanguage.VBA),
            tuple(listOf("modOrders", "gCount"), NodeType.VARIABLE, SupportedLanguage.VBA),
            tuple(listOf("modOrders", "Total"), NodeType.FUNCTION, SupportedLanguage.VBA)
        )
    }

    @Test
    fun `should make a class module one class whose members name nothing of their own`() {
        // Arrange
        val code = """
            VERSION 1.0 CLASS
            BEGIN
              MultiUse = -1  'True
            END
            Attribute VB_Name = "clsCustomer"
            Private mName As String
            Public Property Get Name() As String
                Name = mName
            End Property
        """

        // Act
        val report = analyze(code, "clsCustomer.cls")

        // Assert
        assertThat(report.nodes.map { it.pathWithName.parts to it.nodeType }).containsExactly(listOf("clsCustomer") to NodeType.CLASS)
        assertThat(report.usesOf("clsCustomer")).isEmpty()
    }

    @Test
    fun `should name a module without a VB_Name after its file`() {
        // Arrange
        val code = "Public Function Twice() As Long\n    Twice = Half\nEnd Function\nPrivate Function Half() As Long\nEnd Function"

        // Act
        val report = analyze(code, "lib/Helpers.bas")

        // Assert
        assertThat(report.usesOf("Twice")).containsExactly("Helpers.Half")
    }

    @Test
    fun `should read a VB6 form with the VB6 grammar and find the modules of its run`(
        @TempDir root: File
    ) {
        // Arrange
        root.resolve("frmMain.frm").writeText(
            "VERSION 5.00\nBegin VB.Form frmMain\nEnd\nAttribute VB_Name = \"frmMain\"\n" +
                "Private Sub cmdOk_Click()\n    LogClick\nEnd Sub\n"
        )
        root.resolve("modLog.bas").writeText("Attribute VB_Name = \"modLog\"\nPublic Sub LogClick()\nEnd Sub\n")
        val form = root.resolve("frmMain.frm")

        // Act
        val report = VbaAnalyzer(FileInfo(SupportedLanguage.VBA, "frmMain.frm", form.readText(), root)).analyze()

        // Assert
        assertThat(report.usesOf("frmMain")).containsExactly("modLog.LogClick")
    }
}
