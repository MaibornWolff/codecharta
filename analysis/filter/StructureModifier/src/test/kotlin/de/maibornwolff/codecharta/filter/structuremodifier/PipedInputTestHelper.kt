package de.maibornwolff.codecharta.filter.structuremodifier

import de.maibornwolff.codecharta.filter.structuremodifier.StructureModifier.Companion.mainWithInOut
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.InputStream
import java.io.PrintStream

fun executeForOutput(input: String, args: Array<String> = emptyArray()) =
        outputAsString(input) { inputStream, outputStream, errorStream ->
            mainWithInOut(inputStream, outputStream, errorStream, args)
        }

fun executeForOutput(args: Array<String> = emptyArray()) =
        outputAsString { inputStream, outputStream, errorStream ->
            mainWithInOut(inputStream, outputStream, errorStream, args)
        }

fun outputAsString(input: String, aMethod: (input: InputStream, output: PrintStream, error: PrintStream) -> Unit) =
        outputAsString(ByteArrayInputStream(input.toByteArray()), aMethod)

fun outputAsString(
        inputStream: InputStream = System.`in`,
        aMethod: (input: InputStream, output: PrintStream, error: PrintStream) -> Unit) =
        ByteArrayOutputStream().use { baOutputStream ->
            PrintStream(baOutputStream).use { outputStream ->
                aMethod(inputStream, outputStream, System.err)
            }
            baOutputStream.toString()
        }

fun errorAsString(input: String, aMethod: (input: InputStream, output: PrintStream, error: PrintStream) -> Unit) =
        errorAsString(ByteArrayInputStream(input.toByteArray()), aMethod)

fun errorAsString(
        inputStream: InputStream = System.`in`,
        aMethod: (input: InputStream, output: PrintStream, error: PrintStream) -> Unit) =
        ByteArrayOutputStream().use { baOutputStream ->
            PrintStream(baOutputStream).use { errorStream ->
                aMethod(inputStream, System.out, errorStream)
            }
            baOutputStream.toString()
        }