package de.maibornwolff.codecharta.importer.sonar;

import de.maibornwolff.codecharta.importer.sonar.model.Component;
import de.maibornwolff.codecharta.importer.sonar.model.Qualifier;
import org.junit.Test;

import java.net.URL;
import java.util.Collections;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.*;

public class SonarCodeURLLinkerTest {
    @Test
    public void should_createUrlString() throws Exception {
        // given
        URL baseUrl = new URL("https://sonarcloud.io");
        Component component = new Component("","com.adobe%3Aas3corelib%3Asrc%2Fcom%2Fadobe%2Fair%2Fcrypto%2FEncryptionKeyGenerator.as", "","", Qualifier.FIL, Collections.emptyList());

        // when
        String urlString = new SonarCodeURLLinker(baseUrl).createUrlString(component);

        // then
        assertThat(urlString, is("https://sonarcloud.io/code?id=com.adobe%3Aas3corelib%3Asrc%2Fcom%2Fadobe%2Fair%2Fcrypto%2FEncryptionKeyGenerator.as"));
    }

}