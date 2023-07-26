// This file defines the function for loading a particular version of lforms,
// and also exports useful functions for getting the list of supported versions
// and switching to a new version.

import semverSort from 'semver/functions/rsort';

/**
 *  Loads LForms into the page, returning a promise that resolves when it is
 *  ready.
 * @param version the version to be loaded
 * @param styleCallback (optional) a function to call as soon as the styles are loaded
 */
export function loadLForms(version, styleCallback) {
  const lformsDir = "https://clinicaltables.nlm.nih.gov/lforms-versions/"+version;
  // TBD Add support for versions < 33
  let cssFile, lformsScripts, fhirScript;
  const majorVersion = version.split('.')[0];
  if (majorVersion >= 33) {
    cssFile = '/webcomponent/styles.css';
    // Time tests demonstrated that using the concatenated file is a little
    // faster when there is latency.
    //lformsScripts = ['assets/lib/zone.min.js', 'scripts.js', 'runtime.js',
    //  'polyfills.js', 'main.js'].map(f=>'/webcomponent/'+f);
    lformsScripts = ['assets/lib/zone.min.js', 'lhc-forms.js'].map(f=>'/webcomponent/'+f);
    fhirScript = "/fhir/lformsFHIRAll.min.js";
  }
  else if (majorVersion >= 30) {
    cssFile = '/webcomponent/styles.css';
    //lformsScripts = ['assets/lib/zone.min.js', 'scripts.js', 'runtime-es5.js',
    //  'polyfills-es5.js', 'main-es5.js'].map(f=>'/webcomponent/'+f);
    lformsScripts = ['assets/lib/zone.min.js', 'lhc-forms.es5.js'].map(f=>'/webcomponent/'+f);
    fhirScript = "/fhir/lformsFHIRAll.min.js";
  }
  else {
    cssFile = '/styles/lforms.min.css';
    lformsScripts = ['/lforms.min.js'];
    fhirScript = "/fhir/lformsFHIRAll.min.js";
  }

  const cssTag = document.createElement('link');
  cssTag.setAttribute('href', lformsDir+cssFile);
  cssTag.setAttribute('media', 'screen');
  cssTag.setAttribute('rel', 'stylesheet');
  let loadPromises = [];
  loadPromises.push(loadTag(cssTag).then(()=>styleCallback && styleCallback()));

  lformsScripts.push(fhirScript);
  for (let filename of lformsScripts) {
    const scriptTag = document.createElement('script');
    scriptTag.setAttribute('src', lformsDir+filename);
    scriptTag.setAttribute('async', false); // has no effect; set again below
    scriptTag.setAttribute('defer', true);
    loadPromises.push(loadTag(scriptTag));
  }

  // We need to wait for the LForms script to load before loading the FHIR
  // support.
  return Promise.all(loadPromises).then(()=>console.log(
    'Loaded LHC-Forms version '+version));
}


/**
 *  Returns a promise that resolves to an array of the available LForms version
 *  strings for the versions supported by this loader script.
 */
export function getSupportedLFormsVersions() {
  return fetch('https://clinicaltables.nlm.nih.gov/lforms-versions').then(response=>{
    // https://clinicaltables.nlm.nih.gov/lforms-versions contains output like:
    // <span class="name">lforms-9.0.2.zip</span>
    if (!response.ok) {
      throw new Error('Unable to the retrive the list of LForms versions from '+
        'https://clinicaltables.nlm.nih.gov/lforms-versions');
    }
    else {
      return response.text().then(pageText=>{
        const versions  =
          [...pageText.matchAll(/<span class="name">lforms-(.*)\.zip<\/span>/g)].map(
            m=>m[1]).filter(v=>v.split('.')[0]>=29);
        semverSort(versions);
        return versions;
      });
    }
  });
}


/**
 *  Handles a selection of a new LForms version by reloading the page to the
 *  same URL but with the parameters "lfv" set to the new LForms version.  The
 *  app should then call the loadLForms function to load that requested version.
 * @param newLFormsVersion the new version to switch to (assumed valid)
 */
export function changeLFormsVersion(newLFormsVersion) {
  // We need to reload the page.
  // The menu only shows if parameters were not set for the questionnaire, so
  // we can't preserve any field values the user might have filled in for the
  // questionnaire.
  let pageURL = window.location.origin + window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  params.set('lfv', newLFormsVersion);
  window.location = pageURL + '?' + params;
}


/**
 *  Loads a tag (for CSS or a script) and returns a promise the resolves
 *  when all of the associated file has loaded or has failed to load.
 * @param tag the tag to load
 */
function loadTag(tag) {
  return new Promise((resolve, reject) => {
    tag.addEventListener('error', (event)=>{
      reject();
    });
    tag.addEventListener('load', (event)=>{
      resolve();
    });
    if (tag.tagName == 'LINK')
      document.head.appendChild(tag);
    else {
      tag.async=false;
      document.body.appendChild(tag);
    }
  });
}
