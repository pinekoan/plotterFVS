# plOtter: Stand Exam for FVS - Browser/PWA build

## Revision 1.4.0

This folder is the mobile-compatible replacement for the Windows `.cmd` and `.vbs` launchers and the original single-file HTML application. It is a static Progressive Web App (PWA): the same codebase runs in Safari on iPhone/iPad, Chrome on Android, and current desktop browsers.

### Stand Info save requirement

- A newly created stand is marked **Not saved** until **Save Stand Info** completes successfully.
- A saved stand changes to **Unsaved changes** as soon as one of its Stand Info values is edited.
- **+ Add Plot** and **+ Add Tree** are disabled while the active stand is not saved or has unsaved Stand Info changes.
- The same rules are enforced inside the add-plot and add-tree functions, not only by disabled buttons.
- Existing plots and trees remain visible and selectable while Stand Info is unsaved.
- Draft Stand Info values are retained when the user moves between tabs.
- Stands migrated from revision 1.3.0 or earlier, and stands restored through import, are initially treated as saved so existing users are not unexpectedly blocked.

### Unsaved Stand Info export protection

- A stand that has never been saved cannot be exported. The warning offers **Return to Stand Info** or **Cancel**.
- A previously saved stand with draft changes triggers a warning offering **Return to Stand Info** or **Export Last Saved Values**.
- **Export Last Saved Values** uses the last successfully saved Stand Info snapshot while leaving the user's current draft intact in the application.
- The export checklist displays each stand's current save status.

### Tree list and species references

- The calculated TPA display has been removed from the **Trees Entered** list on the Plots & Trees tab. FVS export table schemas are unchanged.
- The Species Lists tab now displays **FVS Code**, **Common Name**, **Scientific Name**, and **PLANTS Code**.
- Scientific names are variant-specific and shown in italics.
- Generic entries such as other, other hardwood, and other softwood display an em dash in place of a scientific name.
- The custom-species form includes an optional Scientific Name field.
- Scientific names are reference information only and are not added to FVS export tables.

### Searchable tree-species entry

- The Species control on the Plots & Trees tab is searchable by FVS species code or common name.
- Species already used anywhere in the active stand appear in a **Used in this stand** group at the top of the list.
- Frequently used species are ordered by tree count. The most recently used species breaks a tie.
- Usage is calculated across all plots in the active stand and does not affect other stands.
- Custom species codes already used in the stand remain available in the frequently used group.
- The tree-entry selector shows only FVS code and common name. Scientific names and PLANTS codes remain on the Species Lists tab.
- Crown Ratio labels show percentage ranges while retaining FVS values 1 through 9 in saved and exported data.

### Coordinate pin and FVS Variant suggestion

- The Stand Info **Loc** button requests one location fix only. It does not start continuous tracking.
- A successful location reading fills Latitude and Longitude, places a pin on the FVS Variant coverage map, and suggests the variant containing that point.
- The adjacent **Reset** button clears Latitude and Longitude and removes the map pin without changing the selected Variant or Location.
- Valid coordinates entered manually receive the same pin and variant-suggestion behavior after editing is finished.
- A coordinate-derived variant is only a suggestion. The user may manually select any other FVS Variant and then any Location available for that variant.
- The recorded pin remains at the true coordinate after a manual variant or location override.
- An unchanged coordinate does not repeatedly overwrite a manual variant choice. A newly captured or edited coordinate runs the suggestion again.
- When the selected variant changes, Location is cleared because location codes are variant-specific.
- If the point is outside the embedded coverage polygons, the existing variant is left unchanged.

### Southern Variant Ecoregion

- When Southern (`SN`) is selected, Stand Info hides PV Code and PV Ref and displays an optional Ecoregion field.
- Selecting Southern clears stored PV Code and PV Ref values for that stand.
- Southern exports place the stand Ecoregion in `ECOREGION` for the `FVS_StandInit` row and every `FVS_PlotInit` row belonging to the stand.
- Southern exports leave `PV_CODE` and `PV_REF_CODE` blank.
- Other variants retain the existing PV Code and PV Ref behavior and export a blank `ECOREGION`.
- Import restores a Southern Ecoregion from `FVS_StandInit`, or from `FVS_PlotInit` when the stand row is blank.

