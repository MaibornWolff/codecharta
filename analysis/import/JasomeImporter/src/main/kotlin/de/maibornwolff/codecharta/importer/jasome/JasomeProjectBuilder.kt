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
import de.maibornwolff.codecharta.importer.jasome.model.Package
import de.maibornwolff.codecharta.model.*
import java.math.BigDecimal

class JasomeProjectBuilder(projectName: String = "") {

    private val projectBuilder = ProjectBuilder(projectName)

    fun add(jasomeProject: de.maibornwolff.codecharta.importer.jasome.model.Project): JasomeProjectBuilder {
        jasomeProject.packages.orEmpty().forEach { this.add(it) }
        return this
    }

    fun add(jasomePackage: Package): JasomeProjectBuilder {
        if (!jasomePackage.name.isNullOrBlank()) {
            val nodeForPackage = createNode(jasomePackage)
            val parentPath = createPathByPackageName(jasomePackage.name!!).parent
            projectBuilder.insertByPath(parentPath, nodeForPackage)
        }

        jasomePackage.classes.orEmpty()
                .forEach { this.add(jasomePackage.name ?: "", it) }
        return this
    }

    fun add(packageName: String, jasomeClass: Class): JasomeProjectBuilder {
        val nodeForClass = createNode(jasomeClass)
        val parentPath = createPathByPackageName(packageName)
        projectBuilder.insertByPath(parentPath, nodeForClass)
        return this
    }

    private fun createPathByPackageName(packageName: String): Path {
        return PathFactory.fromFileSystemPath(packageName, '.')
    }

    private fun createNode(jasomePackage: Package): MutableNode {
        val attributes =
                jasomePackage.metrics
                        ?.filter { !it.name.isNullOrBlank() && !it.value.isNullOrBlank() }
                        ?.associateBy({ it.name!! }, { convertMetricValue(it.value) }) ?: mapOf()
        return MutableNode(jasomePackage.name!!.substringAfterLast('.'), NodeType.Package, attributes)
    }

    private fun createNode(jasomeClass: Class): MutableNode {
        val attributes =
                jasomeClass.metrics
                        ?.filter { !it.name.isNullOrBlank() && !it.value.isNullOrBlank() }
                        ?.associateBy({ it.name!! }, { convertMetricValue(it.value) }) ?: mapOf()
        return MutableNode(jasomeClass.name ?: "", NodeType.Class, attributes)
    }

    private fun convertMetricValue(value: String?): BigDecimal {
        return value?.replace(',', '.', false)?.toBigDecimal() ?: BigDecimal.ZERO
    }


    fun build(): Project {
        return projectBuilder.build()
    }

}
