/*
 * Copyright (c) 2018, MaibornWolff GmbH
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of  nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

package de.maibornwolff.codecharta.exporter.csv

import com.univocity.parsers.csv.CsvWriter
import com.univocity.parsers.csv.CsvWriterSettings
import de.maibornwolff.codecharta.model.Node
import de.maibornwolff.codecharta.model.Path
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import picocli.CommandLine
import java.io.*
import java.util.concurrent.Callable


@CommandLine.Command(
        name = "csvexport",
        description = ["generates csv file with header"],
        footer = ["Copyright(c) 2018, MaibornWolff GmbH"]
)
class CSVExporter : Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["json files"])
    private var sources: Array<File> = arrayOf()

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile = ""

    private fun writer(): Writer {
        return if (outputFile.isEmpty()) {
            OutputStreamWriter(System.out)
        } else {
            BufferedWriter(FileWriter(outputFile))
        }
    }

    @Throws(IOException::class)
    override fun call(): Void? {
        val projects = sources.map { ProjectDeserializer.deserializeProject(it.reader()) }

        // write to writer
        projects.forEach { writeUsingWriter(it, writer()) }

        return null
    }

    private fun writeUsingWriter(project: Project, outputWriter: Writer) {
        val settings = CsvWriterSettings()
        val writer = CsvWriter(outputWriter, settings)

        val attributeNames: List<String> = project.rootNode.nodes.flatMap { it.value.attributes.keys }.distinct()

        writer.writeHeaders(listOf("path").plus(attributeNames))

        project.rootNode.nodes.forEach({ path: Path, node: Node -> writer.writeRow(row(path, node, attributeNames)) })

        writer.close()
    }

    private fun row(path: Path, node: Node, attributeNames: List<String>): List<String> {
        val values: List<String> = node.toAttributeList(attributeNames)
        
        return if (values.distinct().none { !it.isBlank() }) listOf()
        else listOf(path.toPath).plus(values)
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(CSVExporter(), System.out, *args)
        }
    }
}

private fun Node.toAttributeList(attributeNames: List<String>): List<String> {
    return attributeNames.map { this.attributes[it]?.toString() ?: "" }
}

private val Path.toPath: String
    get() {
        return this.edgesList.joinToString("/")
    }

