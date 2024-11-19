package de.maibornwolff.codecharta.tools.inspector

import de.maibornwolff.codecharta.tools.inspector.InspectorTool.Companion.mainWithInOut
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.InputStream
import java.io.PrintStream

fun executeForOutput(input: String, args: Array<String> = emptyArray()) = outputAsString(input) { inputStream, outputStream ->
    mainWithInOut(inputStream, outputStream, args)
}

fun outputAsString(input: String, aMethod: (input: InputStream, output: PrintStream) -> Unit) = outputAsString(
    ByteArrayInputStream(input.toByteArray()),
    aMethod
)

fun outputAsString(
    inputStream: InputStream = System.`in`,
    aMethod: (
        input: InputStream,
        output: PrintStream
    ) -> Unit
) = ByteArrayOutputStream().use { baOutputStream ->
    PrintStream(baOutputStream).use { outputStream ->
        aMethod(inputStream, outputStream)
    }
    baOutputStream.toString()
}
