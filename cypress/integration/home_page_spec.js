describe('The Home Page', () => {
  beforeEach(() => {
    // reset and seed the database prior to every test
    // cy.exec('npm run db:reset && npm run db:seed')
    // cy.exec('npm run reset-dev');
  });

  it('successfully loads', () => {
    cy.visit('/');
  })

  it('logs in', () => {
    cy.get('button').click();
  });
})
