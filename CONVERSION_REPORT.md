# plOtter FVS PWA revision and validation report

## Build identification

- Application version: **1.5.0**
- Data schema version: **5**
- Service-worker cache: **`plotter-fvs-pwa-v1.5.0`**
- Build date shown in the application: **2026-07-15**

## Source assessment

The original Windows files did not contain the inventory business logic:

- `Launch_plOtterFVS.vbs` located and opened the HTML file.
- `debug_plOtterFVS.cmd` checked for and launched the HTML file.
- `plOtterFVS.html` contained the forms, FVS lookup data, storage, location request, and export/import behavior.

The browser/PWA conversion therefore preserves the web-based workflow while replacing Windows launch assumptions, online library dependencies, and desktop-only delivery behavior.

## Revision 1.5.0 implementation

| Requested behavior | Implementation |
|---|---|
| Dissolve map boundaries within each FVS Variant | The 255 detailed source features remain available for coordinate lookup; displayed geometry is pre-dissolved into one GeoJSON feature per variant represented in the source map |
| Overlay faint state boundaries | User-supplied state GeoJSON was validated, projected, simplified, embedded, and rendered as noninteractive, unfilled outlines above variant fills |
| Preserve manual map choices | Coordinate lookup remains a suggestion; any Variant and then any valid Location can be selected manually, while the pin remains at the recorded coordinate |
| Add Reset beside Loc | Reset clears Latitude, Longitude, and pin without changing Variant or Location |
| Separate tree and seedling sampling | Stand Info now has a tree-tally section and a visibly divided Seedling/Sapling section |
| Add Variable BAF / Fixed Plot choice | A two-option control defaults to Variable BAF and changes the active field label and radius display |
| Remember method-specific entries | Each stand stores separate `variable_baf` and `tree_fixed_denom` values and restores the appropriate value on method changes |
| Encode tree Fixed Plot in FVS output | Fixed Plot exports `-abs(denominator)` to `BASAL_AREA_FACTOR`; Variable BAF exports its normal value |
| Retain seedling plot export | Seedling/Sapling denominator remains independent and exports to `INV_PLOT_SIZE` |
| Require Location | Save Stand Info validates a nonblank Location, focuses the field on failure, and leaves the stand unsaved |
| Put recent Locations first | Saved Location values are tracked by Variant, deduplicated, filtered to valid current-Variant codes, and shown most-recent first |
| Add Site Species | Optional native species dropdown exports the FVS code to StandInit `SITE_SPECIES`; import restores it |
| Add Site Index | Optional integer field exports to StandInit `SITE_INDEX`; import restores it |
| Avoid automatic mobile keyboard | Tree Species and Site Species are native dropdowns by default; selecting Search opens a separate picker without focusing its text field |
| Preserve species ranking | Used-in-stand species remain grouped and ordered by count, with recency as tie-breaker; Site Species selection does not alter counts |
| Add Export references | Three requested USDA/FVS links and the BIA/FIP disclaimer are included in a separate References card |

## Map processing

### FVS geometry

The detailed embedded map contains **255** FVS location/forest features. Build-time geometry processing grouped features by `FVSVariant` and applied a geometric union, removing boundaries shared by polygons of the same variant.

The display layer contains **19** dissolved variant features. The original source map does not contain geometry tagged `KT`, so Kootenai/Kaniksu/Tally Lake remains selectable from the Variant and Location controls but has no separate rendered coverage polygon. No geometry was invented for the missing source feature.

The detailed 255-feature layer remains the source for point-in-polygon detection. Known coordinate results remained unchanged:

| Coordinate sample | Detected variant |
|---|---|
| Seattle | PN |
| Memphis | SN |
| Denver | CR |
| Duluth | LS |
| Anchorage | AK |
| Miami | SN |
| New York City | NE |

### State geometry

`USstates.json` was validated as GeoJSON containing the 48 contiguous states plus Alaska. It contains valid Polygon/MultiPolygon geometries in geographic longitude/latitude coordinates. Hawaii and the District of Columbia are not present in the supplied data and are outside or immaterial to the current map composition.

The state data was simplified at build time and embedded in projected coordinates. Rendering produces:

- one combined noninteractive state-outline path for the Lower 48;
- one combined noninteractive state-outline path for the Alaska inset;
- no state fill or labels;
- the recorded-location pin above all map layers.

## Data-model migration

Schema version 5 normalizes earlier stand records as follows:

- A legacy positive `baf` becomes `tally_method: "variable"` and `variable_baf`.
- A legacy or imported negative `BASAL_AREA_FACTOR` becomes `tally_method: "fixed"` and `tree_fixed_denom`.
- Existing saved snapshots are normalized using the same rule, preserving correct last-saved export behavior.
- `site_species` and `site_index` default to blank when absent.
- `recentLocations` defaults to an empty object and is seeded from clean saved stand snapshots.
- Existing plots, trees, species lists, scientific names, Southern Ecoregion values, and save-state flags remain intact.

