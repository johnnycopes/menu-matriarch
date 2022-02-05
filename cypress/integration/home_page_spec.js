describe('The Home Page', () => {
  beforeEach(() => {
    const testUid = Cypress.env('TEST_UID');
    cy.exec(`npm run db:delete-data ${testUid} && npm run db:seed-data ${testUid}`);
    cy.login();
  });

  it('successfully loads', () => {
    cy.visit('/tags');
  })
})