## Core PWA behavior

- The Windows launchers are no longer required. `index.html` is the application entry point.
- Inventory data is stored in IndexedDB, with a localStorage fallback.
- Existing localStorage data is copied into IndexedDB when both versions run under the same browser origin.
- The application shell and all required libraries are cached for offline use.
- Location remains optional and uses `getCurrentPosition()` rather than continuous monitoring.
- Excel export and import are fully local and do not require a CDN or network connection.
- CSV export uses the mobile share sheet when the browser supports sharing files. When a browser cannot deliver three files together, it downloads one ZIP containing the three CSV files.
- Touch targets, form sizing, safe-area padding, searchable controls, warning dialogs, and wide data tables are adjusted for phone and tablet screens.

## Important: serve it over HTTPS

Do not distribute this version by asking users to open `index.html` as a `file://` document. PWA installation, service workers, and reliable location permission require a secure browser origin.

Upload the complete contents of this folder, preserving its directory structure, to any static HTTPS web host. The resulting address should look similar to:

```text
https://inventory.example.org/plotter/
```

The host must return the JavaScript, CSS, PNG, web-manifest, and HTML files normally. No server-side application or database is required.

For desktop development only, `localhost` is treated as secure by browsers:

```bash
cd plOtterFVS-PWA
python -m http.server 8080
```

Then open `http://localhost:8080/`. A phone connected to the computer by its LAN address is not `localhost`; use an HTTPS test site for realistic mobile installation and location testing.

## GitHub Pages deployment

1. Unzip this package.
2. Upload the contents of the `plOtterFVS-PWA` folder to the root of the GitHub repository so `index.html` is at the repository root.
3. In repository Settings, open Pages and deploy from the `main` branch and `/ (root)` folder.
4. Open the generated `https://<account>.github.io/<repository>/` address once while online.
5. Do not upload inventory exports or other field data to the public repository.

The package uses relative paths and is compatible with a GitHub Pages repository subdirectory.

## Install on a device

### Android / Chrome

1. Open the HTTPS application address in Chrome.
2. Use **Install app** when offered, or open Chrome's menu and choose **Install app** / **Add to Home screen**.
3. Launch plOtter from its home-screen icon.

### iPhone or iPad / Safari

1. Open the HTTPS application address in Safari.
2. Tap **Share**.
3. Choose **Add to Home Screen**.
4. Launch plOtter from the new home-screen icon.

Safari does not use Chrome's install prompt, so the application's Install instructions button displays these steps.

## Moving data from the current Edge file

Browser storage is isolated by browser origin. Data saved by the old local file, such as:

```text
file:///C:/some-folder/plOtterFVS.html
```

will not automatically appear at a new HTTPS address. Before switching:

1. Open the current application in Edge.
2. Export an Excel workbook or all three CSV files.
3. Open the new PWA.
4. Go to Export and use **Import Excel, CSV, or CSV ZIP**.
5. Confirm the stand, plot, and tree totals under Review Data.

The same isolation applies if the GitHub account name, repository name, custom domain, or URL path changes later.

## Upgrading from revision 1.3.0

Keep the same HTTPS application address and replace all application files together. Existing revision 1.3.0 stands are migrated as saved, with their loaded Stand Info becoming the initial saved snapshot. Existing browser records are not intentionally deleted by the upgrade.

Before deployment, make an Excel or CSV backup. After publication, open the application while online and activate the offered update, or close and reopen the installed PWA after the new service worker finishes installing.

## Offline field use

Open the hosted app at least once while online and allow the first load to finish. Installing it to the home screen is recommended. Test it in airplane mode before field deployment.

Inventory records are saved on the device after stand, plot, tree, species-list, delete, or import actions. Stand Info drafts are also retained locally, but additions remain blocked until **Save Stand Info** is completed. Data remains specific to that browser profile and site address. Clearing site data, resetting the browser, removing an installed web app, or changing the hosted URL can remove access to local records, so export backups regularly.

## Location behavior

The Stand Info location button:

- requests one coordinate reading only;
- records latitude and longitude in the visible form fields;
- reports approximate accuracy in a status message;
- places the coordinate pin on the embedded variant map;
- provides a **Reset** button that clears both coordinates and the pin while preserving the current Variant and Location selections;
- suggests the mapped FVS Variant when coverage is found;
- leaves manual variant and location selection unrestricted;
- does not call `watchPosition()` or continue tracking;
- can be denied or ignored without blocking data collection.

