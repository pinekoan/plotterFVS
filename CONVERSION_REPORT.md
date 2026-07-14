# plOtter FVS PWA conversion and revision report

## Source assessment

The Windows files did not contain the inventory logic:

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

## Revision 1.3.0 implementation

| Requested behavior | Implementation |
|---|---|
| Search species while adding a tree | Accessible combobox-style search by FVS code and common name, with pointer and keyboard selection |
| Promote likely repeat species | Per-stand usage counts across all plots; count descending and most-recently-used tie break |
| Retain custom species | Used custom codes appear in the promoted group and can be selected again |
| Put a pin on the coverage map | Recorded or manually entered valid stand coordinates are projected into the existing map SVG |
| Suggest FVS Variant from location | Point-in-polygon lookup against the embedded FVS coverage geometry; matching variant is initially selected |
| Preserve manual control | User may override the suggested variant and choose any Location for that variant; pin remains at the coordinate |
| Southern Ecoregion | Optional field replaces PV controls for `SN`; exported to stand and all plot rows; PV fields are blank |
| Restore Southern data | Import reads `ECOREGION` from the stand row with plot-row fallback |
| Preserve existing output compatibility | Crown ratio stored codes, FVS species export codes, existing column order, and non-Southern PV behavior remain unchanged |

## Automated browser validation for revision 1.3.0

The application logic and rendered controls were exercised in Chromium at both desktop and iPhone-sized viewports. This is automated browser testing, not physical-device testing.

- Confirmed Crown Ratio labels are `0-10%` through `81-100%` while stored values remain 1 through 9.
- Confirmed the Species Lists tab retains its PLANTS Code column and the tree-entry selector does not show PLANTS codes.
- Confirmed search by FVS code and common name, keyboard selection, custom species reuse, and per-stand isolation.
- Confirmed usage ordering across multiple plots: tree count descending and most-recently-used tie break.
- Confirmed a successful one-time GPS result fills coordinates, creates one pin, suggests Southern for a Memphis-area test coordinate, clears the prior variant-specific Location, and displays Ecoregion.
- Confirmed location permission denial leaves data collection available and produces a non-blocking message.
- Confirmed the geolocation request uses `enableHighAccuracy: true`, a 15-second timeout, and `maximumAge: 0`; no continuous watch is used.
- Confirmed the user can override a suggested variant and select one of that variant's Location values while the pin remains.
- Confirmed unchanged coordinates do not reapply the automatic suggestion; changed coordinates do.
- Confirmed known coordinate samples resolve to PN (Seattle), SN (Memphis and Miami), CR (Denver), LS (Duluth), AK (Anchorage), and NE (New York).
- Confirmed Southern hides PV controls, allows blank Ecoregion, clears PV values, and exports the same Ecoregion to one stand row and all of its plot rows.
- Confirmed a non-Southern stand exports blank Ecoregion and retains its PV values.
- Confirmed Southern import restores Ecoregion from a plot row when the stand row is blank.
- Confirmed the map pin, Southern field, and searchable species menu render at a 390 by 844 CSS-pixel mobile viewport.
- Confirmed no uncaught browser runtime errors were produced by the automated scenarios.

## Reference import/export regression validation

The revised application was also exercised using the supplied reference exports.

- Imported `FVS_Export_2026-07-13_095937.xlsx`.
- Reconstructed 2 stands, 2 plots, and 11 trees.
- Regenerated all three CSV tables and compared their normalized text with the supplied reference CSV files; all three matched.
- Generated and reopened an Excel workbook with `FVS_StandInit`, `FVS_PlotInit`, `FVS_TreeInit`, and `FieldMetadata`.
- Reopened row counts were 2, 2, 11, and 2 respectively.
- Confirmed state normalization no longer shares or mutates the empty-state template, preventing stale records from appearing in a later clean import.

## Static package validation

- JavaScript syntax was checked for `app.js`, `storage.js`, `pwa.js`, `fvs-xlsx.js`, and `service-worker.js`.
- The service-worker application shell was checked against files included in the package.
- The manifest and icon declarations were checked against the packaged assets.
- Runtime libraries are bundled locally; no CDN is required for data entry or export.
- The cache version and visible application version are both 1.3.0.

## Validation boundary

The revision has not been physically tested on the intended field devices. Before operational deployment, complete the device checklist in `README.md` on at least one representative iPhone/iPad and one Android device. Browser permission presentation, share-sheet destinations, storage retention, and installation presentation can vary by device and organizational policy.
