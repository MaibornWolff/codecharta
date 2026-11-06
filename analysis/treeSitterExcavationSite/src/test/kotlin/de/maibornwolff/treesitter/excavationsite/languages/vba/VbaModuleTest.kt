package de.maibornwolff.treesitter.excavationsite.languages.vba

import de.maibornwolff.treesitter.excavationsite.api.Language
import de.maibornwolff.treesitter.excavationsite.api.TreeSitterDependencies
import de.maibornwolff.treesitter.excavationsite.api.VbaDeclaration
import de.maibornwolff.treesitter.excavationsite.api.VbaDeclarationKind
import de.maibornwolff.treesitter.excavationsite.api.VbaModuleKind
import de.maibornwolff.treesitter.excavationsite.api.VbaName
import de.maibornwolff.treesitter.excavationsite.api.VbaNameKind
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test

class VbaModuleTest {
    private fun namesOfRoutine(body: String): List<VbaName> {
        val code = "Attribute VB_Name = \"modTest\"\nSub Probe(ByVal amount As Long)\n${body.trimIndent()}\nEnd Sub\n"
        return TreeSitterDependencies.vbaModule(code, Language.VBA).declarations.single().names
    }

    private fun code(vararg segments: String) = VbaName(segments.toList())

    @Test
    fun `should read the name of a standard module from its VB_Name attribute`() {
        // Arrange
        val code = "Attribute VB_Name = \"modOrders\"\nOption Explicit\n"

        // Act
        val module = TreeSitterDependencies.vbaModule(code, Language.VBA)

        // Assert
        assertThat(module.name).isEqualTo("modOrders")
        assertThat(module.kind).isEqualTo(VbaModuleKind.STANDARD)
    }

    @Test
    fun `should read a module without a VB_Name attribute as a module without a name`() {
        // Arrange & Act
        val module = TreeSitterDependencies.vbaModule("Sub Run()\nEnd Sub\n", Language.VBA)

        // Assert
        assertThat(module.name).isEmpty()
    }

    @Test
    fun `should read a module with a VERSION header as a class`() {
        // Arrange
        val classModule = "VERSION 1.0 CLASS\nBEGIN\n  MultiUse = -1  'True\nEND\nAttribute VB_Name = \"Form_frmOrders\"\n"
        val vb6Form = "VERSION 5.00\nBegin VB.Form frmMain\n   Caption = \"Main\"\nEnd\nAttribute VB_Name = \"frmMain\"\n"

        // Act
        val modules = listOf(
            TreeSitterDependencies.vbaModule(classModule, Language.VBA),
            TreeSitterDependencies.vbaModule(vb6Form, Language.VB6)
        )

        // Assert
        assertThat(modules.map { it.name to it.kind }).containsExactly(
            "Form_frmOrders" to VbaModuleKind.CLASS,
            "frmMain" to VbaModuleKind.CLASS
        )
        assertThat(modules.flatMap { it.names }).isEmpty()
    }

    @Test
    fun `should read every module-level declaration with its kind and whether other modules see it`() {
        // Arrange
        val code = """
            Attribute VB_Name = "modOrders"
            Public Type TPoint
                X As Long
            End Type
            Private Enum EColor
                Red = 1
                Green
            End Enum
            Private Const TAX_RATE As Double = 0.19
            Const LIMIT = 5
            Public Const MAX_ITEMS = 9
            Global gCount As Long, gName As String
            Dim mTotal As Long
            Private Declare PtrSafe Function GetTickCount Lib "kernel32" () As Long
            Function OrderTotal() As Long
            End Function
            Private Sub Recalculate()
            End Sub
        """.trimIndent()

        // Act
        val declarations = TreeSitterDependencies.vbaModule(code, Language.VBA).declarations

        // Assert
        assertThat(declarations.map { Triple(it.name, it.kind, it.isPublic) }).containsExactly(
            Triple("TPoint", VbaDeclarationKind.TYPE, true),
            Triple("EColor", VbaDeclarationKind.ENUM, false),
            Triple("TAX_RATE", VbaDeclarationKind.CONSTANT, false),
            Triple("LIMIT", VbaDeclarationKind.CONSTANT, false),
            Triple("MAX_ITEMS", VbaDeclarationKind.CONSTANT, true),
            Triple("gCount", VbaDeclarationKind.VARIABLE, true),
            Triple("gName", VbaDeclarationKind.VARIABLE, true),
            Triple("mTotal", VbaDeclarationKind.VARIABLE, false),
            Triple("GetTickCount", VbaDeclarationKind.ROUTINE, false),
            Triple("OrderTotal", VbaDeclarationKind.ROUTINE, true),
            Triple("Recalculate", VbaDeclarationKind.ROUTINE, false)
        )
    }

