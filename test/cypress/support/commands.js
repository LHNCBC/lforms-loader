// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/**
 * Intended to create a mock response for .js files.
 * Copied from https://github.com/cypress-io/cypress/issues/1271#issuecomment-818909021
 */
Cypress.Commands.add('mockThirdPartyJS', (url, fixturePath, _as) => {
    return cy.readFile(
        `cypress/fixtures/${fixturePath}`,
        'utf8'
    ).then((stubResponse) => {
        cy.intercept(url, (req) => {
            req.reply(stubResponse)
        }).as(_as);
    });
});
