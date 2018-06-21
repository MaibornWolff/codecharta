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

import org.hamcrest.MatcherAssert.assertThat
import org.hamcrest.Matchers.`is`
import org.jetbrains.spek.api.Spek
import org.jetbrains.spek.api.dsl.describe
import org.jetbrains.spek.api.dsl.it
import kotlin.test.assertFailsWith

class MetricNameTranslatorTest : Spek({
    describe("trivial replacer") {
        val replacer = MetricNameTranslator.TRIVIAL
        it("should not replace anything") {
            val original = "testestest"
            assertThat(replacer.translate(original), `is`(original))
        }
    }

    describe("replacer without specified prefix") {
        val original = "oldValue"
        val replacement = "newString"
        val replacer = MetricNameTranslator(mapOf(Pair(original, replacement)))

        it("should replace specified string") {
            assertThat(replacer.translate(original), `is`(replacement))
        }

        it("should not replace other string") {
            val otherString = "testestest"
            assertThat(replacer.translate(otherString), `is`(otherString))
        }
    }

    describe("replacer with prefix") {
        val original = "oldValue"
        val replacement = "newString"
        val replacer = MetricNameTranslator(mapOf(Pair(original, replacement)), "pre_")

        it("should replace specified string") {
            assertThat(replacer.translate(original), `is`(replacement))
        }

        it("should prefix other string with underscores") {
            assertThat(replacer.translate("some String"), `is`("pre_some_string"))
        }
    }

    it("should replaceMany") {
        val original: Array<String?> = arrayOf("this", "that", "other", null)
        val expected: Array<String?> = arrayOf("oooo", "iiii", "other", null)
        val replacer = MetricNameTranslator(mapOf(
                Pair("this", "oooo"),
                Pair("that", "iiii"),
                Pair("bla", "blubb"))
        )

        assertThat(replacer.translate(original), `is`(expected))
    }

    it("should not validate with same values") {
        assertFailsWith(IllegalArgumentException::class) {
            MetricNameTranslator(mapOf(Pair("this", "that"), Pair("these", "that")))
        }
    }

    it("should validate with multiple empty values") {
        val translator = MetricNameTranslator(mapOf(Pair("this", ""), Pair("these", "")))

        assertThat(translator.translate("this"), `is`(""))
        assertThat(translator.translate("these"), `is`(""))
    }
})