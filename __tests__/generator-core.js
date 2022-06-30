"use strict";
const path = require("path");
const assert = require("yeoman-assert");
const helpers = require("yeoman-test");

describe("generator-xtext:app", () => {
  beforeAll(() =>
    helpers
      .run(path.join(__dirname, "../generators/app"))
      .withPrompts({
        projectName: "com.example.somedsl",
        fqLanguageName: "com.example.SomeDsl",
        fileExtension: "somedsl",
        facets: [],
      })
      .on("ready", (generator) => {
        Object.getPrototypeOf(generator).install = () => {}; // Skip Gradle execution
      })
  );

  it("creates outer Gradle build", () => {
    assert.file([
      "gradle/wrapper/gradle-wrapper.jar",
      "gradle/wrapper/gradle-wrapper.properties",
      "gradle/maven-deployment.gradle",
      "gradle/source-layout.gradle",
      "build.gradle",
      "gradlew",
      "gradlew.bat",
    ]);
  });

  it("creates core Xtext project", () => {
    assert.file([
      "com.example.somedsl/src/main/java/com/example/GenerateSomeDsl.mwe2",
      "com.example.somedsl/src/main/java/com/example/SomeDsl.xtext",
      "com.example.somedsl/build.gradle",
    ]);
  });

  it("creates a .gitignore in the project root", () => {
    assert.file([".gitignore"]);
  });
});
