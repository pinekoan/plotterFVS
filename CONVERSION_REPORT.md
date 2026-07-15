# plOtter FVS PWA revision and validation report

## Build identification

- Application version: **1.7.0**
- Data schema version: **5**
- Service-worker cache: **`plotter-fvs-pwa-v1.7.0`**
- Build date shown in the application: **2026-07-15**
- Delivery format: static HTTPS-hosted Progressive Web App

## Revision 1.7.0 implementation

| Requested behavior | Implementation |
|---|---|
| Add a Sampling Design heading | Stand Info groups tally-tree sampling, DBH Break, and the nested seedling/sapling plot in one responsive Sampling Design section |
| Revise sampling labels | The interface uses **Measure tally trees using:** and **Nested seedling/sapling plot:** |
| Put DBH Break between the two sampling sections | The wider layout uses tally tree → separator → DBH Break → separator → nested seedling/sapling; narrow layouts stack with horizontal separators |
| Add opt-in Location search | **Search…** is the first dropdown option; it opens a separate searchable picker only when selected, so opening the dropdown does not automatically summon a mobile keyboard |
| Use thinner black FVS Variant boundaries | Unselected outlines use black at 1.5 px; the selected outline uses black at 2 px; selected fill remains unchanged |
| Hide secondary damage fields until needed | Dmg 2 and Sev 2 begin hidden, appear after Dmg 1 is selected, and are cleared if Dmg 1 is removed |
| Identify seedling/sapling records | A seedling icon is shown beside the tree number in Trees Entered and Review Data when DBH is strictly below the stand's DBH Break |
| Treat DBH Break as Actual DBH | Visible help, accessibility text, and hover text state that DBH Break is Actual DBH even when IDBH entry is selected |
| Show one decimal place for DBH Break | New, loaded, imported, edited, and saved values normalize to one decimal; missing or invalid values default to 5.0 |

## Behavior details

### Sampling Design and DBH Break

DBH Break is independent of the RealDBH/IDBH tree-entry mode. It is stored and displayed as Actual DBH with one decimal place. The classification rule for the seedling/sapling icon is:

```text
tree DBH < stand DBH Break
```

Equality does not receive the icon. The existing Variable BAF, tree Fixed Plot, nested fixed-plot denominator, and calculated-radius export mappings are unchanged.

### Location search

The native Location dropdown remains the default interaction. **Search…** is a deliberate first option rather than the selected default. The searchable dialog matches Location code or name, retains recently used grouping, and preserves the prior selection when canceled.

### Damage fields

Secondary damage fields do not consume layout space until a primary damage is selected. Clearing Dmg 1 also clears Dmg 2 and Sev 2, preventing invisible secondary values from being written to a new tree record.

### Map rendering

FVS Variant fills remain beneath faint gray state outlines, and Variant outlines remain above the state layer. The selected Variant fill is unchanged. Variant outlines are now black and thinner, while map selection, point lookup, GPS suggestion, floating Alaska, and location-pin behavior are unchanged.

## Data and export compatibility

Revision 1.7.0 continues to use schema version 5. No worksheet, CSV, or FVS field definitions were added, removed, or reordered.

- `BASAL_AREA_FACTOR` continues to receive Variable BAF or the negative absolute tree Fixed Plot denominator.
- `INV_PLOT_SIZE` continues to receive the nested seedling/sapling fixed-plot denominator.
- `BRK_DBH` continues to receive DBH Break; revision 1.7.0 normalizes its representation to one decimal place.
- Tree damage fields retain their existing export columns; the interface only prevents unsupported hidden secondary values from being saved without Dmg 1.
- The seedling icon is presentation-only and does not add an export field.
- Existing saved stands, plots, trees, species lists, and saved snapshots remain compatible.

## Validation performed

The release was checked using the actual application source and a locally served browser build.

- JavaScript syntax checks cover `app.js`, `service-worker.js`, `storage.js`, `pwa.js`, `map-data.js`, and `fvs-xlsx.js`.
- Source-level regression checks cover Sampling Design markup, Location search behavior, map stroke/fill output, damage-field state, seedling classification at below/equal/above thresholds, and DBH Break formatting/import normalization.
- Headless Chromium checks cover the mobile Sampling Design layout, Actual-DBH guidance, one-decimal formatting, map output, damage-field reveal/clear behavior, and seedling icons in both tree lists.
- Manifest JSON, icon files, local HTML asset references, and every service-worker application-shell path are checked.
- Application footer and service-worker cache identifiers are aligned to revision 1.7.0; data schema remains 5.
- Final ZIP integrity and SHA-256 are checked after packaging.

## Deployment notes

Replace all hosted application files together at the existing HTTPS URL. The new service-worker cache identifier causes the browser to install fresh application assets while preserving site-origin storage.

Make an Excel or CSV backup before deployment. Open the deployed application while online and use **Update available** when offered, or close and reopen after the new service worker installs.

## Validation boundary

Automated tests use desktop and mobile-emulated headless Chromium. The package has not been physically exercised on every intended iPhone, iPad, or Android model. Complete the device acceptance checklist in `README.md` before operational rollout, especially installation, keyboard behavior, location permission, offline relaunch, share-sheet destinations, and storage retention under organizational device policies.
