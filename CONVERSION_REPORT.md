# plOtter FVS PWA conversion and revision report

## Source assessment

The original Windows files did not contain the inventory logic:

- `Launch_plOtterFVS.vbs` located the HTML file and opened it in the default Windows browser.
- `debug_plOtterFVS.cmd` checked that the HTML file existed and launched it.
- `plOtterFVS.html` contained the actual HTML, CSS, JavaScript, FVS lookup data, location request, local storage, and export/import logic.

The mobile conversion therefore retains the browser-based inventory workflow and replaces the Windows launch mechanism and browser-hosting assumptions.

## Original conversion mapping

| Original component | PWA replacement |
|---|---|
| `.vbs` and `.cmd` launchers | HTTPS URL and optional home-screen installation |
| Single HTML file | `index.html`, `styles.css`, and `app.js` |
| Browser `localStorage` | IndexedDB with a localStorage fallback |
| Online SheetJS CDN | Local `fvs-xlsx.js` plus bundled JSZip |
| Direct desktop downloads | Mobile share sheet where supported; download/ZIP fallback |
| Local `file://` execution | Static HTTPS hosting and service-worker cache |
| Optional one-time GPS | Secure-context `getCurrentPosition()` request; manual entry remains available |

## Revision 1.4.0 implementation

| Requested behavior | Implementation |
|---|---|
| Require Save Stand Info before additions | New stands start never-saved; saved stands become dirty after any Stand Info edit; add-plot and add-tree controls and functions require a clean saved state |
| Preserve existing data while dirty | Existing plots and trees remain visible/selectable, and Stand Info drafts persist across tabs |
| Preserve upgraded/imported workflows | Revision 1.3.0-and-earlier stands and imported stands receive clean saved snapshots during normalization/import |
| Protect exports from unsaved Stand Info | Never-saved stands block export; dirty saved stands offer Return to Stand Info or Export Last Saved Values using the saved snapshot |
| Remove TPA from Trees Entered | TPA heading, cells, and display calculation were removed from the tree list; FVS export schemas were not changed |
| Add scientific names | 795 built-in variant/species rows receive variant-specific scientific names; Species Lists adds an italic Scientific Name column between Common Name and PLANTS Code |
| Support custom scientific names | Custom-species records normalize to four fields and the form accepts an optional Scientific Name; old three-field records migrate with a blank name |
| Retain prior searchable species behavior | Search by FVS code/common name and per-stand count/recency promotion remain unchanged; the tree selector still omits scientific and PLANTS names |
| Retain GPS and map behavior | One-time location pin and initial variant suggestion remain; manual variant and Location override remains unrestricted; Reset clears coordinates and the pin without altering those manual selections |
| Retain Southern Ecoregion behavior | Optional Ecoregion replaces PV controls for `SN` and propagates to stand and plot exports |
| Preserve FVS output compatibility | Existing column names/order, species codes, crown-ratio numeric values, and reference export content remain unchanged |

## Scientific-name source integration

The supplied `FVS Variants Species Codes Index.docx` was parsed by FVS Variant plus FVS Species Code, with PLANTS Code used as a cross-check.

- All 20 variants supported by plOtterFVS were present.
- All 795 built-in variant-specific species rows matched.
- 38 generic rows (other, other hardwood, or other softwood) have no scientific name and display an em dash.
- The two ORGANON variants present in the source document are not currently supported by plOtterFVS and were not added.
- Only unmistakable spelling/capitalization errors were corrected; supplied synonyms and variant-specific taxonomy were otherwise retained.
- Verified correction examples include `Pinus virginiana`, `Liquidambar styraciflua`, `Sequoia sempervirens`, and `Quercus engelmannii`.
- Variant-specific synonyms were preserved, including `Carya tomentosa` in Central States and `Carya alba` in Northeast.

Scientific names are reference metadata only; they are not written to `FVS_StandInit`, `FVS_PlotInit`, or `FVS_TreeInit`.

## Automated browser validation for revision 1.4.0

The application logic and rendered controls were exercised in Chromium at desktop and 390 by 844 CSS-pixel mobile viewports. This is automated browser testing, not physical-device testing.

### New save-state and export behavior

