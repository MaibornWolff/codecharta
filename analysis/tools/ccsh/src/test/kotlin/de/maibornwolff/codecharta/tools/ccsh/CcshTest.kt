package de.maibornwolff.codecharta.tools.ccsh

import org.junit.platform.runner.JUnitPlatform
import org.junit.platform.suite.api.SelectPackages
import org.junit.runner.RunWith

@RunWith(JUnitPlatform::class)
@SelectPackages("de.maibornwolff.codecharta")
class AllJunit5Tests