    @Test
    fun `should read the members of a type and the values of an enum, and the names they write`() {
        // Arrange
        val code = """
            Public Type TOrder
                Owner As clsCustomer
            End Type
            Public Enum EColor
                Red = BASE_COLOR
            End Enum
        """.trimIndent()

        // Act
        val declarations = TreeSitterDependencies.vbaModule(code, Language.VBA).declarations

        // Assert
        assertThat(declarations.map { it.members to it.names }).containsExactly(
            listOf("Owner") to listOf(code("clsCustomer")),
            listOf("Red") to listOf(code("BASE_COLOR"))
        )
    }

    @Test
    fun `should read the Get, Let and Set of a property as one declaration with the names of all of them`() {
        // Arrange
        val code = """
            Property Get Customer() As clsCustomer
            End Property
            Private Property Set Customer(ByVal value As clsCustomer)
                Set mCustomer = value
            End Property
        """.trimIndent()

        // Act
        val declarations = TreeSitterDependencies.vbaModule(code, Language.VBA).declarations

        // Assert
        assertThat(declarations).containsExactly(
            VbaDeclaration("Customer", VbaDeclarationKind.ROUTINE, true, names = listOf(code("clsCustomer"), code("mCustomer")))
        )
    }

    @Test
    fun `should read the declarations inside a conditional compilation block`() {
        // Arrange
        val code = "#If VBA7 Then\nPublic Declare PtrSafe Sub Sleep Lib \"kernel32\" (ByVal ms As Long)\n#Else\n" +
            "Public Declare Sub Sleep Lib \"kernel32\" (ByVal ms As Long)\n#End If\n"

        // Act
        val declarations = TreeSitterDependencies.vbaModule(code, Language.VBA).declarations

        // Assert
        assertThat(declarations.map { it.name }).containsExactly("Sleep")
    }

    @Test
    fun `should leave out the names that parameters, local declarations, labels and Me hide`() {
        // Arrange
        val body = """
            Dim total As Long, items() As Long
            Static calls As Long
            Const LOCAL_MAX = 3
            total = amount + calls + LOCAL_MAX + TAX_RATE
            ReDim items(5)
            Me.Caption = "x"
        retry:
            GoTo retry
            On Error GoTo retry
        """

        // Act
        val names = namesOfRoutine(body)

        // Assert
        assertThat(names).containsExactly(code("TAX_RATE"))
    }

    @Test
    fun `should read type names, qualified names and calls up to the first member of a value`() {
        // Arrange
        val body = """
            Dim point As modTypes.TPoint
            Dim customer As New clsCustomer
            Set customer = New clsCustomer
            Call modHelpers.LogMessage("opened")
            LogMessage "x"
            total = OrderTotal(1) + modOrders.OrderTotal(2)
            Form_frmMain.Caption = "x"
            CurrentDb.OpenRecordset("Orders").MoveNext
            If TypeOf customer Is clsVip Then Exit Sub
            With Recordset
                .MoveFirst
            End With
        """

        // Act
        val names = namesOfRoutine(body)

        // Assert
        assertThat(names).containsExactly(
            code("modTypes", "TPoint"),
            code("clsCustomer"),
            code("modHelpers", "LogMessage"),
            code("LogMessage"),
            code("total"),
            code("OrderTotal"),
            code("modOrders", "OrderTotal"),
            code("Form_frmMain", "Caption"),
            VbaName(listOf("Orders"), VbaNameKind.RELATION),
            code("clsVip"),
            code("Recordset")
        )
    }

