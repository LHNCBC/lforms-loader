# lforms-loader

This is a package for loading LHC-Forms (lforms) into a webpage by adding the needed link
and script tags to the page.

Exported functions:

* loadLForms(version, styleCallback, lhcFormsSource):  This adds tags to the
  current page to load LHC-Forms, and returns a promise that resolves when the
  files have been loaded (or fail to load, in which case the promise will be
  rejected).
  * version: the version to be loaded (e.g., '33.4.1').
  * styleCallback: (optional) a function to call as soon as the lforms styles are loaded
  * lhcFormsSource: (optional) a base URL from which the lforms files can be
    retrieved.  If not specified, the NLM lhcforms-static website will be 
    used as the source.

* getSupportedLFormsVersions():  Returns a promise that resolves to an array of
  the available lforms version strings for the versions supported by this loader
  script.  The versions will be sorted, with the most recent version first. 

* changeLFormsVersion(newLFormsVersion): Handles a selection of a new LForms
  version by reloading the page to the same URL but with the parameters "lfv"
  set to the new LForms version.  The app should then call the loadLForms
  function to load that requested version.
  * newLFormsVersion: the new version to switch to (assumed valid)

* loadLatestLForms(): Loads latest released version of LForms. If it fails, it
  attempts to load previous version. It uses getSupportedLFormsVersion() to fetch
  the latest and previous versions and attempts to load the latest first. If there
  is an error in loading it, it attempts to load the previous version. If succeeds,
* the returned promise resolves to the loaded version.
