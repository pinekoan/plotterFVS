# plOtter: Stand Exam for FVS — Browser/PWA build

## Revision 1.5.0

This folder contains the mobile-compatible plOtterFVS Progressive Web App. The same static application runs in Safari on iPhone and iPad, Chrome on Android, and current desktop browsers. It does not require the original Windows `.cmd` or `.vbs` launchers.

## Changes in revision 1.5.0

### FVS Variant map

- The displayed FVS coverage geometry is dissolved by FVS Variant, so forest and Location-code boundaries inside a variant are no longer drawn.
- Thin, faint state outlines are overlaid on the Lower 48 map and Alaska inset.
- State outlines have no fill, no labels, and do not intercept map clicks.
- The original detailed FVS polygons remain embedded for latitude/longitude lookup; display simplification does not change automatic variant suggestions.
- The recorded-location pin is drawn above both map layers.
- A GPS-derived or manually entered coordinate continues to provide an initial variant suggestion only. The user may manually select any other Variant and then any valid Location.

### Tree tally and seedling/sapling sampling controls

Stand Info now separates the two sampling concepts:

1. **Tally trees measured with**
   - **Variable BAF** is the default for new stands.
   - **Fixed Plot** changes the input to **Trees Fixed Plot (1/n acre)** and shows the calculated radius.
   - The program remembers a separate value for Variable BAF and tree Fixed Plot when the user switches methods.
   - Variable BAF exports its entered value to `BASAL_AREA_FACTOR`.
   - Tree Fixed Plot exports the negative absolute denominator to `BASAL_AREA_FACTOR`: `5` or `-5` exports as `-5`.

2. **Seedling/Sapling**
   - The existing **Fixed Plot (1/n acre)** denominator remains independent.
   - It continues to export to `INV_PLOT_SIZE`.
   - Its equivalent radius remains visible.

Fixed-plot radius is calculated from:

```text
radius (ft) = sqrt(43,560 / (pi * absolute denominator))
```

For example, a 1/5-acre plot displays a radius of approximately 52.7 feet.

### Required and recently used Locations

- The empty Location option now reads **- Select / Required -**.
- **Save Stand Info** is blocked until a Location valid for the selected FVS Variant is chosen.
- The invalid field receives focus and a clear message is displayed.
- Locations saved for other stands in the current inventory appear under **Recently used** at the top of the list.
- Recently used entries are filtered to the active Variant, deduplicated, and ordered most-recently saved first.
- The complete valid Location list remains available below the recent group.
- Changing Variant clears an incompatible Location.
- Previously imported or upgraded stands without a Location remain viewable; after their Stand Info is edited, a valid Location is required before they can be saved again.

### Site Species and Site Index

Two optional fields appear above Notes on Stand Info:

- **Site Species** uses the selected FVS Variant's species list and exports the selected FVS species code to `SITE_SPECIES` in `FVS_StandInit`.
- **Site Index** accepts an integer and exports to `SITE_INDEX` in `FVS_StandInit`.
- These values do not copy to `FVS_PlotInit`.
- Blank values remain blank in export.
- Import restores both fields from compatible StandInit data.
- Changing the FVS Variant clears an incompatible Site Species.

### Keyboard-free species selection by default

Both the New Tree **Species** control and Stand Info **Site Species** control use a standard dropdown by default. Opening the dropdown does not summon the mobile keyboard.

- **Search…** is the first actionable option.
- Selecting **Search…** opens the searchable picker.
- The keyboard appears only after the user taps the search field.
- Search matches FVS species code or common name.
- Species used in the current stand remain grouped at the top and ranked by count, then recency.
- Canceling search preserves the prior selection.
- Site Species selection does not affect tree-use rankings.

### Export references

A separate **References** section at the bottom of Export includes links to FVS Resources, FVS User and Variant Guides, and FVS Technical Support, along with the requested BIA/FIP disclaimer. These external links require an internet connection; data collection and export remain offline-capable.

## Features retained from revision 1.4.0

### Stand Info save requirement

- A new stand is marked **Not saved** until **Save Stand Info** succeeds.
- Editing a saved stand changes its status to **Unsaved changes**.
- **+ Add Plot** and **+ Add Tree** are disabled and functionally blocked until Stand Info is saved again.
- Existing plots and trees remain visible while the stand is unsaved.
- Stand Info drafts persist when changing tabs.

### Unsaved Stand Info export protection

- A never-saved selected stand blocks export and offers **Return to Stand Info** or **Cancel**.
- A previously saved stand with draft changes offers **Return to Stand Info** or **Export Last Saved Values**.
- Exporting last saved values uses the saved Stand Info snapshot while retaining the current draft in the application.

### Location controls

- **Loc** requests one location reading with `getCurrentPosition()`; it does not monitor continuously.
- Coordinates are optional even though Variant and Location are required to save.
- A successful reading fills Latitude and Longitude, draws a pin, and suggests the mapped FVS Variant.
- **Reset** clears Latitude, Longitude, and the pin without changing the selected Variant or Location.
- Valid manually entered coordinates receive the same pin and suggestion behavior.
- A manual Variant or Location choice is never rejected because of the pin.

### Southern Variant Ecoregion

- Southern (`SN`) hides PV Code and PV Ref and displays optional **Ecoregion**.
- Southern exports Ecoregion to the stand row and every plot row.
- Southern `PV_CODE` and `PV_REF_CODE` values export blank.
- Other variants retain PV Code/PV Ref and export blank Ecoregion.

