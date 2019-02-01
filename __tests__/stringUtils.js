"use strict";

const assert = require("assert");
const stringUtils = require("../generators/app/lib/stringUtils");

describe("lib/stringUtils", () => {
  // Tests for toFirstUpper()
  describe("#toFirstUpper()", () => {
    it("should change the first character to an uppercase", () => {
      assert.equal(stringUtils.toFirstUpper("test"), "Test");
    });
    it("should leave the first character uppercase if already", () => {
      assert.equal(stringUtils.toFirstUpper("Test"), "Test");
    });
  });

  // Tests for toFirstLower
  describe("#toFirstLower()", () => {
    it("should change the first character to lowercase", () => {
      assert.equal(stringUtils.toFirstLower("TEST"), "tEST");
    });
    it("should leave the first character lowercase if already", () => {
      assert.equal(stringUtils.toFirstLower("test"), "test");
    });
  });

  // Tests for toURL
  describe("#toURL()", () => {
    it("should convert a Java packge to an URL", () => {
      assert.equal(
        stringUtils.toURL("com.example.my.project"),
        "http://www.example.com/my/project"
      );
    });
  });
});
