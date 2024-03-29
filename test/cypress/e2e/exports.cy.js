describe('loadLForms', () => {
  const form = '{"resourceType": "Questionnaire", "title": "Test Form"}';

  it('should define LForms', (done) => {
    cy.visit('test/pages/testPage.html');
    cy.window().then(win => {
      expect(win.LForms).to.be.undefined;
      win.loadLForms('33.4.2').then(() => win.LForms.Util.addFormToPage(form, 'formDiv')).then(() => {
        // I wanted to test whether LForms was undefined, but Cypress tries to
        // make a string of it, which results in an exception being thrown.  Checking
        // just for LForms.lformsVersion should suffice.
        expect(win.LForms.lformsVersion).to.be.not.undefined;
        done();
      });
    });
  });

  it('should support a callback parameter', (done) => {
    // The callback is triggered when the CSS file is loaded, but I think we can
    // just test that the callback is called.
    cy.visit('test/pages/testPage.html');
    const callback = cy.stub();
    cy.window().then(win => {
      win.loadLForms('33.4.2', callback).then(() => win.LForms.Util.addFormToPage(form, 'formDiv')).then(() => {
        expect(callback).to.be.called;
        done();
      });
    });
  });

  it('should support a URL parameter for fetching LForms', (done) => {
    // This parameter allows LForms to be fetched from an alternate location
    // (e.g., a local installation).  Here we are using the fact that currently
    // https://lforms-service.nlm.nih.gov/lforms-versions does not redirect to
    // https://clinicaltables.nlm.nih.gov/lforms-versions, though perhaps it
    // should since it is the same host.
    cy.visit('test/pages/testPage.html');
    cy.window().then(win => {
      win.loadLForms('33.4.0', null, // 33.4.0 should be ignored
        'https://lforms-service.nlm.nih.gov/lforms-versions/33.4.2').then(() =>
        win.LForms.Util.addFormToPage(form, 'formDiv')).then(() => {
        expect(win.LForms.lformsVersion).to.equal('33.4.2');
        done();
      });
    });
  });
});


describe('getSupportedLFormsVersions', () => {
  let versions = [];

  before((done) => {
    cy.visit('test/pages/testPage.html');
    cy.window().then(win => {
      win.getSupportedLFormsVersions().then(lformsVersions => {
        versions = lformsVersions;
        done();
      });
    });
  });

  it('should be return the LForms versions in order of most recent to least', () => {
    expect(versions).to.have.length.greaterThan(0);
    const indexOf33_4_2 = versions.indexOf('33.4.2');
    const indexOf33_4_1 = versions.indexOf('33.4.1');
    expect(indexOf33_4_2).to.be.lessThan(indexOf33_4_1);
  });

  it('should be return the beta versions', () => {
    expect(versions).to.have.length.greaterThan(0);
    const indexOf33_0_0_beta_0 = versions.indexOf('30.0.0-beta.0');
    expect(indexOf33_0_0_beta_0).not.to.equal(-1);
  });
});

describe('changeLFormsVersion', () => {
  it('should change to a new URL with the lfv parameter', () => {
    cy.visit('test/pages/testPage.html');
    cy.window().then(win => {
      win.changeLFormsVersion('33.4.1');
    });
    cy.window().then(win => { // get window for new page
      expect(win.document.location.search).to.equal('?lfv=33.4.1');
    });
  });

  it('should not replace other parameters', () => {
    cy.visit('test/pages/testPage.html?a=1&lfv=2&b=3');
    cy.window().then(win => {
      win.changeLFormsVersion('33.4.1');
    });
    cy.window().then(win => { // get window for new page
      expect(win.document.location.search).to.equal('?a=1&lfv=33.4.1&b=3');
    });
  });
});
