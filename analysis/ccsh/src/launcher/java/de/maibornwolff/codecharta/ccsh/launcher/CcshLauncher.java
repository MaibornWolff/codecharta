package de.maibornwolff.codecharta.ccsh.launcher;

import java.io.IOException;
import java.io.InputStream;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.MethodType;
import java.util.Properties;

// Compiled for an older Java than ccsh itself, so that a JVM too old for ccsh can still load it and name the Java ccsh needs.
public final class CcshLauncher {
    private static final String CCSH_MAIN_CLASS = "de.maibornwolff.codecharta.ccsh.Ccsh";
    private static final String LAUNCHER_PROPERTIES = "launcher.properties";
    private static final String MINIMUM_JAVA_VERSION_KEY = "minimumJavaVersion";
    private static final int UNSUPPORTED_JAVA_EXIT_CODE = 1;

    private CcshLauncher() {
    }

    public static void main(String[] args) throws Throwable {
        int minimumJavaVersion = readMinimumJavaVersion();
        int runningJavaVersion = Runtime.version().feature();
        if (runningJavaVersion < minimumJavaVersion) {
            System.err.println(unsupportedJavaMessage(minimumJavaVersion, runningJavaVersion, System.getProperty("java.home")));
            System.exit(UNSUPPORTED_JAVA_EXIT_CODE);
        }
        startCcsh(args);
    }

    static int readMinimumJavaVersion() throws IOException {
        Properties launcherProperties = new Properties();
        try (InputStream propertiesStream = CcshLauncher.class.getResourceAsStream(LAUNCHER_PROPERTIES)) {
            launcherProperties.load(propertiesStream);
        }
        return Integer.parseInt(launcherProperties.getProperty(MINIMUM_JAVA_VERSION_KEY));
    }

    static String unsupportedJavaMessage(int minimumJavaVersion, int runningJavaVersion, String runningJavaHome) {
        return "ccsh needs Java " + minimumJavaVersion + " or newer, but was started with Java " + runningJavaVersion +
            " from " + runningJavaHome + ".\n" +
            "Install Java " + minimumJavaVersion + " or newer and point JAVA_HOME to it, or put its bin folder first on the PATH.";
    }

    private static void startCcsh(String[] args) throws Throwable {
        MethodHandles.publicLookup()
            .findStatic(Class.forName(CCSH_MAIN_CLASS), "main", MethodType.methodType(void.class, String[].class))
            .invokeExact(args);
    }
}
