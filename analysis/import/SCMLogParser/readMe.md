CodeCharta
=========
CVSLogParser
-------------------------------
Der CVSLogParser ist ein Tool zum parsen von Repository-Logs aus Git- oder SVN-Repositories, um herauszufinden, welche Datei wie oft committed wurde.
Die Logs müssen zwangsläufig mit "svn log --verbose" oder "git log --name-status" erstellt werden, da sonst keine Aussage über die veränderten
Daten getroffen werden kann.

-------------------------------
Das Tool wird folgendermaßen benutzt:

### Erstellung des Repository-Logs mit Hilfe von: 
* Git:   `git log --name-status`
* Svn:   `svn log --verbose`

### Aufruf des LogParsers 
* via gradle: `gradle run -PappArgs="['<PfadDerLogDatei>', '-git/-svn' ['<PfadDerOutputDatei>']]"`
* via jar: `java -jar CVSLogParser-x.x.jar <PfadDerLogDatei> -git/-svn [<PfadDerOutputDatei>]`

Das Ergebnis liegt im spezifizierten Pfad als JSON-Datei vor. Ist kein Pfad spezifiziert, wird der Output standardgemäß als `./parsedLog.cc.json` gespeichert.




