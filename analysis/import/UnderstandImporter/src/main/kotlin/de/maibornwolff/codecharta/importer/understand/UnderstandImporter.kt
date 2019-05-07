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
package de.maibornwolff.codecharta.importer.understand

import de.maibornwolff.codecharta.serialization.ProjectSerializer
import mu.KotlinLogging
import picocli.CommandLine
import java.io.*
import java.util.concurrent.Callable

@CommandLine.Command(name = "understandimport", description = ["generates cc.json from SciTools (TM) Understand csv"],
        footer = ["Copyright(c) 2018, MaibornWolff GmbH"])
class UnderstandImporter: Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-p", "--projectName"], description = ["project name"])
    private var projectName = "testProject"

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile: File? = null

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["Understand csv files"])
    private var files: List<File> = mutableListOf()

    @CommandLine.Option(names = ["--pathSeparator"], description = ["path separator (default = '/')"])
    private var pathSeparator = '/'

    private val logger = KotlinLogging.logger {}

    @Throws(IOException::class)
    override fun call(): Void? {
        val projectBuilder = UnderstandProjectBuilder(projectName, pathSeparator)
        files.forEach { projectBuilder.parseCSVStream(it.inputStream()) }
        val project = projectBuilder.build()
        ProjectSerializer.serializeProject(project, writer())

        logger.info { "Created project with ${project.size} leafs." }

        return null
    }

    private fun writer(): Writer {
        return if (outputFile == null) {
            OutputStreamWriter(System.out)
        } else {
            BufferedWriter(FileWriter(outputFile))
        }
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(UnderstandImporter(), System.out, *args)
        }
    }
}

