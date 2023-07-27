
describe('loadLForms', ()=>{
  it('should define LForms', ()=>{
    cy.visit('test/pages/testPage.html');
    cy.window().then(win=>{
      // I wanted to test whether LForms was undefined, but Cypress tries to
      // make a string of it, which results in an exception be throws.  Checking
      // just for LForms.lformsVersion should suffice.
      expect(win.LForms.lformsVersion).to.be.not.undefined;
    });
  });
});

describe('getSupportedLFormsVersions', ()=>{
  it('should be return the LForms versions in order of most recent to least', ()=>{
    cy.visit('test/pages/testPage.html');
    cy.window().then(win=>{
      win.getSupportedLFormsVersions().then(versions=>{
        expect(versions).to.have.length.greaterThan(0);
        const indexOf33_4_2 = versions.indexOf('33.4.2');
        const indexOf33_4_1 = versions.indexOf('33.4.1');
        expect(indexOf33_4_2).to.be.lessThan(indexOf33_4_1);
      });
    });
  });
});

describe('changeLFormsVersion', ()=>{
  it('should change to a new URL with the lfv parameter', ()=>{
    cy.visit('test/pages/testPage.html');
    cy.window().then(win=>{
      win.changeLFormsVersion('33.4.1');
    });
    cy.window().then(win=>{ // get window for new page
      expect(win.document.location.search).to.equal('?lfv=33.4.1');
    });
  });

  it('should not replace other parameters', ()=>{
    cy.visit('test/pages/testPage.html?a=1&lfv=2&b=3');
    cy.window().then(win=>{
      win.changeLFormsVersion('33.4.1');
    });
    cy.window().then(win=>{ // get window for new page
      expect(win.document.location.search).to.equal('?a=1&lfv=33.4.1&b=3');
    });
  });
});
