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

import com.google.common.collect.ImmutableList;
import de.maibornwolff.codecharta.importer.sonar.model.Qualifier;
import de.maibornwolff.codecharta.importer.sonar.model.Scope;
import de.maibornwolff.codecharta.importer.sonar.model.SonarAttribute;
import de.maibornwolff.codecharta.importer.sonar.model.SonarResource;
import de.maibornwolff.codecharta.model.Node;
import de.maibornwolff.codecharta.model.Project;
import org.junit.Test;

import static org.hamcrest.Matchers.is;
import static org.junit.Assert.assertThat;

public class SonarResourceToProjectConverterTest {
    private static final String PROJECT_NAME = "componentShouldBeInsertedAccordingToComponentPath project";

    private static SonarResource createEmptyProjectResource() {
        return new SonarResource(ImmutableList.of(), "", PROJECT_NAME, Scope.PRJ, Qualifier.TRK, "");
    }

    @Test(expected = IllegalArgumentException.class)
    public void shouldNotConvertResourcesWithoutProjectResource() {
        SonarResource resource = new SonarResource(ImmutableList.of(), "", "", Scope.DIR, Qualifier.TRK, "");
        SonarResourceToProjectConverter converter = new SonarResourceToProjectConverter(ImmutableList.of(resource), "");
        converter.convert();
    }

    @Test
    public void shouldConvertSimpleSonarProject() throws Exception {
        SonarResource resource = createEmptyProjectResource();
        SonarResourceToProjectConverter converter = new SonarResourceToProjectConverter(ImmutableList.of(resource), "");
        Project project = converter.convert();

        assertThat(project.getProjectName(), is(PROJECT_NAME));
        assertThat(project.getNodes().size(), is(0));
    }

    @Test
    public void shouldConvertSonarProjectWithNodes() throws Exception {
        SonarResource resource = createEmptyProjectResource();

        String urlString = "http://someurl.com";
        String keyString = "someKey";
        String nodeName = "testNode";
        SonarResource node = new SonarResource(ImmutableList.of(), keyString, "", Scope.DIR, Qualifier.DIR, nodeName);


        SonarResourceToProjectConverter converter = new SonarResourceToProjectConverter(ImmutableList.of(resource, node), urlString);
        Project project = converter.convert();

        assertThat(project.getNodes().size(), is(1));
        Node rootNode = project.getNodes().get(0);
        assertThat(rootNode.getName(), is("root"));

        // should have testNode
        assertThat(rootNode.getChildren().size(), is(1));
        assertThat(rootNode.getChildren().get(0).getName(), is(nodeName));
        assertThat(rootNode.getChildren().get(0).getLink(), is(urlString + "/code/index?id=" + keyString));
    }

    @Test
    public void shouldIgnoreNodesWithoutLname() throws Exception {
        SonarResource resource = createEmptyProjectResource();
        SonarResource node = new SonarResource(ImmutableList.of(), "", "", Scope.DIR, Qualifier.DIR, "");

        SonarResourceToProjectConverter converter = new SonarResourceToProjectConverter(ImmutableList.of(resource, node), "");
        Project project = converter.convert();
        assertThat(project.getNodes().size(), is(0));
    }

    @Test
    public void shouldConvertSonarProjectWithNodesAndAttributes() throws Exception {
        SonarResource resource = createEmptyProjectResource();
        String keyString = "theKey";
        double value = 99.0;
        SonarResource node = new SonarResource(ImmutableList.of(new SonarAttribute(keyString, value)), keyString, "", Scope.DIR, Qualifier.DIR, "testNode");

        SonarResourceToProjectConverter converter = new SonarResourceToProjectConverter(ImmutableList.of(resource, node), "");
        Project project = converter.convert();

        Node testNode = project.getNodes().get(0).getChildren().get(0);
        System.out.println(testNode.getAttributes());
        assertThat(testNode.getAttributes().get(keyString), is(value));
    }

}