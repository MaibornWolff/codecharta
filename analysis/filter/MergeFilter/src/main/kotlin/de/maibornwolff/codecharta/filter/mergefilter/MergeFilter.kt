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

package de.maibornwolff.codecharta.filter.mergefilter

import de.maibornwolff.codecharta.serialization.ProjectDeserializer
import de.maibornwolff.codecharta.serialization.ProjectSerializer
import picocli.CommandLine
import java.io.File
import java.io.FileInputStream
import java.io.InputStreamReader
import java.util.concurrent.Callable

@CommandLine.Command(name = "merge",
        description = ["merges multiple cc.json files"],
        footer = ["Copyright(c) 2018, MaibornWolff GmbH"])
class MergeFilter : Callable<Void?> {
    @CommandLine.Option(names = ["-h", "--help"], usageHelp = true, description = ["displays this help and exits"])
    var help: Boolean = false

    @CommandLine.Parameters(arity = "1..*", paramLabel = "FILE", description = ["files to merge"])
    var sources: Array<File>? = null

    @CommandLine.Option(names = ["-a", "--add-missing"], description = ["enable adding missing nodes to reference"])
    var addMissingNodes = false

    @CommandLine.Option(names = ["--recursive"], description = ["recursive merging strategy"])
    var recursiveStrategySet = true

    @CommandLine.Option(names = ["--leaf"], description = ["leaf merging strategy"])
    var leafStrategySet = false

    override fun call(): Void? {
        var nodeMergerStrategy =
                when {
                    !leafStrategySet -> LeafNodeMergerStrategy(addMissingNodes)
                    !recursiveStrategySet && leafStrategySet -> RecursiveNodeMergerStrategy()
                    else -> throw IllegalArgumentException("Only one merging strategy must be set")
                }

        val inputStream = sources!!.map { FileInputStream(it.absoluteFile) }
        val projects = inputStream.map { p -> ProjectDeserializer.deserializeProject(InputStreamReader(p)) }

        val project = ProjectMerger(projects, nodeMergerStrategy).merge()

        System.out.writer().use { ProjectSerializer.serializeProject(project, it) }

        return null
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            CommandLine.call(MergeFilter(), System.out, *args)
        }
    }
}
