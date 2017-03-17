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

import com.google.gson.JsonElement;
import com.google.gson.JsonParser;
import de.maibornwolff.codecharta.model.Project;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;

import static junit.framework.TestCase.assertTrue;

public class ProjectSerializerTest {
    @Rule
    public TemporaryFolder folder = new TemporaryFolder();

    private static final String EXAMPLE_JSON_PATH = "./src/test/resources/example.cc.json";

    private String getFilename() {
        String tmpFolder = folder.getRoot().getAbsolutePath();
        return tmpFolder + "test.cc.json";
    }

    private boolean fileContentEqual(File actual, File expected) throws IOException {
        JsonParser parser = new JsonParser();
        JsonElement actualJson = parser.parse(new FileReader(actual));
        JsonElement expectedJson = parser.parse(new FileReader(expected));
        return actualJson.equals(expectedJson);
    }

    @Test
    public void shouldSerializeProject() throws IOException {
        Project testProject = ProjectDeserializer.deserializeProject(EXAMPLE_JSON_PATH);

        ProjectSerializer.serializeProjectAndWriteToFile(testProject, getFilename());

        File result = new File(getFilename());
        assertTrue(result.exists());
        assertTrue(fileContentEqual(result, new File(EXAMPLE_JSON_PATH)));
    }

    @Test(expected = IOException.class)
    public void serializeWithWrongPathThrowsException() throws IOException {
        Project testProject = ProjectDeserializer.deserializeProject(EXAMPLE_JSON_PATH);

        ProjectSerializer.serializeProjectAndWriteToFile(testProject, folder.getRoot().getAbsolutePath() + "/someverystupidpath/out.json");

        File result = new File(getFilename());
        assertTrue(result.exists());
        assertTrue(fileContentEqual(result, new File(EXAMPLE_JSON_PATH)));
    }
}
