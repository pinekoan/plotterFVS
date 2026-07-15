# plOtter: Stand Exam for FVS — Browser/PWA build

## Revision 1.8.0

This folder contains the mobile-compatible plOtterFVS Progressive Web App. The same static application runs in Safari on iPhone and iPad, Chrome on Android, and current desktop browsers. It does not require the original Windows `.cmd` or `.vbs` launchers.

## Changes in revision 1.8.0

### FVS Variant map boundaries

- FVS Variant boundaries are dark gray (`#4b504d`) and slightly thinner: 1.25 px normally and 1.75 px for the selected Variant.
- The selected Variant fill color is unchanged.
- Faint state outlines, map selection, coordinate lookup, the recorded-location pin, and the floating Alaska composition are unchanged.

### Tree DBH entry and display

- Selecting **Live** for tree Status makes DBH/IDBH required and disables **+ Add Tree** until a value is entered.
- Selecting **Dead** keeps DBH optional.
- A defensive validation check also prevents a blank-DBH live tree from being saved or consuming a tree number.
- In **Trees Entered** and **Review Data**, nonblank Actual DBH values display with exactly one decimal place. RealDBH entry `6` displays as `6.0`; IDBH entry `60` is converted to Actual DBH and also displays as `6.0`.
- Display formatting does not change stored values or the FVS export schemas.

### Sampling labels and Review Data context

- Stand Info uses **Tally Trees:** and **Regen Plot:** within the **Sampling Design** section.
- The Regen Plot fixed-plot field includes the guidance: **Seedlings/Saplings with DBH less than Break DBH are measured in this plot**.
- Each stand heading in **Review Data** now includes the plot count, tally-tree method and size, Break DBH, and Regen Plot size.
- The labels **Tally Trees:**, **Break DBH:**, and **Regen Plot:** are emphasized in the Review Data heading.

### Compatibility

Revision 1.8.0 retains data schema version 5 and does not change the FVS export workbook or CSV schemas.

## Features retained from revision 1.7.0

- Stand Info groups tally-tree sampling, DBH Break, and the regeneration plot under **Sampling Design**, with separators and a responsive stacked layout on narrow screens.
- DBH Break is always entered as **Actual DBH (RealDBH)**, even when IDBH is selected, and displays with one decimal place; the default is **5.0**.
- **Search…** remains the first Location option without becoming the default, so opening the Location list does not automatically summon the mobile keyboard.
- **Dmg 2** and **Sev 2** remain hidden until **Dmg 1** is selected; clearing Dmg 1 clears the hidden secondary values.
- A seedling icon appears next to the tree number in **Trees Entered** and **Review Data** when tree DBH is strictly below the stand's DBH Break.

## Features retained from revision 1.6.0

- US state boundaries remain thin, faint gray lines beneath the FVS Variant outlines.
- Variant fills render first, state outlines second, and Variant outlines last; the recorded-location pin remains above all map layers.
- Tree Fixed Plot Radius remains visible only when **Fixed Plot** is selected, while method-specific values are remembered.
- The References note retains the direct [IA_Forestry@bia.gov](mailto:IA_Forestry@bia.gov) contact link.

## Features retained from revision 1.5.1

### Floating Alaska map layer

- Alaska renders as an unframed, floating map layer in the lower-left map area.
- The Alaska layer is drawn before the Lower 48, preventing it from obscuring contiguous-state details where the two display areas overlap.
- Alaska's variant geometry, faint state outline, click behavior, coordinate pin placement, and GPS-based variant lookup are unchanged.

## Features retained from revision 1.5.0

### FVS Variant map

- The displayed FVS coverage geometry is dissolved by FVS Variant, so forest and Location-code boundaries inside a variant are no longer drawn.
- Thin, faint state outlines are overlaid on the Lower 48 map and floating Alaska layer.
- State outlines have no fill, no labels, and do not intercept map clicks.
- The original detailed FVS polygons remain embedded for latitude/longitude lookup; display simplification does not change automatic variant suggestions.
- The recorded-location pin is drawn above both map layers.
- A GPS-derived or manually entered coordinate continues to provide an initial variant suggestion only. The user may manually select any other Variant and then any valid Location.

### Tree tally and seedling/sapling sampling controls

Stand Info now separates the two sampling concepts:

