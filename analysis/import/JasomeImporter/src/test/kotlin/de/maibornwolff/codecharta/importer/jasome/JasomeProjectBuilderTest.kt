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

package de.maibornwolff.codecharta.importer.jasome

import de.maibornwolff.codecharta.importer.jasome.model.Class
import de.maibornwolff.codecharta.importer.jasome.model.Metric
import de.maibornwolff.codecharta.importer.jasome.model.Package
import de.maibornwolff.codecharta.importer.jasome.model.Project
import de.maibornwolff.codecharta.model.NodeType
import de.maibornwolff.codecharta.model.Path
import org.hamcrest.CoreMatchers.`is`
import org.hamcrest.CoreMatchers.hasItem
import org.hamcrest.MatcherAssert
import org.jetbrains.spek.api.Spek
import org.jetbrains.spek.api.dsl.describe
import org.jetbrains.spek.api.dsl.it

class JasomeProjectBuilderTest : Spek({
    describe("JasomeProjectBuilder adding an empty Jasome Project") {
        val projectBuilder = JasomeProjectBuilder("test")
        val jasomeProject = de.maibornwolff.codecharta.importer.jasome.model.Project(listOf())
        val project = projectBuilder
                .add(jasomeProject)
                .build()

        it("has nodes") {
            MatcherAssert.assertThat(project.size, `is`(1))
        }
    }

    describe("JasomeProjectBuilder adding a Jasome Project with a Class") {
        val projectBuilder = JasomeProjectBuilder("test")
        val jasomeClass = Class(
                name = "ClassName",
                metrics = listOf(Metric("ClTCi", "6,333333333"))
        )
        val jasomePackage = Package(
                name = "com.package.name",
                classes = listOf(jasomeClass),
                metrics = listOf(Metric("PkgRCi", "2,388888889"))
        )
        val jasomeProject = Project(packages = listOf(jasomePackage))


        val project = projectBuilder
                .add(jasomeProject)
                .build()

        val leaves = project.rootNode.leaves

        it("has node in correct path") {
            MatcherAssert.assertThat(leaves.keys, hasItem(Path(listOf("com", "package", "name", "ClassName"))))
        }

        it("contains class") {
            val node = leaves.values.first()
            MatcherAssert.assertThat(node.type, `is`(NodeType.Class))
            MatcherAssert.assertThat(node.name, `is`("ClassName"))
        }

        it("has attributes in package nodes") {
            val attributes = project.rootNode.nodes.flatMap { it.value.attributes.keys }
            MatcherAssert.assertThat(attributes, hasItem("PkgRCi"))
        }

        it("has attributes in class nodes") {
            val attributes = project.rootNode.leafObjects.flatMap { it.attributes.keys }
            MatcherAssert.assertThat(attributes, hasItem("ClTCi"))
        }
    }

    describe("JasomeProjectBuilder adding an big Jasome Project") {
        val projectBuilder = JasomeProjectBuilder("test")
        val jasomeProject = JasomeDeserializer().deserializeJasomeXML(
                this.javaClass.classLoader.getResourceAsStream("jasome.xml")
        )
        val project = projectBuilder
                .add(jasomeProject)
                .build()

        it("has nodes for classes") {
            MatcherAssert.assertThat(project.size, `is`(45))
        }
    }
})