Location normally works only from HTTPS (or `localhost`). Manual coordinate entry always remains available.

## Export behavior

### Excel

Creates one `.xlsx` workbook containing:

- `FVS_StandInit`
- `FVS_PlotInit`
- `FVS_TreeInit`
- `FieldMetadata`

The column headers and ordering match the supplied reference workbook. Southern Ecoregion values follow the rules described above. Unsaved-Stand-Info safeguards are applied before the workbook is generated.

### CSV

Creates these files:

- `FVS_StandInit_<timestamp>.csv`
- `FVS_PlotInit_<timestamp>.csv`
- `FVS_TreeInit_<timestamp>.csv`

On a compatible phone, the files are offered through the share sheet. If multiple-file sharing is unavailable, the app downloads `FVS_CSV_Export_<timestamp>.zip`, which contains the three CSV files. The app can import that ZIP directly. Unsaved-Stand-Info safeguards are applied before the CSV data is generated.

## Pre-deployment checklist

Test on at least one representative iPhone/iPad and one Android device:

1. Create a new stand and confirm **+ Add Plot** and **+ Add Tree** are unavailable until **Save Stand Info** succeeds.
2. Save the stand, add a plot and tree, then edit Stand Info. Confirm additions are blocked while existing plot and tree records remain visible.
3. Move between tabs while Stand Info is dirty and confirm the draft values remain. Save again and confirm additions are re-enabled.
4. Attempt to export a never-saved stand and confirm export is blocked with Return/Cancel choices.
5. Edit a previously saved stand, attempt export, and verify both **Return to Stand Info** and **Export Last Saved Values**. Confirm the exported row uses the saved values and the on-screen draft remains intact.
6. Confirm the Trees Entered list does not display TPA.
7. Open Species Lists and verify the column order, italic scientific names, generic em dashes, and optional custom scientific name.
8. Add more than one plot and enter repeated species across the plots. Confirm stand-specific species promotion and search by code/common name.
9. Deny location permission and confirm all non-location data entry still works.
10. Grant location permission and confirm one coordinate pair, one map pin, and an initial variant suggestion appear.
11. Override the suggested variant and select one of its Location codes; confirm the pin remains and the manual selections persist.
12. Press **Reset** beside **Loc**; confirm both coordinate fields and the pin clear, the manual Variant and Location remain selected, and Stand Info becomes unsaved when coordinates changed.
13. Select Southern, leave Ecoregion blank, and confirm the stand can still be saved after satisfying the existing required fields.
14. Enter a Southern Ecoregion and verify it appears in the stand and every plot export row while both PV fields are blank.
15. Close and reopen the app; confirm records and drafts remain.
16. Switch to airplane mode and repeat basic data entry and local export.
17. Export Excel and CSV, open the results, and verify sheet/file names, headers, counts, saved-value handling, and Southern fields.
18. Import the export into a clean browser profile and compare counts and Ecoregion values.
19. Test an app update without clearing local site data.

## Project files

```text
index.html                 Application entry point
styles.css                 Desktop and mobile styles
app.js                     Inventory workflow, lookup data, maps, and exports
storage.js                 IndexedDB storage and migration
fvs-xlsx.js                Offline tabular XLSX reader/writer
pwa.js                     Installation/status/update behavior
service-worker.js          Offline application cache
manifest.webmanifest       Installable-app metadata
assets/icons/              PWA and iOS icons
vendor/jszip.min.js        Bundled ZIP library used for XLSX/CSV archives
licenses/JSZip-LICENSE.md  Third-party license
CONVERSION_REPORT.md       Source mapping and validation results
```

## Updating the app

Revision 1.4.0 uses cache name `plotter-fvs-pwa-v1.4.0`. Replace all repository files together rather than replacing only `app.js`.

After GitHub Pages publishes the new files, users should open the app while online. They may see **Update available** after the new service worker is installed. Selecting it activates the new application shell without intentionally deleting IndexedDB inventory data. Keeping the same HTTPS URL preserves access to the existing browser-origin storage.
