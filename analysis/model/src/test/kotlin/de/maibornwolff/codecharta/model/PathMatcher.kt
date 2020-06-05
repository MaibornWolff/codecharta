package de.maibornwolff.codecharta.model

import org.hamcrest.BaseMatcher
import org.hamcrest.Description
import org.hamcrest.Matcher

object PathMatcher {
    fun matchesPath(expectedPath: Path): Matcher<Path> {
        return object : BaseMatcher<Path>() {
            override fun describeTo(description: Description) {
                description.appendText("should be ").appendValue(expectedPath)
            }

            override fun matches(item: Any): Boolean {
                return item as Path == expectedPath
            }
        }
    }

    fun containsPath(expectedPath: Path): Matcher<List<Path>> {
        return object : BaseMatcher<List<Path>>() {
            override fun describeTo(description: Description) {
                description.appendText("does not contain ").appendValue(expectedPath)
            }

            override fun matches(item: Any): Boolean {
                return (item as List<Path>).contains(expectedPath)
            }
        }
    }
}
