/*
 * Copyright (c) 2017, MaibornWolff GmbH
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *  * Neither the name of  nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

package de.maibornwolff.codecharta.importer.sonar;

import com.google.common.base.Charsets;
import com.google.common.io.CharStreams;
import com.google.gson.JsonParser;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.serialization.ProjectDeserializer;
import org.hamcrest.BaseMatcher;
import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.junit.Test;

import java.io.*;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;

public class SonarXMLImporterTest {
    private static final String EXAMPLE_FILE = "example.xml";
    private static final String EXPECTED_JSON_FILE = "expected.cc.json";

    private SonarXMLImport sonarXMLImport;

    private final JsonParser parser = new JsonParser();

    private Matcher<String> isAsJson(final String json) {
        return new BaseMatcher<String>() {
            @Override
            public void describeTo(Description description) {
                description.appendText("should be ").appendValue(json);
            }

            @Override
            public boolean matches(final Object item) {
                return parser.parse((String) item).equals(parser.parse(json));
            }

            @Override
            public void describeMismatch(final Object item, final Description description) {
                description.appendText("but was ").appendValue(item);
            }
        };
    }


    @Test
    public void readProject() throws Exception {
        Reader expectedJsonReader = new InputStreamReader(this.getClass().getClassLoader().getResourceAsStream(EXPECTED_JSON_FILE));
        Project expectedProject = ProjectDeserializer.deserializeProject(expectedJsonReader);
        Reader reader = new InputStreamReader(this.getClass().getClassLoader().getResourceAsStream(EXAMPLE_FILE));

        sonarXMLImport = new SonarXMLImport(reader, null, "");
        Project project = sonarXMLImport.readProject();

        assertThat(project, is(expectedProject));
    }

    @Test
    public void writeProject() throws Exception {
        String expectedJson = "{\n" +
                "  \"projectName\": \"someName\",\n" +
                "  \"apiVersion\": \"1.0\",\n" +
                "  \"nodes\": []\n" +
                "}";

        Project project = new Project("someName");
        Writer out = new StringWriter();

        sonarXMLImport = new SonarXMLImport(null, out, "");
        sonarXMLImport.writeProject(project);

        assertThat(out.toString(), isAsJson(expectedJson));
    }

    @Test
    public void doImport() throws Exception {
        Reader reader = new InputStreamReader(this.getClass().getClassLoader().getResourceAsStream(EXAMPLE_FILE));
        Writer out = new StringWriter();
        String expectedOutput = CharStreams.toString(new InputStreamReader(
                this.getClass().getClassLoader().getResourceAsStream(EXPECTED_JSON_FILE), Charsets.UTF_8));

        sonarXMLImport = new SonarXMLImport(reader, out, "");
        sonarXMLImport.doImport();

        assertThat(out.toString(), isAsJson(expectedOutput));
    }

    @Test(expected = IOException.class)
    public void shouldThrowExceptionIfWriteProjectFails() throws Exception {
        Project project = new Project("someName");
        Writer out = mock(Writer.class);
        doThrow(IOException.class).when(out).flush();

        sonarXMLImport = new SonarXMLImport(null, out, "");
        sonarXMLImport.writeProject(project);
    }
}