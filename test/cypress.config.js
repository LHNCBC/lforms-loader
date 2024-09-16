const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    fileServerFolder: '..',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  }
});
