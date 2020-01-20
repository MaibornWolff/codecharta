package de.maibornwolff.codecharta.importer.sonar

import de.maibornwolff.codecharta.importer.sonar.model.Component

import java.net.URL

open class SonarCodeURLLinker {

    private val baseCodeUrl: String

    private constructor() {
        baseCodeUrl = ""
    }

    constructor(baseUrlFrom: URL?) {
        baseCodeUrl = baseUrlFrom.toString() + "/code?id="
    }

    open fun createUrlString(component: Component): String {
        return baseCodeUrl + component.key!!
    }

    companion object {

        val NULL: SonarCodeURLLinker = object: SonarCodeURLLinker() {
            override fun createUrlString(c: Component): String {
                return ""
            }
        }
    }
}
