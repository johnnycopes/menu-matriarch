/// <reference types="cypress" />

describe('Tags Feature', () => {
  before(() => {
    const testUid = Cypress.env('TEST_UID');
    cy.exec(`npm run db:delete-data ${testUid} && npm run db:seed-data ${testUid}`);
    cy.login();
    cy.visit('/tags');
  });

  it('Loads Tags route and asserts correct counts', () => {
    cy.get('.app-section__content.tags li')
      .should('have.length', 2);
    cy.get('app-card')
      .first()
      .find('span.count')
      .first()
      .should('contain', '1');
    cy.get('app-card')
      .first()
      .find('span.count')
      .last()
      .should('contain', '1');
    cy.get('app-card')
      .last()
      .find('span.count')
      .first()
      .should('contain', '0');
    cy.get('app-card')
      .last()
      .find('span.count')
      .last()
      .should('contain', '1');
  });

  it('Creates a new tag', () => {
    cy.get('.app-section__toolbar button')
      .click();
    cy.get('.app-inline-form input')
      .type('Vegan')
      .should('have.value', 'Vegan')
      .type('{enter}');
    cy.get('.app-section__content.tags li')
      .should('have.length', 3);
  });

  it('Navigates to Dishes route and edits tags on dishes', () => {
    cy.get('a.link')
      .contains('Dishes')
      .click();
    cy.get('a.dish-link')
      .click();
    cy.get('a[app-button]')
      .contains('Edit')
      .click();
    cy.get('app-dish-edit app-tag')
      .should('have.length', 3)
      .contains('Pescatarian')
      .click();
    cy.get('button[app-button]')
      .contains('Save')
      .click();

    cy.get('li.tab')
      .contains('sides')
      .click();
    cy.get('a.dish-link')
      .click();
    cy.get('a[app-button]')
      .contains('Edit')
      .click();
    cy.get('app-dish-edit app-tag')
      .should('have.length', 3)
      .contains('Vegan')
      .click();
    cy.get('button[app-button]')
      .contains('Save')
      .click();
  });

  it('Navigates back to Tags route and confirms correct counts', () => {
    cy.get('a.link')
      .contains('Tags')
      .click();
    cy.wait(300);
    cy.get('app-card')
      .first()
      .find('span.count')
      .first()
      .should('contain', '1');
    cy.get('app-card')
      .first()
      .find('span.count')
      .last()
      .should('contain', '0');
    cy.get('app-card')
      .eq(1)
      .find('span.count')
      .first()
      .should('contain', '0');
    cy.get('app-card')
      .eq(1)
      .find('span.count')
      .last()
      .should('contain', '1');
    cy.get('app-card')
      .last()
      .find('span.count')
      .first()
      .should('contain', '0');
    cy.get('app-card')
      .last()
      .find('span.count')
      .last()
      .should('contain', '1');
  });
});
