describe('The Home Page', () => {
  beforeEach(() => {
    // reset and seed the database prior to every test
    // cy.exec('npm run db:reset && npm run db:seed')
    // cy.exec('npm run db:delete-data ');
    cy.login()
  });

  it('successfully loads', () => {
    cy.visit('/menus');
  })
})
