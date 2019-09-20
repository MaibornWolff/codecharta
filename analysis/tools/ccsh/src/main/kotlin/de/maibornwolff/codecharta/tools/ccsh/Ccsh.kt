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

package de.maibornwolff.codecharta.tools.ccsh

import de.maibornwolff.codecharta.exporter.csv.CSVExporter
import de.maibornwolff.codecharta.filter.edgefilter.EdgeFilter
import de.maibornwolff.codecharta.filter.mergefilter.MergeFilter
import de.maibornwolff.codecharta.filter.structuremodifier.StructureModifier
import de.maibornwolff.codecharta.importer.codemaat.CodeMaatImporter
import de.maibornwolff.codecharta.importer.crococosmo.CrococosmoImporter
import de.maibornwolff.codecharta.importer.csv.CSVImporter
import de.maibornwolff.codecharta.importer.csv.SourceMonitorImporter
import de.maibornwolff.codecharta.importer.jasome.JasomeImporter
import de.maibornwolff.codecharta.importer.scmlogparser.SCMLogParser
import de.maibornwolff.codecharta.importer.sonar.SonarImporterMain
import de.maibornwolff.codecharta.importer.sourcecodeparser.SourceCodeParserMain
import de.maibornwolff.codecharta.importer.tokeiimporter.TokeiImporter
import de.maibornwolff.codecharta.importer.understand.UnderstandImporter
import de.maibornwolff.codecharta.tools.validation.ValidationTool
import picocli.CommandLine
import java.util.concurrent.Callable

@CommandLine.Command(
        name = "ccsh",
        description = ["Command Line Interface for CodeCharta analysis"],
        subcommands = [
            ValidationTool::class,
            MergeFilter::class,
            EdgeFilter::class,
            StructureModifier::class,
            CSVImporter::class,
            SonarImporterMain::class,
            SourceMonitorImporter::class,
            SCMLogParser::class,
            Installer::class,
            CSVExporter::class,
            CrococosmoImporter::class,
            SourceCodeParserMain::class,
            UnderstandImporter::class,
            CodeMaatImporter::class,
            JasomeImporter::class,
            TokeiImporter::class
        ],
        versionProvider = Ccsh.ManifestVersionProvider::class,
        footer = ["Copyright(c) 2018, MaibornWolff GmbH"]
)
class Ccsh: Callable<Void?> {

    @CommandLine.Option(names = ["-v", "--version"], versionHelp = true,
            description = ["prints version info and exits"])
    var versionRequested: Boolean = false

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exit"])
    var help: Boolean = false

    override fun call(): Void? {
        // info: always run

        return null
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            val commandLine = CommandLine(Ccsh())
            commandLine.parseWithHandler(CommandLine.RunAll(), System.out, *args)
        }
    }

    object ManifestVersionProvider: CommandLine.IVersionProvider {
        override fun getVersion(): Array<String> {
            return arrayOf(
                    Ccsh::class.java.`package`.implementationTitle + "\n"
                    + "version \"" + Ccsh::class.java.`package`.implementationVersion + "\"\n"
                    + "Copyright(c) 2018, MaibornWolff GmbH"
            )
        }
    }
}

@CommandLine.Command(name = "install", description = ["[deprecated]: does nothing"])
class Installer: Callable<Void?> {

    override fun call(): Void? {
        println("[deprecated]: does nothing")
        return null
    }
}
