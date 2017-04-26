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

import de.maibornwolff.codecharta.importer.sonar.model.SonarAttribute;
import de.maibornwolff.codecharta.importer.sonar.model.SonarResource;
import org.junit.Test;

import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringReader;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;

public class SonarReaderTest {
    private static final String EXAMPLE_FILE = "example.xml";
    private static final String EXAMPLE_WRONG_DATE_FORMAT = "example_wrong_dateformat.xml";

    private SonarReader sonarReader;

    @Test
    public void shouldReadSonarObjects() throws Exception {
        Reader reader = new InputStreamReader(this.getClass().getClassLoader().getResourceAsStream(EXAMPLE_FILE));

        sonarReader = new SonarReader(reader);
        List<SonarResource> sonarResources = sonarReader.readSonarResources();

        assertThat(sonarResources, hasSize(9));
        SonarAttribute metric = sonarResources.get(0).getMsr().get(0);
        assertThat(metric.getKey(), is("coverage"));
        assertThat(metric.getVal(), is(0.0));
    }

    @Test(expected = SonarImporterException.class)
    public void shouldThrowExceptionOnWrongXMLFormat() throws Exception {
        String invalidXML = "< bla  <bale";

        sonarReader = new SonarReader(new StringReader(invalidXML));
        sonarReader.readSonarResources();
    }

    @Test(expected = SonarImporterException.class)
    public void shouldThrowExceptionOnMissingResourceEndTag() throws Exception {
        String invalidXML = "<resources><resource></resources>";

        sonarReader = new SonarReader(new StringReader(invalidXML));
        sonarReader.readSonarResources();
    }

    private String wrapInSonarResourceXML(String attribString) {
        return "<resources>" +
                "<resource>" +
                "<id>1366136</id><key>ubu.gii.dass.poolobject</key><name>201701poolobject</name>" +
                "<lname>201701poolobject</lname><scope>PRJ</scope><qualifier>TRK</qualifier>" +
                "<date>2017-01-25T11:49:45+0100</date><creationDate>2017-01-25T11:49:50+0100</creationDate>" +
                attribString +
                "</resource></resources>";
    }


    @Test
    public void shouldReadCorrectMsr() throws Exception {
        String invalidXML = wrapInSonarResourceXML("<msr><key>someKey</key><val>0</val></msr>");

        sonarReader = new SonarReader(new StringReader(invalidXML));
        List<SonarResource> sonarResources = sonarReader.readSonarResources();

        assertThat(sonarResources, hasSize(1));
        assertThat(sonarResources.get(0).getMsr(), hasSize(1));
    }

    @Test
    public void shouldIgnoreStrangeAttributes() throws Exception {
        String invalidXML = wrapInSonarResourceXML("<someattr><bla></bla></someattr>");

        sonarReader = new SonarReader(new StringReader(invalidXML));
        List<SonarResource> sonarResources = sonarReader.readSonarResources();

        assertThat(sonarResources, hasSize(1));
        assertThat(sonarResources.get(0).getMsr(), hasSize(0));
    }

    @Test(expected = SonarImporterException.class)
    public void shouldThrowExceptionOnMissingMsrEndTag() throws Exception {
        String invalidXML = wrapInSonarResourceXML("<msr>");

        sonarReader = new SonarReader(new StringReader(invalidXML));
        List<SonarResource> sonarResources = sonarReader.readSonarResources();
    }

    @Test
    public void shouldIgnoreMsrWithoutValue() throws Exception {
        String invalidXML = wrapInSonarResourceXML("<msr><key>bla</key></msr>");

        sonarReader = new SonarReader(new StringReader(invalidXML));
        List<SonarResource> sonarResources = sonarReader.readSonarResources();

        assertThat(sonarResources, hasSize(1));
        assertThat(sonarResources.get(0).getMsr(), hasSize(0));
    }


    @Test
    public void shouldIgnoreMsrWithoutKey() throws Exception {
        String invalidXML = wrapInSonarResourceXML("<msr></msr>");

        sonarReader = new SonarReader(new StringReader(invalidXML));
        List<SonarResource> sonarResources = sonarReader.readSonarResources();

        assertThat(sonarResources, hasSize(1));
        assertThat(sonarResources.get(0).getMsr(), hasSize(0));
    }

    @Test
    public void shouldIgnoreAttributesWithoutValue() throws Exception {
        String invalidXML = wrapInSonarResourceXML("<bla/>");

        sonarReader = new SonarReader(new StringReader(invalidXML));
        List<SonarResource> sonarResources = sonarReader.readSonarResources();

        assertThat(sonarResources, hasSize(1));
    }

    @Test
    public void shouldIgnoreWrongDateFormat() throws Exception {
        Reader reader = new InputStreamReader(this.getClass().getClassLoader().getResourceAsStream(EXAMPLE_WRONG_DATE_FORMAT));

        sonarReader = new SonarReader(reader);
        List<SonarResource> sonarResources = sonarReader.readSonarResources();

        assertThat(sonarResources, hasSize(1));
    }


}