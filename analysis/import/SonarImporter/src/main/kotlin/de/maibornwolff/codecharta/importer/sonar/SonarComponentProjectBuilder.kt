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

import de.maibornwolff.codecharta.importer.sonar.model.Component
import de.maibornwolff.codecharta.importer.sonar.model.ComponentMap
import de.maibornwolff.codecharta.importer.sonar.model.Measure
import de.maibornwolff.codecharta.importer.sonar.model.Qualifier
import de.maibornwolff.codecharta.model.*
import de.maibornwolff.codecharta.translator.MetricNameTranslator

class SonarComponentProjectBuilder(
        name: String,
        private val sonarCodeURLLinker: SonarCodeURLLinker = SonarCodeURLLinker.NULL,
        private val translator: MetricNameTranslator = MetricNameTranslator.TRIVIAL,
        private val usePath: Boolean = false
) {

    private var totalComponents = 0
    private var processedComponents = -1
    private val projectBuilder = ProjectBuilder(name)
    val size: Int
        get() = projectBuilder.size

    fun build(): Project {
        return projectBuilder.build()
    }

    fun addComponentMapsAsNodes(components: ComponentMap): SonarComponentProjectBuilder {
        setTotalComponents(components)
        components.componentList
                .sortedBy { it.path }
                .forEach {
                    this.addComponentAsNode(it)
                    logProgress()
                }
        return this
    }

    fun addComponentAsNode(component: Component): SonarComponentProjectBuilder {
        val node = MutableNode(
                createNodeName(component),
                createNodeTypeFromQualifier(component.qualifier!!), createAttributes(component.measures!!),
                createLink(component))
        projectBuilder.insertByPath(createParentPath(component), node)
        return this
    }

    private fun createAttributes(measures: List<Measure>): Map<String, Any> {
        return measures
                .filter({ this.isMeasureConvertible(it) })
                .map { this.convertMetricName(it) to this.convertMetricValue(it) }
                .toMap()
    }

    private fun convertMetricName(measure: Measure): String {
        return translator.translate(measure.metric)
    }

    private fun createLink(component: Component): String {
        return sonarCodeURLLinker.createUrlString(component)
    }

    private fun convertMetricValue(measure: Measure): Any {
        return java.lang.Double.parseDouble(measure.value!!)
    }

    private fun isMeasureConvertible(measure: Measure): Boolean {
        if (measure.value != null) {
            return try {
                java.lang.Double.parseDouble(measure.value)
                true
            } catch (nfe: NumberFormatException) {
                false
            }
        }

        return false
    }

    private fun createNodeTypeFromQualifier(qualifier: Qualifier): NodeType {
        return when (qualifier) {
            Qualifier.FIL, Qualifier.UTS -> NodeType.File
            else                         -> NodeType.Folder
        }
    }

    /**
     * creates a node name from the component. Tries the create it from the path, the name or id (in this priority order).
     *
     * @param component the given component
     * @return node name for this component
     */
    private fun createNodeName(component: Component): String {
        return if (!usePath && component.key != null) {
            component.key.substring(component.key.lastIndexOf('/') + 1)
        } else if (usePath && component.path != null) {
            component.path.substring(component.path.lastIndexOf('/') + 1)
        } else component.name ?: component.id
    }

    /**
     * creates a parent path for the given node. If a path exists then a correct parent path will be created. If there
     * is no parent path this function assumes it at FS root for the sake of initialized values.
     *
     * @param component given component
     * @return fs path of components parent
     */
    private fun createParentPath(component: Component): Path {
        return if (!usePath && component.key != null) {
            val extendedPath = component.key.replace(':', '/')
            PathFactory.fromFileSystemPath(extendedPath.substring(0, extendedPath.lastIndexOf('/') + 1))
        } else if (usePath && component.path != null) {
            val path = component.path
            PathFactory.fromFileSystemPath(path.substring(0, path.lastIndexOf('/') + 1))
        } else {
            Path.trivialPath()
        }
    }

    private fun setTotalComponents(components: ComponentMap) {
        totalComponents = components.componentList.size
        logProgress()
    }

    private fun logProgress() {
        processedComponents++
        System.err.print("\r$processedComponents of $totalComponents components processed...")
    }
}
