# plOtter: Stand Exam for FVS — Browser/PWA build

This folder is the mobile-compatible replacement for the Windows `.cmd` / `.vbs` launchers and the original single-file HTML application. It is a static Progressive Web App (PWA): the same code runs in Safari on iPhone/iPad, Chrome on Android, and current desktop browsers.

## What changed

- The Windows launchers are no longer required. `index.html` is the application entry point.
- Inventory data is stored in IndexedDB, with a localStorage fallback.
- Existing localStorage data is copied into IndexedDB when both versions run under the same browser origin.
- The application shell and all required libraries are cached for offline use.
- The location button requests one location fix with `getCurrentPosition()`; it never starts continuous tracking. Location remains optional.
- Excel export and import are fully local and do not require a CDN or network connection.
- CSV export uses the mobile share sheet when the browser supports sharing files. When a browser cannot deliver three files together, it downloads one ZIP containing the three CSV files.
- Touch targets, form sizing, safe-area padding, and horizontally wide tables were adjusted for phone and tablet screens.

## Important: serve it over HTTPS

Do not distribute this version by asking users to open `index.html` as a `file://` document. PWA installation, service workers, and reliable location permission require a secure browser origin.

Upload the complete contents of this folder, preserving its directory structure, to any static HTTPS web host. The resulting address should look similar to:

```text
https://inventory.example.org/plotter/
```

The host must return the JavaScript, CSS, PNG, JSON/web-manifest, and HTML files normally. No server-side application or database is required.

For desktop development only, `localhost` is treated as secure by browsers:

```bash
cd plOtterFVS-PWA
python -m http.server 8080
```

Then open `http://localhost:8080/`. A phone connected to the computer by its LAN address is not `localhost`; use an HTTPS test site for realistic mobile installation and location testing.

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

Safari does not use Chrome's install prompt, so the application's **Install instructions** button displays these steps.

## Moving data from the current Edge file

Browser storage is isolated by browser origin. Data saved by the old local file, such as:

```text
file:///C:/some-folder/plOtterFVS.html
```

will not automatically appear at a new HTTPS address. Before switching:

1. Open the current application in Edge.
2. Export an Excel workbook or all three CSV files.
3. Open the new PWA.
4. Go to **Export** and use **Import Excel, CSV, or CSV ZIP**.
5. Confirm the stand, plot, and tree totals under **Review Data**.

## Offline field use

Open the hosted app at least once while online and allow the first load to finish. Installing it to the home screen is recommended. Test it in airplane mode before field deployment.

Inventory records are saved on the device after each stand, plot, tree, species-list, delete, or import action. Data remains specific to that browser profile and site address. Clearing site data, resetting the browser, or removing an installed web app can remove local records, so export backups regularly.

## Location behavior

The location button:

- requests one coordinate reading only;
- records latitude and longitude in the visible form fields;
- reports the approximate accuracy in a status message;
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

The column headers and ordering match the supplied reference workbook.

### CSV

Creates these files:

- `FVS_StandInit_<timestamp>.csv`
- `FVS_PlotInit_<timestamp>.csv`
- `FVS_TreeInit_<timestamp>.csv`

On a compatible phone, the files are offered through the share sheet. If multiple-file sharing is unavailable, the app downloads `FVS_CSV_Export_<timestamp>.zip`, which contains the three CSV files. The app can import that ZIP directly.

## Pre-deployment checklist

Test on at least one representative iPhone/iPad and one Android device:

1. Create and save a stand.
2. Add a plot and several live/dead trees.
3. Close and reopen the app; confirm the records remain.
4. Deny location permission and confirm data entry still works.
5. Grant location permission and confirm one coordinate pair is populated.
6. Switch to airplane mode and repeat basic data entry.
7. Export Excel and CSV; open the results and verify sheet/file names and headers.
8. Import the export into a clean browser profile and compare counts.
9. Test an app update without clearing local site data.

## Project files

```text
index.html                 Application entry point
styles.css                 Desktop and mobile styles
app.js                     Inventory workflow, schemas, maps, and exports
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

When changing cached files, update `CACHE_VERSION` in `service-worker.js`. Users will see **Update available** after the new service worker is installed. Selecting it activates the new application shell without intentionally deleting IndexedDB inventory data.
