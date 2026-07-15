# plOtter FVS PWA revision and validation report

## Build identification

- Application version: **1.8.0**
- Data schema version: **5**
- Service-worker cache: **`plotter-fvs-pwa-v1.8.0`**
- Build date shown in the application: **2026-07-15**
- Delivery format: static HTTPS-hosted Progressive Web App

## Revision 1.8.0 implementation

| Requested behavior | Implementation |
|---|---|
| Make FVS Variant lines slightly thinner and dark gray | Unselected outlines use `#4b504d` at 1.25 px; the selected outline uses the same color at 1.75 px; selected fill remains unchanged |
| Show entered DBH with one decimal place | Nonblank DBH values in Trees Entered and Review Data use one-decimal display formatting; RealDBH 6 and IDBH 60 both display as 6.0 Actual DBH |
| Expand Review Data stand headings | Each stand heading includes plot count, tally-tree method and size, Break DBH, and Regen Plot size, with the three requested labels emphasized |
| Revise Stand Info sampling labels | The interface uses **Tally Trees:** and **Regen Plot:** within Sampling Design |
| Explain the Regen Plot | Hover/accessibility guidance says seedlings/saplings below Break DBH are measured in that plot |
| Require DBH for live trees | Selecting Live marks DBH/IDBH required and disables Add Tree until entered; Dead remains optional; a save guard prevents blank-DBH live records |

## Behavior details

### Map rendering

FVS Variant fills remain beneath faint gray state outlines, and Variant outlines remain above the state layer. The selected Variant fill is unchanged. Variant outlines are dark gray and slightly thinner, while map selection, point lookup, GPS suggestion, floating Alaska, and location-pin behavior are unchanged.

### DBH behavior

Tree-entry mode continues to accept RealDBH directly or IDBH as tenths. IDBH is converted to Actual DBH when the tree is saved. Trees Entered and Review Data format nonblank Actual DBH values to one decimal place; blank DBH remains blank. This formatting is presentation-only.

For live trees, a DBH/IDBH value is required before **+ Add Tree** can be used. The input receives required-state guidance and the button remains disabled while the field is blank. The `addTree()` validation guard independently enforces the same rule and does not increment the tree number on a blocked attempt. Dead-tree DBH remains optional.

### Sampling Design and Review Data

Stand Info retains the three-part Sampling Design layout: tally-tree sampling, DBH Break, and the regeneration plot. The current labels are **Tally Trees:** and **Regen Plot:**. DBH Break remains Actual DBH with one decimal place and a default of 5.0. The Regen Plot field explains that seedlings/saplings with DBH below Break DBH are measured there.

Review Data stand headings summarize:

- number of plots;
- fixed-plot denominator or variable BAF for tally trees;
- Break DBH to one decimal place; and
- Regen Plot fixed-plot denominator.

### Retained revision 1.7.0 behavior

- Location search is opt-in through the first **Search…** dropdown option and does not automatically open the mobile keyboard.
- Dmg 2 and Sev 2 remain hidden until Dmg 1 is selected.
- The seedling/sapling icon appears beside below-break tree numbers in both tree tables.
- DBH Break is entered as Actual DBH regardless of RealDBH/IDBH tree-entry mode.

## Data and export compatibility

Revision 1.8.0 continues to use schema version 5. No worksheet, CSV, or FVS field definitions were added, removed, or reordered.

- `BASAL_AREA_FACTOR` continues to receive Variable BAF or the negative absolute tree Fixed Plot denominator.
- `INV_PLOT_SIZE` continues to receive the Regen Plot fixed-plot denominator.
- `BRK_DBH` continues to receive Actual DBH Break.
- DBH table formatting, review summaries, map styling, conditional fields, and icons are presentation/validation changes and add no export fields.
- Existing saved stands, plots, trees, species lists, and saved snapshots remain compatible.

## Validation performed

The release is checked against the actual application source and the packaged files.

- JavaScript syntax checks cover `app.js`, `service-worker.js`, `storage.js`, `pwa.js`, `map-data.js`, and `fvs-xlsx.js`.
- Source-level regression checks cover map stroke/fill output, DBH formatting, Review Data summaries, current Stand Info labels, Regen Plot guidance, and live-tree DBH validation.
- A headless Chromium regression check covers the live-tree DBH requirement, RealDBH/IDBH conversion, button state, and page-level horizontal overflow; source-level checks also cover the responsive markup and styles.
- Manifest JSON, icon files, local HTML asset references, and every service-worker application-shell path are checked.
- Application footer and service-worker cache identifiers are aligned to revision 1.8.0; data schema remains 5.
- Final ZIP structure, CRC integrity, extraction, and SHA-256 are checked after packaging.

## Deployment notes

Replace all hosted application files together at the existing HTTPS URL. The new service-worker cache identifier causes the browser to install fresh application assets while preserving site-origin storage.

Make an Excel or CSV backup before deployment. Open the deployed application while online and use **Update available** when offered, or close and reopen after the new service worker installs.

## Validation boundary

Automated tests use source-level checks and headless Chromium. The package has not been physically exercised on every intended iPhone, iPad, or Android model. Complete the device acceptance checklist in `README.md` before operational rollout, especially installation, keyboard behavior, location permission, offline relaunch, share-sheet destinations, and storage retention under organizational device policies.
