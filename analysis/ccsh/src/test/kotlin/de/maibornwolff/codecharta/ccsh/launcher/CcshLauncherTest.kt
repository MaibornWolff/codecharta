package de.maibornwolff.codecharta.ccsh.launcher

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test

class CcshLauncherTest {
    @Test
    fun `should read the minimum Java version the build declares`() {
        // Arrange
        val declaredMinimumJavaVersion = System.getProperty("minimumJavaVersion").toInt()

        // Act
        val minimumJavaVersion = CcshLauncher.readMinimumJavaVersion()

        // Assert
        assertThat(minimumJavaVersion).isEqualTo(declaredMinimumJavaVersion)
    }

    @Test
    fun `should name the needed Java version and the running one with its location`() {
        // Arrange
        val runningJavaHome = "/usr/lib/jvm/java-17-openjdk"

        // Act
        val message = CcshLauncher.unsupportedJavaMessage(22, 17, runningJavaHome)

        // Assert
        assertThat(message)
            .contains("ccsh needs Java 22 or newer")
            .contains("Java 17 from $runningJavaHome")
            .contains("JAVA_HOME")
    }
}