- Confirmed a newly created stand shows Not saved and blocks both add-plot and add-tree operations at the UI and function levels.
- Confirmed a successfully saved stand enables both additions.
- Confirmed editing any saved Stand Info field changes the stand to Unsaved changes and re-enables additions only after another successful save.
- Confirmed existing plots and trees remain visible while the stand is dirty.
- Confirmed draft Stand Info values persist when navigating between tabs.
- Confirmed legacy state migrates to schema version 4 with a clean saved snapshot and does not block existing users.
- Confirmed never-saved export warnings contain only Return to Stand Info and Cancel, and no export plan is produced.
- Confirmed dirty-saved warnings contain Return to Stand Info and Export Last Saved Values.
- Confirmed the saved snapshot, rather than current draft BAF/notes, is used when Export Last Saved Values is selected, while the draft remains intact in current state.
- Confirmed Return to Stand Info activates the affected stand and Stand Info tab.
- Confirmed the export checklist shows stand save status.

### Species and tree-list behavior

- Confirmed the Trees Entered header and rows no longer contain TPA and the former display calculation is absent.
- Confirmed the Species Lists header order is FVS Code, Common Name, Scientific Name, PLANTS Code.
- Confirmed scientific names render inside italic elements.
- Confirmed all 795 built-in rows contain the expected scientific-name field and only the 38 generic entries are blank.
- Confirmed legacy three-field custom species migrate to a four-field row with blank scientific name.
- Confirmed a custom scientific name is stored and displayed.
- Confirmed prior search by code/common name, keyboard selection, custom reuse, per-stand isolation, usage count ordering, and recency tie breaking still pass.
- Confirmed Crown Ratio labels remain percentage ranges while stored values remain 1 through 9.

### Prior-feature regression checks

- Confirmed a successful one-time GPS result fills coordinates, creates one pin, and suggests the expected embedded variant.
- Confirmed location denial remains non-blocking and no continuous watch is used.
- Confirmed users can override a suggested variant and select one of that variant's Location values while the pin remains.
- Confirmed Reset clears both Stand Info coordinates and the map pin, leaves the selected Variant and Location unchanged, and marks a previously saved stand dirty when coordinates changed.
- Confirmed unchanged coordinates do not reapply automatic selection and changed coordinates do.
- Confirmed known coordinate samples resolve to PN (Seattle), SN (Memphis and Miami), CR (Denver), LS (Duluth), AK (Anchorage), and NE (New York).
- Confirmed Southern hides PV controls, allows blank Ecoregion, clears PV values, and exports the same Ecoregion to one stand row and all of its plot rows.
- Confirmed a non-Southern stand exports blank Ecoregion and retains PV values.
- Confirmed Southern import restores Ecoregion from a plot row when the stand row is blank.
- Confirmed no uncaught browser runtime errors occurred in the automated scenarios.

## Reference import/export regression validation

The revised application was exercised using the supplied reference exports.

- Imported `FVS_Export_2026-07-13_095937.xlsx`.
- Reconstructed 2 stands, 2 plots, and 11 trees.
- Regenerated all three CSV tables and compared normalized text with the supplied reference CSV files; all three matched.
- Generated and reopened an Excel workbook containing `FVS_StandInit`, `FVS_PlotInit`, `FVS_TreeInit`, and `FieldMetadata`.
- Reopened row counts were 2, 2, 11, and 2 respectively.
- Confirmed imported stands receive clean saved snapshots.

## Static and offline package validation

- JavaScript syntax was checked for the application and service-worker files.
- The service-worker application shell was checked against every file included in its cache list.
- Manifest and icon declarations were checked against packaged assets.
- Runtime libraries are bundled locally; no CDN is required for data entry or export.
- The schema version is 4, and the cache and visible application versions are 1.4.0.
- A static-host check returned successful responses with appropriate content types for the HTML, JavaScript, CSS, manifest, service worker, and PNG assets.
- The service-worker install, activation, old-cache cleanup, cached-asset response, and offline navigation fallback were exercised in an isolated service-worker test harness.

## Validation boundary

The revision has not been physically tested on the intended field devices. Before operational deployment, complete the device checklist in `README.md` on at least one representative iPhone/iPad and one Android device. Browser permission presentation, share-sheet destinations, storage retention, installation presentation, and organization-managed device policies can vary.
