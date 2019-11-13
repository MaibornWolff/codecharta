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
import de.maibornwolff.codecharta.model.Project
import de.maibornwolff.codecharta.translator.MetricNameTranslator

class SonarMeasuresAPIImporter @JvmOverloads constructor(
        private val measuresDS: SonarMeasuresAPIDatasource?,
        private val metricsDS: SonarMetricsAPIDatasource?,
        private val sonarCodeURLLinker: SonarCodeURLLinker = SonarCodeURLLinker.NULL,
        private val translator: MetricNameTranslator = MetricNameTranslator.TRIVIAL,
        private val usePath: Boolean = false) {

    fun getProjectFromMeasureAPI(projectKey: String, projectName: String, metrics: List<String>): Project {
        val metricsList = getMetricList(metrics)
        System.err.println("Get values for metrics $metricsList.")

        val componentMap = measuresDS!!.getComponentMap(projectKey, metricsList)

        val projectBuilder = SonarComponentProjectBuilder(projectName, sonarCodeURLLinker, translator, usePath)
        return projectBuilder.addComponentMapsAsNodes(componentMap).build()
    }

    fun getMetricList(metrics: List<String>): List<String> {
        return if (metrics.isEmpty()) {
            metricsDS!!.availableMetricKeys
        } else metrics
    }
}