1. **Tally Trees:**
   - **Variable BAF** is the default for new stands.
   - **Fixed Plot** changes the input to **Trees Fixed Plot (1/n acre)** and shows the calculated radius.
   - The program remembers a separate value for Variable BAF and tree Fixed Plot when the user switches methods.
   - Variable BAF exports its entered value to `BASAL_AREA_FACTOR`.
   - Tree Fixed Plot exports the negative absolute denominator to `BASAL_AREA_FACTOR`: `5` or `-5` exports as `-5`.

2. **Regen Plot:**
   - The existing **Fixed Plot (1/n acre)** denominator remains independent.
   - It continues to export to `INV_PLOT_SIZE`.
   - Its equivalent radius remains visible.

Fixed-plot radius is calculated from:

```text
radius (ft) = sqrt(43,560 / (pi * absolute denominator))
```

For example, a 1/5-acre plot displays a radius of approximately 52.7 feet.

### Required and recently used Locations

- The empty Location option reads **- Select / Required -**.
- **Search…** is the first option. Selecting it opens a searchable picker without making search the dropdown default.
- Opening the native Location dropdown alone does not summon the mobile keyboard.
- Canceling Location search preserves the prior Location selection.
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

A separate **References** section at the bottom of Export includes links to FVS Resources, FVS User and Variant Guides, and FVS Technical Support, along with the requested BIA/FIP disclaimer and a mail link to `IA_Forestry@bia.gov`. The web links require an internet connection and the email link requires a configured mail application; data collection and export remain offline-capable.

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

## Upgrading from revisions 1.4.0 through 1.7.0

Keep the same HTTPS URL and replace all application files together. Revision 1.8.0 continues to use schema version 5. Data from revisions 1.5.0 through 1.7.0 remains compatible; revision 1.4.0 data migrates as follows:

- positive legacy `BASAL_AREA_FACTOR` values become **Variable BAF**;
- negative imported values become tree **Fixed Plot** denominators;
- existing stands retain their prior saved/unsaved status and saved snapshots;
- missing recent-Location history is seeded from saved stand records;
- Site Species and Site Index default blank when absent.

Make an Excel or CSV backup before publishing the update. After deployment, open the application while online and select **Update available** when offered, or close and reopen it after the new service worker installs.

The service-worker cache name is:

```text
plotter-fvs-pwa-v1.8.0
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
2. Open Location normally and confirm the keyboard stays closed; then choose **Search…**, filter the list, select a result, and test Cancel.
3. Confirm the **Sampling Design** heading, labels, three-section order, separators, and stacked mobile layout.
4. Switch between RealDBH and IDBH and confirm DBH Break remains Actual DBH, defaults to **5.0**, and formats entries to one decimal place.
5. Switch between Variable BAF and Fixed Plot, verify both remembered values, and confirm Fixed Plot Radius is hidden in Variable BAF mode.
6. Verify the Regen Plot 1/n-acre radius display and its DBH Break guidance.
7. Save Stand Info, add plots and trees, and confirm save-gating behavior.
8. Confirm Dmg 2 and Sev 2 remain hidden until Dmg 1 is selected and clear when Dmg 1 is removed.
9. Select Live and confirm **+ Add Tree** stays disabled until DBH/IDBH is entered; confirm Dead still permits blank DBH.
10. Enter RealDBH `6` and IDBH `60` and confirm both display as `6.0` in Trees Entered and Review Data.
11. Confirm each Review Data stand heading shows Tally Trees, Break DBH, and Regen Plot details.
12. Enter trees below, equal to, and above DBH Break; confirm only below-break records show the seedling icon in Trees Entered and Review Data.
13. Open Species normally without a keyboard, then use **Search…** deliberately.
14. Test Site Species, integer Site Index, and one-time location permission allow/deny behavior.
15. Confirm map pin, automatic suggestion, manual Variant/Location override, faint gray state lines, thin dark-gray FVS Variant boundaries, unchanged selected fill, and Reset.
16. Close and reopen the app and verify records remain.
17. Export Excel and CSV, then re-import the files.
18. Open once online, enter airplane mode, relaunch, collect data, and export.
19. Publish an update and confirm the service-worker update prompt works.

## Package contents

```text
plOtterFVS-PWA/
├── index.html
├── styles.css
├── app.js
├── storage.js
├── pwa.js
├── fvs-xlsx.js
├── map-data.js
├── manifest.webmanifest
├── service-worker.js
├── assets/icons/
├── vendor/jszip.min.js
├── licenses/JSZip-LICENSE.md
├── README.md
└── CONVERSION_REPORT.md
```
