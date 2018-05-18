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

package de.maibornwolff.codecharta.importer.crococosmo

import de.maibornwolff.codecharta.serialization.ProjectSerializer
import picocli.CommandLine
import java.io.File
import java.util.concurrent.Callable

@CommandLine.Command(
        name = "crococosmoimport",
        description = ["generates cc.json from crococosmo xml file"],
        footer = ["Copyright(c) 2018, MaibornWolff GmbH"]
)
class CrococosmoImporter : Callable<Void> {

    @CommandLine.Parameters(arity = "1", paramLabel = "FILE", description = ["file to parse"])
    private var file: File? = null

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Option(names = ["-p", "--projectName"], description = ["project name"])
    private var projectName = "CrococosmoImporter"

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File or prefix for File (or empty for stdout)"])
    private var outputFile: String? = null

    override fun call(): Void? {
        val graph = CrococosmoDeserializer().deserializeCrococosmoXML(file!!.inputStream())
        val projects = CrococosmoConverter().convertToProjectsMap(projectName, graph)
        projects.forEach {
            val suffix = if (projects.isNotEmpty())  "_" + it.key else ""
            ProjectSerializer.serializeProject(it.value, writer(suffix))
        }

        return null
    }


    private fun writer(name: String = "") =
            when {
                outputFile.isNullOrEmpty() -> System.out.bufferedWriter()
                else -> File(outputFile + name).bufferedWriter()
            }

    companion object {

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(CrococosmoImporter(), System.out, *args)
        }
    }
}
