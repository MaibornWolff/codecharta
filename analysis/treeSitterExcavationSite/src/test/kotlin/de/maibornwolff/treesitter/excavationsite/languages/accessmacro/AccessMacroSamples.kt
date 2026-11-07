package de.maibornwolff.treesitter.excavationsite.languages.accessmacro

/** Access macros as `SaveAsText` writes them. */
internal object AccessMacroSamples {
    private const val CHUNK_LENGTH = 80

    // The AutoExec macro of the Northwind 2.0 template, as Access 2016 exports it
    val autoExec = """
        Version =196611
        PublishOption =1
        ColumnsShown =0
        Begin
            Condition ="Not [CurrentProject].[IsTrusted]"
            Action ="OpenForm"
            Argument ="frmStartup"
            Argument ="0"
            Argument =""
            Argument =""
            Argument ="-1"
            Argument ="0"
        End
        Begin
            Condition ="[CurrentProject].[IsTrusted]"
            Action ="RunCode"
            Argument ="Startup()"
        End
        Begin
            Comment ="_AXL:<?xml version=\"1.0\" encoding=\"UTF-16\" standalone=\"no\"?>\015\012<UserI"
                "nterfaceMacro MinimumClientDesignVersion=\"14.0.0000.0000\" xmlns=\"http://schem"
                "as.microsoft.com/office/accessservices/2009/11/application\"><Statements><Condit"
                "ionalBlock><If><Condition>Not"
        End
        Begin
            Comment ="_AXL: [CurrentProject].[IsTrusted]</Condition><Statements><Action Name=\"OpenFor"
                "m\"><Argument Name=\"FormName\">frmStartup</Argument></Action></Statements></If>"
                "</ConditionalBlock><ConditionalBlock><If><Condition>[CurrentProject].[IsTrusted]"
                "</Condition><Stat"
        End
        Begin
            Comment ="_AXL:ements><Action Name=\"RunCode\"><Argument Name=\"FunctionName\">Startup()</"
                "Argument></Action></Statements></If></ConditionalBlock></Statements></UserInterf"
                "aceMacro>"
        End
    """.trimIndent()

    /** A macro whose action rows Access left out, its [xml] split into `_AXL:` comment rows. */
    fun saveAsText(xml: String): String {
        val rows = xml.replace("\n", "").chunked(CHUNK_LENGTH).joinToString("\n") { chunk ->
            "Begin\n    Comment =\"_AXL:${chunk.replace("\\", "\\\\").replace("\"", "\\\"")}\"\nEnd"
        }
        return "Version =196611\nColumnsShown =0\n$rows\n"
    }
}
