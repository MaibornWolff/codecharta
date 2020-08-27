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
import org.spekframework.spek2.Spek
import org.spekframework.spek2.style.specification.describe

class JasomeProjectBuilderTest : Spek({
    describe("JasomeProjectBuilder adding an empty Jasome Project") {
        val projectBuilder = JasomeProjectBuilder()
        val jasomeProject = Project(listOf())
        val project = projectBuilder
            .add(jasomeProject)
            .build()

        it("has nodes") {
            MatcherAssert.assertThat(project.size, `is`(1))
        }
    }

    describe("JasomeProjectBuilder adding a Jasome Project with a Class") {
        val projectBuilder = JasomeProjectBuilder()
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

        it("contains class exported to cc.json as file") {
            val node = leaves.values.first()
            MatcherAssert.assertThat(node.type, `is`(NodeType.File))
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
        val projectBuilder = JasomeProjectBuilder()
        val jasomeProject = JasomeDeserializer().deserializeJasomeXML(
            this.javaClass.classLoader.getResourceAsStream("jasome.xml")!!
        )
        val project = projectBuilder
            .add(jasomeProject)
            .build()

        it("has nodes for classes") {
            MatcherAssert.assertThat(project.size, `is`(45))
        }
    }
})
