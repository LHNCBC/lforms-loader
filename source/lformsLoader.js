// This file defines the function for loading a particular version of lforms,
// and also exports useful functions for getting the list of supported versions
// and switching to a new version.

import semverSort from 'semver/functions/rsort.js';

const DEFAULT_LFORMS_SOURCE = 'https://lhcforms-static.nlm.nih.gov/lforms-versions/';

const MAX_TRIES = 10;

/**
 *  Loads LForms into the page, returning a promise that resolves when it is
 *  ready.
 * @param version the version to be loaded.  This is ignored if lhcFormsSource is
 *  provided.
 * @param styleCallback (optional) a function to call as soon as the styles are loaded
 * @param lhcFormsSource (optional) a base URL from which the LForms files can be
 *  retrieved.  If not specified, the DEFAULT_LFORMS_SOURCE, which also
 *  hosts most versions of LForms, will be used as the source.
 */
function _loadLForms(version, styleCallback, lhcFormsSource) {
  const lformsDir = lhcFormsSource ? lhcFormsSource :
    `${DEFAULT_LFORMS_SOURCE}${version}`;
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
    'Loaded LHC-Forms ' + (lhcFormsSource ? 'from '+lhcFormsSource : 'version '+version)));
}


/**
 *  Returns a promise that resolves to an array of the available LForms version
 *  strings for the versions supported by this loader script.  The versions will
 *  be sorted, with the most recent version first.
 */
function _getSupportedLFormsVersions() {
  return fetch(DEFAULT_LFORMS_SOURCE).then(response=> {
    // https://lhcforms-static.nlm.nih.gov/lforms-versions/ contains output like:
    // <a href='lforms-9.0.2.zip'>lforms-9.0.2.zip</a>
    // https://clinicaltables.nlm.nih.gov/lforms-versions contains output like:
    // <span class="name">lforms-9.0.2.zip</span>
    if (!response.ok) {
      throw new Error('Unable to retrieve the list of LForms versions from ' +
          DEFAULT_LFORMS_SOURCE);
    } else {
      return response.text().then(pageText => {
        const versions =
            [...pageText.matchAll(/>lforms-([^<]+)\.zip</g)].map(
                m => m[1]).filter(v => v.split('.')[0] >= 29);
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
 *  Loads a tag (for CSS or a script) and returns a promise that resolves
 *  when all of the associated file has loaded or has failed to load.
 * @param tag the tag to load
 */
function loadTag(tag) {
  return new Promise((resolve, reject) => {
    tag.addEventListener('error', (event)=>{
      reject(event); // Let the caller know the cause.
    });
    tag.addEventListener('load', (event)=>{
      resolve(event); // Give caller additional info.
    });
    if (tag.tagName == 'LINK')
      document.head.appendChild(tag);
    else {
      tag.async=false;
      document.body.appendChild(tag);
    }
  });
}

/**
 *  Get an array of all available lforms version strings. The list is sorted with
 *  the most recent first. If it encounters errors when fetching from the server,
 *  it will re-try upto maximum number of times defined above.
 * 
 * @returns - A promise which resolves to a list of versions if successful, other
 *    wise rejects after maximum tries.
 */
export function getSupportedLFormsVersions() {
  let tries = 1;
  function loop() {
    return new Promise((resolve, reject) => {
      _getSupportedLFormsVersions().then((versions) => {
        const v = versions[0];
        resolve(versions);
      }).catch((err) => {
        tries++;
        if(tries > MAX_TRIES) {
          const msg = `${Date.now()}: Failed to get LForms version after ${tries} attempts.`;
          console.error(`${msg} - ${err.stack}`);
          reject(err);
        }
        else {
          setTimeout(async () => {
            console.error(`${Date.now()}: ${err.message}`);
            console.log(`Retrying getSupportedLFormsVersions() again: ${tries}...`);
            await loop().then(resolve, reject);
          }, 500);
        }
      });
    });
  }
  return loop();
}

/**
 *  Loads LForms into the page, returning a promise that resolves when it is
 *  ready. If it encounters errors when fetching from the server, it will re-try
 *  upto maximum number of times defined above.
 * 
 * @param version the version to be loaded.  This is ignored if lhcFormsSource is
 *   provided.
 * @param styleCallback (optional) a function to call as soon as the styles are loaded
 * @param lhcFormsSource (optional) a base URL from which the LForms files can be
 *   retrieved.  If not specified, the DEFAULT_LFORMS_SOURCE, which also
 *   hosts most versions of LForms, will be used as the source.
 * 
 * @returns - A promise which resolves to loaded version string, a confirmation
 *   that the required version is available in the page. If it fails, it will reject
 *   with an error event emitted by the browser.
 */

export function loadLForms(version, styleCallback, lhcFormsSource) {
  let tries = 1;

  function loop() {
    return new Promise((resolve, reject) => {
      _loadLForms(version, styleCallback, lhcFormsSource).then(() => {
        resolve(LForms.lformsVersion);
      }).catch((errorEvent) => {
        tries++;
        if(tries > MAX_TRIES) {
          const msg = `${Date.now()}: Failed to get LForms library files after ${tries} attempts.`;
          console.error(`${msg} - ${errorEvent.error?.stack}`);
          reject(errorEvent);
        }
        else {
          setTimeout(async () => {
            console.error(`${Date.now()}: ${errorEvent.message}`);
            console.log(`Retrying loadLForms() again: ${tries}...`);
            await loop(version).then(resolve, reject);
          }, 500);
        }
      });
    });
  }
  return loop();
}

