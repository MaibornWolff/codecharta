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

package de.maibornwolff.codecharta.serialization;

import de.maibornwolff.codecharta.model.Node;
import de.maibornwolff.codecharta.model.Project;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

import java.io.FileNotFoundException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.StringReader;

import static junit.framework.TestCase.assertTrue;
import static org.hamcrest.Matchers.*;
import static org.junit.Assert.assertThat;

public class ProjectDeserializerTest {
    @Rule
    public TemporaryFolder folder = new TemporaryFolder();

    private static final String EXAMPLE_CC_JSON = "example.cc.json";

    @Test
    public void shouldDeserializeProjectJson() throws FileNotFoundException {
        Reader expectedJsonReader = new InputStreamReader(this.getClass().getClassLoader().getResourceAsStream(EXAMPLE_CC_JSON));

        Project project = ProjectDeserializer.deserializeProject(expectedJsonReader);

        assertTrue(project != null);
        assertTrue(project.getProjectName().equals("201701poolobject"));
        assertTrue(project.getNodes() != null);
        assertTrue(project.getNodes().size() == 1);
    }

    @Test
    public void deserializeProject_should_map_nonexisting_values_to_defaults() throws FileNotFoundException {
        // given
        String jsonString = "{projectName='some Project', apiVersion='1.0', nodes=[{name:'root',type:'Folder'}]}";

        // when
        Project project = ProjectDeserializer.deserializeProject(new StringReader(jsonString));

        // then
        Node node = project.getNodes().get(0);

        assertThat(node.getLink(), is(nullValue()));
        assertThat(node.getAttributes(), not(nullValue()));
        assertThat(node.getChildren(), not(nullValue()));
    }
}
