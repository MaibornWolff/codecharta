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

package de.maibornwolff.codecharta.translator

import java.util.*

/**
 * This class provides methods to translate metric names. This enables normalization of metric names.
 */
open class MetricNameTranslator(
        private val translationMap: Map<String, String>,
        private val prefix: String = "") {

    init {
        validate()
    }

    open fun translate(oldMetricName: String): String {
        return when {
            translationMap.containsKey(oldMetricName) -> translationMap[oldMetricName]!!
            else -> prefix + oldMetricName.toLowerCase().replace(' ', '_')
        }
    }

    open fun translate(oldMetricName: Array<String?>): Array<String?> {
        return oldMetricName
                .map { it?.let { translate(it) } }
                .toTypedArray()
    }

    private fun validate() {
        val seen = ArrayList<String>()

        for (value in translationMap.values) {
            if (!value.isEmpty() && seen.contains(value)) {
                throw IllegalArgumentException("Replacement map should not map distinct keys to equal values, e.g. $value")
            } else {
                seen.add(value)
            }
        }
    }

    companion object {
        val TRIVIAL: MetricNameTranslator = object : MetricNameTranslator(emptyMap()) {
            override fun translate(oldMetricName: String): String {
                return oldMetricName
            }

            override fun translate(oldMetricName: Array<String?>): Array<String?> {
                return oldMetricName
            }
        }
    }
}
