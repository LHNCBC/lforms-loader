# Change Log

This log documents the significant changes for each release.
This project follows [Semantic Versioning](http://semver.org/).

## [3.1.0] 2024-09-18
### Added
- Added loadLatestLForms().

## [3.0.3] 2024-05-10
### Fixed
- Retry loading the libraries in case of failures.

## [3.0.2] 2024-04-05
### Fixed
- Add event parameter to reject() and resolve() calls in loadTag().

## [3.0.1] 2024-03-29
### Fixed
- Corrected the console log message which loadLForms outputs after LHC-Forms is
  loaded, for the case where lhcFormsSource is specified.

## [3.0.0] 2024-03-05
### Changed
- Use lhcforms-static.nlm.nih.gov instead of lhcfhirtools-static.nlm.nih.gov.

## [2.0.3] 2024-02-26
### Fixed
- Parsing lforms versions returned by https://lhcfhirtools-static.nlm.nih.gov/lforms-versions/.
- Tests that were passing but were not really asserting conditions.

## [2.0.2] 2024-02-23
### Fixed
- Parsing lforms versions returned by https://lhcfhirtools-static.nlm.nih.gov/lforms-versions/.

## [2.0.1] 2024-02-23
### Changed
- Added '/' to lhcfhirtools-static.nlm.nih.gov/lforms-versions to avoid redirect.

## [2.0.0] 2024-02-16
### Changed
- Load from lhcfhirtools-static.nlm.nih.gov instead of clinicaltables.nlm.nih.gov.

## [1.0.0] 2023-07-26
### Added
- Initial release.