### Species and tree display

- Crown Ratio displays percentage ranges while retaining FVS values 1 through 9.
- Tree Species displays FVS code and common name without the PLANTS code.
- The Species Lists tab displays FVS Code, Common Name, italic Scientific Name, and PLANTS Code.
- Custom species can include an optional Scientific Name.
- The Trees Entered list does not display TPA; FVS export schemas are unchanged.

## Core PWA behavior

- `index.html` is the application entry point.
- Inventory data is stored in IndexedDB, with a localStorage fallback.
- The application shell, map data, species data, spreadsheet code, and ZIP library are bundled for offline use.
- Excel export/import does not use an online CDN.
- CSV export uses the mobile share sheet where supported. If a browser cannot deliver three CSV files together, the files are placed in one ZIP archive.
- Excel export creates `FVS_StandInit`, `FVS_PlotInit`, `FVS_TreeInit`, and `FieldMetadata` worksheets.

## Serve it over HTTPS

Do not ask users to open `index.html` directly as a `file://` document. Reliable PWA installation, service workers, durable browser storage, and location permission require a secure browser origin.

Upload the complete contents of this folder, preserving its directory structure, to a static HTTPS host. No server-side language or database is required.

A resulting address might be:

```text
https://inventory.example.org/plotter/
```

For development on the same computer, browsers treat `localhost` as secure:

```bash
cd plOtterFVS-PWA
python -m http.server 8080
```

Then open `http://localhost:8080/`. A phone using the computer's LAN address is not `localhost`; use an HTTPS test deployment for realistic mobile testing.

## GitHub Pages deployment

1. Unzip the package.
2. Upload the **contents** of the enclosed `plOtterFVS-PWA` folder to the repository root so `index.html` is at the root.
3. In repository **Settings → Pages**, deploy from the `main` branch and `/ (root)`.
4. Open the generated `https://<account>.github.io/<repository>/` address once while online.
5. Do not upload inventory exports or field data to a public repository.

The application uses relative paths and works from a GitHub Pages repository subdirectory.

## Install on a device

### Android / Chrome

1. Open the HTTPS application address in Chrome.
2. Use **Install app** when offered, or choose **Install app / Add to Home screen** from Chrome's menu.
3. Launch plOtter from its home-screen icon.

### iPhone or iPad / Safari

1. Open the HTTPS application address in Safari.
2. Tap **Share**.
3. Choose **Add to Home Screen**.
4. Launch plOtter from the new icon.

Open the application at least once while online before testing it in airplane mode.

## Upgrading from revision 1.4.0

Keep the same HTTPS URL and replace all application files together. Revision 1.4.0 data migrates to schema version 5:

- positive legacy `BASAL_AREA_FACTOR` values become **Variable BAF**;
- negative imported values become tree **Fixed Plot** denominators;
- existing stands retain their prior saved/unsaved status and saved snapshots;
- missing recent-Location history is seeded from saved stand records;
- Site Species and Site Index default blank when absent.

Make an Excel or CSV backup before publishing the update. After deployment, open the application while online and select **Update available** when offered, or close and reopen it after the new service worker installs.

The service-worker cache name is:

```text
plotter-fvs-pwa-v1.5.0
```

## Moving data from the original Edge file

Browser storage is isolated by site address. Data saved under an old local address such as:

```text
file:///C:/some-folder/plOtterFVS.html
```

will not automatically appear at a new HTTPS address.

1. Export Excel or all three CSV files from the old application.
2. Open the new PWA.
3. Go to **Export** and choose **Import Excel, CSV, or CSV ZIP**.
4. Confirm stand, plot, and tree totals under **Review Data**.

Changing the GitHub account, repository name, custom domain, or URL path later also creates a different browser-storage origin.

## Data safety

GitHub or another static host serves only the application files. Inventory records remain in the browser storage of each device unless the user exports or shares them.

Export a backup regularly, preferably after every field session. Data can become inaccessible if the user clears site data, removes the installed web app, resets the browser/device, or changes to a different application URL.

## Device acceptance checklist

Before operational use, test on representative iPhone/iPad and Android devices:

1. Create a stand and confirm Location is required.
2. Switch between Variable BAF and Fixed Plot and verify both remembered values.
3. Verify the 1/n-acre radius display.
4. Save Stand Info, add plots and trees, and confirm save-gating behavior.
5. Open Species normally without a keyboard, then use **Search…** deliberately.
6. Test Site Species and integer Site Index.
7. Allow and deny the one-time location request.
8. Confirm map pin, automatic suggestion, manual Variant/Location override, state overlay, and Reset.
9. Close and reopen the app and verify records remain.
10. Export Excel and CSV, then re-import the files.
11. Open once online, enter airplane mode, relaunch, collect data, and export.
12. Publish an update and confirm the service-worker update prompt works.

## Package contents

```text
plOtterFVS-PWA/
├── index.html
├── styles.css
├── app.js
├── storage.js
├── pwa.js
├── fvs-xlsx.js
├── manifest.webmanifest
├── service-worker.js
├── assets/icons/
├── vendor/jszip.min.js
├── licenses/JSZip-LICENSE.md
├── README.md
└── CONVERSION_REPORT.md
```
