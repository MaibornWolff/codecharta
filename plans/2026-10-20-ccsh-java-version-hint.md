---
name: ccsh names the Java version it needs
state: complete
version: 1
---

## Goal

When `ccsh` is started on a Java older than the minimum (22), it prints which Java it needs and which one it found,
instead of the JVM's `UnsupportedClassVersionError`.

## Tasks

### 1. Launcher
- Small Java class in its own `launcher` source set of `ccsh`, compiled for Java 11 so old JVMs can load it
- Checks `Runtime.version().feature()` against the minimum, prints a clear message and exits 1, else starts `Ccsh`
- Minimum version comes from the root build (`minimumJavaVersion`), not duplicated

### 2. Wiring
- Launcher becomes `mainClass` (start scripts) and is packed into the fat jar (`java -jar`)

### 3. Changelog
- Rewrite the unreleased "Java 22 or newer" entry

## Steps

- [x] Complete Task 1: Launcher (with tests)
- [x] Complete Task 2: Wiring, verified with Java 17 and 25 on the installed ccsh
- [x] Complete Task 3: Changelog

## Notes

- Below Java 17 the start scripts still fail first: the JVM does not know `--enable-native-access`