    @Test
    fun `should end a name before the field a bang reads from a value`() {
        // Arrange & Act
        val names = namesOfRoutine("total = mRecords!Quantity")

        // Assert
        assertThat(names).containsExactly(code("total"), code("mRecords"))
    }

    @Test
    fun `should read the forms and reports that DoCmd opens by a literal name`() {
        // Arrange
        val body = """
            DoCmd.OpenForm "frmDetails", acNormal
            DoCmd.OpenForm FormName:="frmSearch"
            Application.DoCmd.OpenReport "rptInvoice", acViewPreview
            DoCmd.OpenReport ReportName:="rptStock"
            DoCmd.OpenForm formToOpen
        """

        // Act
        val accessObjects = namesOfRoutine(body).filter { it.kind != VbaNameKind.CODE }

        // Assert
        assertThat(accessObjects).containsExactly(
            VbaName(listOf("frmDetails"), VbaNameKind.FORM),
            VbaName(listOf("frmSearch"), VbaNameKind.FORM),
            VbaName(listOf("rptInvoice"), VbaNameKind.REPORT),
            VbaName(listOf("rptStock"), VbaNameKind.REPORT)
        )
    }

    @Test
    fun `should read the forms and reports that the Forms and Reports collections name`() {
        // Arrange
        val body = """
            Forms!frmMain!txtName = "a"
            caption = Forms("frmOrders").Caption
            Forms("frmStock").Requery
            Reports!rptInvoice.Visible = True
            Reports("rptStock").Visible = True
        """

        // Act
        val names = namesOfRoutine(body)

        // Assert
        assertThat(names).containsExactly(
            VbaName(listOf("frmMain"), VbaNameKind.FORM),
            code("caption"),
            VbaName(listOf("frmOrders"), VbaNameKind.FORM),
            VbaName(listOf("frmStock"), VbaNameKind.FORM),
            VbaName(listOf("rptInvoice"), VbaNameKind.REPORT),
            VbaName(listOf("rptStock"), VbaNameKind.REPORT)
        )
    }

    @Test
    fun `should read the forms and reports the collections name in brackets`() {
        // Arrange
        val body = """
            [Forms]![frmMain]![txtName] = "a"
            [Reports]![rptInvoice].Visible = True
        """

        // Act
        val names = namesOfRoutine(body)

        // Assert
        assertThat(names).containsExactly(
            VbaName(listOf("frmMain"), VbaNameKind.FORM),
            VbaName(listOf("rptInvoice"), VbaNameKind.REPORT)
        )
    }

    @Test
    fun `should read the forms and reports the AllForms and AllReports of a project name`() {
        // Arrange
        val body = """
            If CurrentProject.AllForms("frmCustomerList").IsLoaded Then Exit Sub
            loaded = Application.CurrentProject.AllReports("rptInvoice").IsLoaded
            loaded = AllForms("frmMain").IsLoaded
        """

        // Act
        val names = namesOfRoutine(body)

        // Assert
        assertThat(names).containsExactly(
            VbaName(listOf("frmCustomerList"), VbaNameKind.FORM),
            code("loaded"),
            VbaName(listOf("rptInvoice"), VbaNameKind.REPORT),
            code("AllForms")
        )
    }

    @Test
    fun `should read the queries and tables code opens or reads by a literal name, spaces too, but no SQL text`() {
        // Arrange
        val body = """
            DoCmd.OpenQuery "qryArchive", acViewNormal
            DoCmd.OpenQuery QueryName:="qryCleanup"
            Set records = CurrentDb.OpenRecordset("qryOrders", dbOpenSnapshot)
            text = CurrentDb.QueryDefs("qryOrderTotal").SQL
            Set records = CurrentDb.OpenRecordset("SELECT * FROM Orders")
            Set records = CurrentDb.OpenRecordset("Order Details")
        """

        // Act
        val relations = namesOfRoutine(body).filter { it.kind == VbaNameKind.RELATION }

        // Assert
        assertThat(relations).containsExactly(
            VbaName(listOf("qryArchive"), VbaNameKind.RELATION),
            VbaName(listOf("qryCleanup"), VbaNameKind.RELATION),
            VbaName(listOf("qryOrders"), VbaNameKind.RELATION),
            VbaName(listOf("qryOrderTotal"), VbaNameKind.RELATION),
            VbaName(listOf("Order Details"), VbaNameKind.RELATION)
        )
    }