## FVS export behavior

### `FVS_StandInit`

- `BASAL_AREA_FACTOR` receives Variable BAF or negative tree Fixed Plot denominator.
- `INV_PLOT_SIZE` continues to receive the Seedling/Sapling fixed-plot denominator.
- `SITE_SPECIES` receives the selected FVS species code.
- `SITE_INDEX` receives the optional integer value.
- Southern Ecoregion and blank PV fields retain revision 1.4 behavior.

### `FVS_PlotInit`

- `BASAL_AREA_FACTOR` and `INV_PLOT_SIZE` follow the parent stand.
- Southern Ecoregion continues to propagate to every plot row.
- `SITE_SPECIES` and `SITE_INDEX` remain blank, as requested.

### `FVS_TreeInit`

- Schema, species-code mapping, Crown Ratio values, and tree data mapping are unchanged.
- TPA remains absent from the on-screen tree list and is not an added TreeInit field.

## Automated browser validation

Chromium tests were run at desktop and 390 × 844 CSS-pixel mobile viewports. This is automated browser testing, not physical-device testing.

### Revision 1.5 controls

- Confirmed Location placeholder text and required-save validation.
- Confirmed recent Location grouping, Variant filtering, deduplication, and order.
- Confirmed Variable BAF / Fixed Plot switching retains independent values.
- Confirmed entering `5` or `-5` as a tree Fixed Plot exports `-5`.
- Confirmed 1/5 acre displays a 52.7-foot radius.
- Confirmed Seedling/Sapling denominator remains independent and exports to `INV_PLOT_SIZE`.
- Confirmed Site Species uses the active Variant list and exports its FVS code only to StandInit.
- Confirmed Site Index rejects noninteger entries when supplied and is optional when blank.
- Confirmed both species controls begin as native dropdowns, place Search near the top, and do not focus the search field automatically.
- Confirmed tree-species count/recency ranking across plots and per-stand isolation.
- Confirmed the displayed map has 19 clickable dissolved variant paths rather than 255 detailed feature paths.
- Confirmed state outlines render as noninteractive overlays and map clicks remain available.
- Confirmed map pin, automatic suggestion, unchanged-coordinate behavior, manual Variant/Location override, and Reset.
- Confirmed References contains all three requested links with separate-window and `noopener noreferrer` handling.
- Confirmed no duplicate element IDs or uncaught runtime errors in representative views.

### Prior-feature regression checks

- Save Stand Info gating continues to block plot/tree additions while never-saved or dirty.
- Existing plots and trees remain visible while dirty.
- Never-saved export is blocked.
- Dirty saved export can use the last saved snapshot without discarding the current draft.
- Southern hides PV fields, accepts optional Ecoregion, and propagates it to all stand/plot rows.
- Crown Ratio labels retain underlying numeric FVS values.
- Scientific names and PLANTS codes remain available on the Species Lists tab.
- The Trees Entered list remains free of the TPA column.

## Reference import/export regression

The supplied reference workbook and CSV files were re-tested against revision 1.5.0:

- Imported `FVS_Export_2026-07-13_095937.xlsx`.
- Reconstructed **2 stands, 2 plots, and 11 trees**.
- Regenerated StandInit, PlotInit, and TreeInit CSV text matched all three supplied reference CSV files after line-ending normalization.
- Generated and reopened an Excel workbook with `FVS_StandInit`, `FVS_PlotInit`, `FVS_TreeInit`, and `FieldMetadata`.
- Reopened worksheet row counts were **2, 2, 11, and 2**.
- Imported stands received clean saved snapshots under schema version 5.

A separate workbook round trip verified negative Fixed Plot BAF, optional Site Species/Site Index, Southern Ecoregion, and two propagated plot rows.

## Static and offline-package validation

- `app.js` and `service-worker.js` passed JavaScript syntax checks.
- `manifest.webmanifest` parsed successfully.
- Every service-worker application-shell path exists in the package.
- All manifest icon files exist and retain their declared dimensions.
- Runtime scripts and styles are local; no CDN is required for collection, storage, map display, or export.
- Application, visible footer, schema, and cache versions are aligned to 1.5.0 / schema 5.
- Final ZIP contents and CRC values are checked with ZIP integrity testing.
- A SHA-256 checksum is supplied beside the ZIP.

## Validation boundary

The package has not been physically tested on the intended iPhone, iPad, or Android field devices. Before operational deployment, complete the acceptance checklist in `README.md`, particularly Safari/Chrome installation, native dropdown behavior, location permission presentation, share-sheet destinations, offline relaunch, and storage retention under the organization's device policies.
