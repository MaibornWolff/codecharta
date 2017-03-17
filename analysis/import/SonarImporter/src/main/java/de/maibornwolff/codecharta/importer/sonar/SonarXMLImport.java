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

import de.maibornwolff.codecharta.importer.sonar.model.SonarResource;
import de.maibornwolff.codecharta.model.Project;
import de.maibornwolff.codecharta.serialization.ProjectSerializer;

import java.io.IOException;
import java.io.Reader;
import java.io.Writer;
import java.util.List;

public class SonarXMLImport {
    private final Reader in;

    private final Writer out;

    private final String baseUrlForLink;

    public SonarXMLImport(Reader in, Writer out, String baseUrlForLink) {
        this.in = in;
        this.out = out;
        this.baseUrlForLink = baseUrlForLink;
    }

    Project readProject() throws SonarImporterException {
        SonarReader sonarReader = new SonarReader(in);
        List<SonarResource> sonarResources = sonarReader.readSonarResources();

        SonarResourceToProjectConverter projectConverter = new SonarResourceToProjectConverter(sonarResources, baseUrlForLink);
        return projectConverter.convert();
    }

    void writeProject(Project project) throws IOException {
        ProjectSerializer.serializeProject(project, out);
    }

    public void doImport() throws SonarImporterException, IOException {
        Project project = readProject();
        writeProject(project);
    }
}
