const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    supportFile: false,
    fileServerFolder: '..',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  }
});
