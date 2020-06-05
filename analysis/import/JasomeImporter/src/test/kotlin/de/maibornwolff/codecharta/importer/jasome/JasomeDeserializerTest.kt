package de.maibornwolff.codecharta.importer.jasome

import org.hamcrest.MatcherAssert
import org.hamcrest.Matchers.hasSize
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe

class JasomeDeserializerTest: Spek({
    describe("JasomeDeserializer adding big Jasome project") {
        val jasomeDeserializer = JasomeDeserializer()

        context("deserializing a project ") {
            val jasomeProject = jasomeDeserializer.deserializeJasomeXML(
                    this.javaClass.classLoader.getResourceAsStream("jasome.xml")!!
            )

            it("should have packages") {
                MatcherAssert.assertThat(jasomeProject.packages!!, hasSize(7))
            }

            it("should have metrics in packages") {
                MatcherAssert.assertThat(jasomeProject.packages!!.flatMap {
                    it.metrics ?: listOf()
                }, hasSize(77))
            }

            it("should have classes") {
                MatcherAssert.assertThat(jasomeProject.packages!!.flatMap { it.classes ?: listOf() }, hasSize(45))
            }

            it("should have metrics in classes") {
                MatcherAssert.assertThat(jasomeProject.packages!!.flatMap {
                    it.classes?.flatMap {
                        it.metrics ?: listOf()
                    } ?: listOf()
                }, hasSize(1801))
            }
        }
    }
})
