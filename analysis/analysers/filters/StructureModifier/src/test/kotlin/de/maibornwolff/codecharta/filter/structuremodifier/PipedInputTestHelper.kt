package de.maibornwolff.codecharta.analysers.filters.structuremodifier

import de.maibornwolff.codecharta.analysers.filters.structuremodifier.StructureModifier.Companion.mainWithInOut
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.InputStream
import java.io.PrintStream

fun executeForOutput(input: String, args: Array<String> = emptyArray()) = outputAsString(input) { inputStream, outputStream, _ ->
    mainWithInOut(inputStream, outputStream, args)
}

fun outputAsString(input: String, aMethod: (input: InputStream, output: PrintStream, error: PrintStream) -> Unit) = outputAsString(
    ByteArrayInputStream(input.toByteArray()),
    aMethod
)

fun outputAsString(
    inputStream: InputStream = System.`in`,
    aMethod: (
        input: InputStream,
        output: PrintStream,
        error: PrintStream
    ) -> Unit
) = ByteArrayOutputStream().use { baOutputStream ->
    PrintStream(baOutputStream).use { outputStream ->
        aMethod(inputStream, outputStream, System.err)
    }
    baOutputStream.toString()
}
