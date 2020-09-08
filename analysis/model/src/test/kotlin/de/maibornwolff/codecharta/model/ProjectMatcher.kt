package de.maibornwolff.codecharta.model

import org.hamcrest.BaseMatcher
import org.hamcrest.Description
import org.hamcrest.Matcher

object ProjectMatcher {

    fun matchesProject(expectedProject: Project): Matcher<Project> {
        return object : BaseMatcher<Project>() {

            override fun describeTo(description: Description) {
                description.appendText("should be ").appendValue(expectedProject)
            }

            override fun matches(item: Any): Boolean {
                return match(item as Project, expectedProject)
            }
        }
    }

    fun matchesProjectUpToVersion(expectedProject: Project): Matcher<Project> {
        return object : BaseMatcher<Project>() {

            override fun describeTo(description: Description) {
                description.appendText("should be ").appendValue(expectedProject)
            }

            override fun matches(item: Any): Boolean {
                return matchUpToVersion(item as Project, expectedProject)
            }
        }
    }

    fun matchUpToVersion(p1: Project, p2: Project): Boolean {
        return NodeMatcher.match(p1.rootNode, p2.rootNode)
    }

    fun match(p1: Project, p2: Project): Boolean {
        return p1.apiVersion == p2.apiVersion &&
            matchUpToVersion(p1, p2)
    }
}
