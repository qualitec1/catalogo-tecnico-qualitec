# Task 13: PDF Type Selection (WEB vs PRINT)

## Status: ✅ COMPLETED

## Objective
Add functionality to download PDF in two modes:
- **WEB**: with clickable "Baixar Ficha Técnica" links
- **PRINT**: without links for cleaner printing layout

## Implementation Summary

### 1. UI Changes - CatalogPrintModal.vue
- Added new section "Tipo de PDF" with two radio button options
- **PDF para WEB**: Includes clickable links (default)
- **PDF para IMPRESSÃO**: No links, optimized for physical printing
- Added state variable `pdfType` with default value `'web'`
- Updated emit signature to include `pdfType` in confirm payload

### 2. State Management - useCatalog.ts
- Added `pdfTypeSelection` ref to store selected PDF type
- Updated `confirmAndDownload` to capture `pdfType` from modal payload
- Exported `pdfTypeSelection` for use in components

### 3. PDF Generation Pipeline
**CatalogPdfTemplate.vue**:
- Added `pdfType` prop to receive selection from parent
- Passed `forPrint: props.pdfType === 'print'` to `buildCatalogPdf()`

**index.vue**:
- Passed `pdfTypeSelection` to `CatalogPdfTemplate` component

### 4. Core PDF Logic
**pdfDrawHelpers.ts**:
- Updated `BuildOptions` interface to include optional `forPrint?: boolean`
- Modified `drawDatasheetLink()` to accept `forPrint` parameter
- Early return when `forPrint === true` (skips rendering link entirely)

**pdfLayoutDrawers.ts**:
- Updated all layout functions to pass `opts.forPrint` to `drawDatasheetLink()`:
  - `drawLayout1()` - 1 per page layout
  - `drawLayout3()` - 2 per page layout
  - `drawLayout6()` - 6 per page layout
  - `drawLayout8()` - 8 per page landscape layout

## Technical Details

### Conditional Rendering Logic
```typescript
export function drawDatasheetLink(pdf: any, product: any, x: number, y: number, alignRight: boolean, forPrint: boolean = false) {
  // Skip rendering the link if PDF is for print mode
  if (forPrint) return
  
  // ... rest of link rendering code
}
```

### Data Flow
1. User selects PDF type in `CatalogPrintModal`
2. Modal emits `{ pdfType: 'web' | 'print' }` on confirm
3. `useCatalog.ts` stores selection in `pdfTypeSelection`
4. `index.vue` passes selection to `CatalogPdfTemplate`
5. `CatalogPdfTemplate` passes `forPrint` flag to `buildCatalogPdf()`
6. Layout functions receive flag via `opts.forPrint`
7. `drawDatasheetLink()` checks flag and skips rendering if true

## Testing Checklist
- [x] Build successful (no TypeScript errors)
- [x] No diagnostics in any modified files
- [x] Git commit created
- [x] Changes pushed to remote repository

## Files Modified
1. `app/components/CatalogPrintModal.vue` - UI and state
2. `app/composables/useCatalog.ts` - State management
3. `app/pages/index.vue` - Prop passing
4. `app/components/CatalogPdfTemplate.vue` - PDF generation trigger
5. `app/utils/pdfDrawHelpers.ts` - Interface and core function
6. `app/utils/pdfLayoutDrawers.ts` - Layout functions (4 layouts updated)

## Commit
```
feat: Add PDF type selection (WEB vs PRINT mode)

- Added radio button UI in CatalogPrintModal for PDF type selection
- WEB mode: includes clickable 'Baixar Ficha Técnica' links (default)
- PRINT mode: removes links for clean printing layout
- Updated PDF generation pipeline to respect forPrint flag
- Modified drawDatasheetLink to skip rendering when forPrint=true
- Updated all layout functions (drawLayout1, drawLayout3, drawLayout6, drawLayout8)
- Build successful with no diagnostics
```

## Next Steps
User can now:
1. Click "BAIXAR CATÁLOGO TÉCNICO" or "BAIXAR EM POWER POINT"
2. Select "PDF para WEB" (with links) or "PDF para IMPRESSÃO" (without links)
3. Generate PDF with appropriate configuration
