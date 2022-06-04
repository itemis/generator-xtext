module.exports = {
  toFirstUpper([first, ...rest]) {
    return first.toUpperCase() + rest.join("");
  },

  toFirstLower([first, ...rest]) {
    return first.toLowerCase() + rest.join("");
  },

  toURL(thePackage) {
    const [topLevelDomain, domain, ...rest] = thePackage.split(".");
    return `http://www.${domain}.${topLevelDomain}/${rest.join("/")}`;
  },
};