    @Test
    fun `should read the query or table a domain function reads`() {
        // Arrange
        val body = """
            name = DLookup("FullName", "qryEmployees", "EmployeeID = 1")
            count = DCount("*", Domain:="Orders")
            total = Nz(DSum("Quantity", "qryStock"), 0)
            name = DLookup("FullName", strDomain)
        """

        // Act
        val relations = namesOfRoutine(body).filter { it.kind == VbaNameKind.RELATION }

        // Assert
        assertThat(relations.map { it.segments.single() }).containsExactly("qryEmployees", "Orders", "qryStock")
    }

    @Test
    fun `should read the object a DoCmd method names by its type and a literal`() {
        // Arrange
        val body = """
            DoCmd.Close acForm, "frmGenericDialog", acSaveNo
            DoCmd.Close ObjectType:=acReport, ObjectName:="rptInvoice"
            DoCmd.OutputTo acOutputQuery, "qryProductList_Export", acFormatXLSX
            DoCmd.SelectObject acTable, "Orders"
            DoCmd.Close acForm, Me.Name
            DoCmd.Close
        """

        // Act
        val accessObjects = namesOfRoutine(body).filter { it.kind != VbaNameKind.CODE }

        // Assert
        assertThat(accessObjects).containsExactly(
            VbaName(listOf("frmGenericDialog"), VbaNameKind.FORM),
            VbaName(listOf("rptInvoice"), VbaNameKind.REPORT),
            VbaName(listOf("qryProductList_Export"), VbaNameKind.RELATION),
            VbaName(listOf("Orders"), VbaNameKind.RELATION)
        )
    }

    @Test
    fun `should read the query or table a row or record source is set to, but no SQL text`() {
        // Arrange
        val body = """
            Me.ProductID.RowSource = "qrycboProducts"
            RecordSource = "qryOrders"
            With Me.cboVendor
                .RowSource = "qrycboVendors"
            End With
            Me.RecordSource = "SELECT * FROM qryOrder WHERE OrderID = 1"
            Me.Caption = "qryNotASource"
        """

        // Act
        val relations = namesOfRoutine(body).filter { it.kind == VbaNameKind.RELATION }

        // Assert
        assertThat(relations.map { it.segments.single() }).containsExactly("qrycboProducts", "qryOrders", "qrycboVendors")
    }

    @Test
    fun `should give the names outside every declaration to the module`() {
        // Arrange
        val code = """
            VERSION 1.0 CLASS
            BEGIN
              MultiUse = -1  'True
            END
            Attribute VB_Name = "clsSquare"
            Implements IShape
            Public Event Resized(ByVal source As clsShape)
        """.trimIndent()

        // Act
        val module = TreeSitterDependencies.vbaModule(code, Language.VBA)

        // Assert
        assertThat(module.names).containsExactly(code("IShape"), code("clsShape"))
        assertThat(module.declarations).isEmpty()
    }

    @Test
    fun `should read a VB6 form with the VB6 grammar`() {
        // Arrange
        val code = "VERSION 5.00\nBegin VB.Form frmMain\nEnd\nAttribute VB_Name = \"frmMain\"\n" +
            "Private Sub cmdOk_Click()\n    frmOther.Show\n    Unload Me\nEnd Sub\n"

        // Act
        val module = TreeSitterDependencies.vbaModule(code, Language.VB6)

        // Assert
        assertThat(module.declarations.single().names).containsExactly(code("frmOther", "Show"))
    }

    @Test
    fun `should reject a language other than VBA and VB6`() {
        // Arrange & Act & Assert
        assertThatThrownBy { TreeSitterDependencies.vbaModule("x", Language.JAVA) }.isInstanceOf(IllegalArgumentException::class.java)
    }
}
