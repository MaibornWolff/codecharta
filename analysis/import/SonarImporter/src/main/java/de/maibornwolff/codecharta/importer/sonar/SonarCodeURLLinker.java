package de.maibornwolff.codecharta.importer.sonar;

import de.maibornwolff.codecharta.importer.sonar.model.Component;

import java.net.URL;

public class SonarCodeURLLinker {

    private final String baseCodeUrl;

    public static final SonarCodeURLLinker NULL = new SonarCodeURLLinker() {
        public String createUrlString(Component c) {
            return "";
        }
    };

    private SonarCodeURLLinker() {
        baseCodeUrl = "";
    }

    public SonarCodeURLLinker(URL baseUrlFrom) {
        baseCodeUrl = baseUrlFrom + "/code?id=";
    }

    public String createUrlString(Component component) {
        return baseCodeUrl + component.getKey();
    }
}
