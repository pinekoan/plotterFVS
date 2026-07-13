# plOtter FVS PWA conversion report

## Source assessment

The Windows files did not contain the inventory logic:

- `Launch_plOtterFVS.vbs` located the HTML file and opened it in the default Windows browser.
- `debug_plOtterFVS.cmd` checked that the HTML file existed and launched it.
- `plOtterFVS.html` contained the actual HTML, CSS, JavaScript, FVS lookup data, location request, local storage, and export/import logic.

The mobile conversion therefore retains the browser-based inventory workflow and replaces the Windows launch mechanism and browser-hosting assumptions.

## Conversion mapping

| Original component | PWA replacement |
|---|---|
| `.vbs` and `.cmd` launchers | HTTPS URL and optional home-screen installation |
| Single HTML file | `index.html`, `styles.css`, and `app.js` |
| Browser `localStorage` | IndexedDB with a localStorage fallback |
| Online SheetJS CDN | Local `fvs-xlsx.js` plus bundled JSZip |
| Direct desktop downloads | Mobile share sheet where supported; download/ZIP fallback |
| Local `file://` execution | Static HTTPS hosting and service-worker cache |
| Optional one-time GPS | Secure-context `getCurrentPosition()` request; manual entry remains available |

## Automated validation performed

The converted application was exercised using the supplied reference exports.

- Imported `FVS_Export_2026-07-13_095937.xlsx`.
- Reconstructed 2 stands, 2 plots, and 11 trees.
- Regenerated all three CSV tables and compared their normalized text with the supplied reference CSV files; all matched.
- Generated an Excel workbook with `FVS_StandInit`, `FVS_PlotInit`, `FVS_TreeInit`, and `FieldMetadata`.
- Reopened the generated workbook using both the bundled reader and an independent spreadsheet parser.
- Confirmed sheet dimensions of `A1:BL3`, `A1:BN3`, `A1:AG12`, and `A1:D3` respectively.
- Confirmed the service-worker application shell references only files included in the package.
- Confirmed the manifest parses correctly, all icons have their declared dimensions, and no runtime CDN is required.
- Checked all project JavaScript files for syntax errors.
- Exercised the storage abstraction through a save/load round trip.

## Validation boundary

The conversion has not been physically tested on the intended field devices. Before operational deployment, complete the device checklist in `README.md` on at least one representative iPhone/iPad and one Android device. Browser permission behavior, share-sheet destinations, storage retention, and installation presentation can vary by device configuration.
