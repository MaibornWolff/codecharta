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

import com.beust.jcommander.JCommander;
import com.beust.jcommander.Parameter;

import java.util.ArrayList;
import java.util.List;

class SonarImporterParameter {
    private final JCommander jc;
    @Parameter(names = {"-h", "--help"}, description = "This help text", help = true)
    private boolean help = false;

    @Parameter(description = "[[file]|[url] [project-id]]")
    private List<String> files = new ArrayList<>();

    @Parameter(names = {"-o", "--outputFile"}, description = "Output File (or empty for stdout)")
    private String outputFile = "";

    @Parameter(names = {"-m", "--metrics"}, description = "Comma-separated list of metrics to import (defaults to \"our special list\"))")
    private List<String> metrics = new ArrayList<>();

    @Parameter(names = {"-u", "--user"}, description = "User Token for connecting to remote sonar instance")
    private String user = "";

    @Parameter(names = {"--old-api"}, description = "Old SonarQube-Api")
    private boolean oldApi = false;

    @Parameter(names = {"--merge-modules"}, description = "merges modules in multi-module projects")
    private boolean usePath = false;

    @Parameter(names = {"-l", "--local"}, description = "Local run")
    private boolean local = false;

    public SonarImporterParameter(String[] args) {
        this.jc = new JCommander(this);
        this.jc.parse(args);
    }

    public boolean isHelp() {
        return help;
    }

    public List<String> getFiles() {
        return files;
    }

    public String getOutputFile() {
        return outputFile;
    }

    public List<String> getMetrics() {
        return metrics;
    }

    public String getUser() {
        return user;
    }

    public boolean isOldApi() {
        return oldApi;
    }

    public boolean isLocal() {
        return local;
    }

    public boolean isUsePath() {
        return usePath;
    }

    public void printUsage() {
        jc.usage();
    }
}
