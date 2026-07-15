# plOtter FVS PWA revision and validation report

## Build identification

- Application version: **1.6.0**
- Data schema version: **5**
- Service-worker cache: **`plotter-fvs-pwa-v1.6.0`**
- Build date shown in the application: **2026-07-15**

## Source assessment

The original Windows files did not contain the inventory business logic:

- `Launch_plOtterFVS.vbs` located and opened the HTML file.
- `debug_plOtterFVS.cmd` checked for and launched the HTML file.
- `plOtterFVS.html` contained the forms, FVS lookup data, storage, location request, and export/import behavior.

The browser/PWA conversion therefore preserves the web-based workflow while replacing Windows launch assumptions, online library dependencies, and desktop-only delivery behavior.

## Revision 1.6.0 implementation

| Requested behavior | Implementation |
|---|---|
| Make state boundaries faint gray | State outlines use a thin gray stroke with reduced opacity and remain noninteractive |
| Make FVS Variant boundaries bold green and visually dominant | Variant outlines use thicker green strokes; the selected Variant uses a darker, heavier green outline |
| Draw Variant boundaries above state boundaries | Variant fills render first, state outlines second, and Variant outline-only paths last; the location pin remains above all three |
| Put Tally Trees and Seedling/Sapling on one row | Wider layouts use a two-panel grid with both sampling concepts on the same row |
| Add a separator between sampling concepts | A vertical separator appears between the two panels; below 980 CSS pixels it becomes horizontal as the panels stack |
| Move DBH and site controls to the next row | DBH Entry Mode, DBH Break, Site Species, and Site Index render in that order on the following row and wrap responsively |
| Hide Fixed Plot Radius in Variable BAF mode | The radius field uses the HTML `hidden` state and is shown only when Fixed Plot is selected; remembered method-specific values are unchanged |
| Add the FIP email address | The References note links `IA_Forestry@bia.gov` with a `mailto:` URL |

## Features retained from revision 1.5.1

| Requested behavior | Implementation |
|---|---|
| Remove the box surrounding Alaska | Alaska remains an unframed floating layer |
| Prevent Alaska's display area from covering the Lower 48 | The floating Alaska layer is rendered before the contiguous-state layer, so Lower 48 details remain visible in any overlap |
| Preserve map behavior | Alaska geometry, state outline, click selection, GPS lookup, and recorded-location pin behavior are unchanged |

## Features retained from revision 1.5.0

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

- 48 noninteractive, faint-gray state-outline paths for the Lower 48;
- one noninteractive, faint-gray state-outline path for floating Alaska;
- no state fill or labels;
- 19 dissolved FVS Variant fill paths beneath the state outlines;
- 19 bold-green FVS Variant outline paths above the state outlines;
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

## Automated validation

### Revision 1.6.0 source-level execution

The actual `app.js` and `map-data.js` files were executed together in a JavaScript VM. The test generated the real Stand Info and Export markup rather than testing a separately recreated mock.

The execution test confirmed:

- desktop markup order is Tally Trees, separator, Seedling/Sapling, then DBH Entry Mode, DBH Break, Site Species, and Site Index;
- Variable BAF markup hides Fixed Plot Radius;
- Fixed Plot markup shows the radius and calculates 1/5 acre as 52.7 feet;
- positive or negative Fixed Plot denominator `5` exports as `-5`, while Variable BAF `20` exports as `20`;
- the map painter order is Variant fills, state boundaries, then Variant outlines;
- state strokes are gray and thinner than the green Variant strokes;
- the rendered map contains 19 dissolved clickable Variant regions, 19 Variant outline paths, and 49 state outline paths;
- the floating Alaska layer has no inset clipping frame;
- Stand Info markup contains no duplicate element IDs;
- the References note contains the exact `mailto:IA_Forestry@bia.gov` link.

### Static and responsive-source checks

- `app.js`, `service-worker.js`, `storage.js`, `pwa.js`, `fvs-xlsx.js`, and `map-data.js` passed JavaScript syntax checks.
- CSS parsed without errors and contains the wider two-column sampling grid, the 980-pixel stacked breakpoint, and the horizontal separator rule.
- Manifest JSON, icon dimensions, local HTML asset references, and all service-worker application-shell paths were verified.
- Version strings are aligned to application/cache revision 1.6.0 and data schema 5.

### Retained behavior checks

The revision changes presentation, map painter order, and reference text; the data model and export/import functions are unchanged. Source-level execution also rechecked the Fixed Plot BAF conversion and radius calculation. The prior revision's save gating, Location validation/history, Site Species/Site Index mapping, Southern Ecoregion propagation, scientific names, Crown Ratio values, and unsaved-export safeguards remain in the same code paths.

## Reference import/export regression

The supplied reference workbook and CSV files were previously validated against revision 1.5.1:

- Imported `FVS_Export_2026-07-13_095937.xlsx`.
- Reconstructed **2 stands, 2 plots, and 11 trees**.
- Regenerated StandInit, PlotInit, and TreeInit CSV text matched all three supplied reference CSV files after line-ending normalization.
- Generated and reopened an Excel workbook with `FVS_StandInit`, `FVS_PlotInit`, `FVS_TreeInit`, and `FieldMetadata`.
- Reopened worksheet row counts were **2, 2, 11, and 2**.
- Imported stands received clean saved snapshots under schema version 5.

Revision 1.6.0 does not modify the export/import functions or schemas. A source-level execution test rechecked the negative Fixed Plot BAF conversion. The prior workbook round trip also covered optional Site Species/Site Index, Southern Ecoregion, and two propagated plot rows.

## Static and offline-package validation

- `app.js` and `service-worker.js` passed JavaScript syntax checks.
- `manifest.webmanifest` parsed successfully.
- Every service-worker application-shell path exists in the package.
- All manifest icon files exist and retain their declared dimensions.
- Runtime scripts and styles are local; no CDN is required for collection, storage, map display, or export.
- Application, visible footer, schema, and cache versions are aligned to 1.6.0 / schema 5.
- Final ZIP contents and CRC values are checked with ZIP integrity testing.
- A SHA-256 checksum is supplied beside the ZIP.

## Validation boundary

The package has not been physically tested on the intended iPhone, iPad, or Android field devices. A current headless-browser screenshot pass could not be completed in this container, so revision 1.6.0 was validated through JavaScript execution and static package checks instead. Before operational deployment, complete the acceptance checklist in `README.md`, particularly the responsive Stand Info layout, Safari/Chrome installation, native dropdown behavior, location permission presentation, share-sheet destinations, offline relaunch, and storage retention under the organization's device policies.
