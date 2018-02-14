/*
 * Copyright (c) 2017, MaibornWolff GmbH
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

package de.maibornwolff.codecharta.importer.sonar


import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMeasuresAPIDatasource
import de.maibornwolff.codecharta.importer.sonar.dataaccess.SonarMetricsAPIDatasource
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import picocli.CommandLine
import java.io.BufferedWriter
import java.io.FileWriter
import java.io.OutputStreamWriter
import java.io.Writer
import java.lang.System.out
import java.net.URL
import java.util.concurrent.Callable

@CommandLine.Command(
        name = "sonarimport",
        description = ["generates cc.json from metric data from SonarQube"],
        footer = ["Copyright(c) 2018, MaibornWolff GmbH"]
)
class SonarImporterMain : Callable<Void> {

    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    private var help = false

    @CommandLine.Parameters(index = "0", paramLabel = "URL", description = ["url of sonarqube server"])
    private var baseUrl: URL = URL("http://localhost")

    @CommandLine.Parameters(index = "1", arity = "1..1", paramLabel = "PROJECT_ID", description = ["sonarqube project id"])
    private var projectId = ""

    @CommandLine.Option(names = ["-o", "--outputFile"], description = ["output File (or empty for stdout)"])
    private var outputFile = ""

    @CommandLine.Option(names = ["-m", "--metrics"], description = ["comma-separated list of metrics to import"])
    private var metrics = mutableListOf<String>()

    @CommandLine.Option(names = ["-u", "--user"], description = ["user token for connecting to remote sonar instance"])
    private var user = ""

    @CommandLine.Option(names = ["--merge-modules"], description = ["merges modules in multi-module projects"])
    private var usePath = false

    private fun writer(): Writer {
        return if (outputFile.isEmpty()) {
            OutputStreamWriter(out)
        } else {
            BufferedWriter(FileWriter(outputFile))
        }
    }

    private fun createMesauresAPIImporter(): SonarMeasuresAPIImporter {
        val ds = SonarMeasuresAPIDatasource(user, baseUrl)
        val metricsDS = SonarMetricsAPIDatasource(user, baseUrl)
        val sonarCodeURLLinker = SonarCodeURLLinker(baseUrl)
        val translator = SonarMetricTranslatorFactory.createMetricTranslator()

        return SonarMeasuresAPIImporter(ds, metricsDS, sonarCodeURLLinker, translator, usePath)
    }

    override fun call(): Void? {
        val importer = createMesauresAPIImporter()
        val project = importer.getProjectFromMeasureAPI(projectId, projectId, metrics)

        ProjectSerializer.serializeProject(project, writer())

        return null
    }

    companion object {

        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(SonarImporterMain(), System.out, *args)
        }
    }
}
