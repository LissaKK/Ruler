# Ruler Extension — One-Page Product Requirements Document

## Product Summary

Build a Chrome extension named “Ruler” that lets designers, developers, and QA users measure visual layout dimensions directly on a web page. The product will focus on a lightweight page-measurement experience inspired by Page Ruler Redux, Screen Ruler / Ruler for Chrome, and ProtractorX-style mental model, while avoiding scope creep into full color-analytics or screenshot-comparison tooling.

## Problem / Opportunity

Users need an efficient way to answer visual layout questions while browsing: how wide is this element, how far apart are two points, and where should a guide or line be placed for QA or design alignment. Existing tools are fragmented: some are pure pixel rulers, some add color tools, some add fonts, and some add overlays. Our extension should provide a focused measurement experience that works fast in the browser and aligns to Manifest V3 Chrome extension requirements.

## Product Goals

- Provide fast, low-friction page measurement from a browser action popover and overlay UI.
- Support both horizontal and vertical ruler workflows.
- Support point-to-point distance measurement in pixels.
- Support element sizing via rectangular measurement and selection.
- Provide a clean foundation that can later add optional advanced tools such as color picker, protractor, grid overlay, and font inspection.

## User Personas

- Front-end developer verifying spacing and width/height.
- UX/UI designer checking alignment and layout proportions.
- QA reviewer validating visual implementation against design expectations.

## Scope

### In scope (MVP)

- Horizontal ruler overlay
- Vertical ruler overlay
- Point-to-point pixel distance measurement
- Element width/height measurement
- Measurement guides and clear/reset controls
- Chrome extension UI, popup, toolbar button, and side/overlay rendering logic
- Chrome Manifest V3 implementation target

### Out of scope for MVP

- Color pickers / eyedropppers
- Protractor angle measurement
- Grid overlay generation
- Screenshot diff / image overlay comparison
- Font inspection / CSS extraction

### Nice-to-have / future roadmap

- Color picker / eyedropper panel
- Protractor angle mode
- Grid overlay mode
- CSS/font inspection mode
- Screenshot overlay and visual QA comparison mode

## Functional Requirements

### MVP Requirements

1. A user can open the extension and launch a measurement session from the popup or side panel.
2. The extension can render a horizontal ruler and a vertical ruler on the currently active web page.
3. The extension can capture a start point and end point from page coordinates and compute pixel distance.
4. The extension can report selected element width and height in pixels.
5. The user can create one or more page guides and remove them from the measurement view.
6. The extension can show numeric measurement labels in the overlay.
7. The extension must behave under Manifest V3 Chrome APIs and remain compatible with modern Chromium extension security requirements.

### Extended Requirements

1. A color pick mode that reads the color of a selected pixel or DOM location.
2. A protractor mode that measures angle between elements or line segments.
3. A grid overlay mode that shows design alignment lines.
4. A font/CSS exploration mode for inspecting font family, size, weight, and element style attributes.
5. A screenshot comparison mode that overlays a reference design.

## Acceptance Criteria

### MVP Acceptance Criteria

- Users can activate a ruler mode from the popup or side panel.
- Users can create a horizontal ruler line and a vertical ruler line that render visually on page content.
- Users can drag endpoints or guide handles and see numeric pixel values update.
- Users can draw a measurement between two page points and see the calculated distance.
- Users can select an element and retrieve width and height information.
- Users can clear all current measurements or reset the page state.
- The extension works in a Chrome browser context and loads without runtime errors in the test target environment.

### Extended Feature Acceptance Criteria

- If color mode is enabled, the user can sample a color from the page and view RGB/HEX values.
- If protractor mode is enabled, the user can measure an angle and display it in degrees.
- If grid mode is enabled, the user can toggle a visual grid or guideline overlay.
- If a comparison overlay is enabled, the user can compare a reference image or screenshot against the live page.

## User Experience / UI Flow

### Main Flow

1. User clicks the extension icon.
2. Extension popup opens with mode selection: Ruler, Distance, Guides, and optional advanced tools.
3. User chooses “Ruler” mode.
4. User drags horizontal or vertical guide lines over the page.
5. User selects an element, or clicks-and-drags two points to create a distance measurement.
6. Measurement panel updates with width, height, pixel distance, or position information.
7. User can save/delete current measurement lines or clear the view.

### Optional Extended Flow

1. User opens extension popup.
2. User selects an advanced mode such as Color Picker, Protractor, or Grid.
3. Extension opens a floating overlay or side panel.
4. User interacts with the selected feature.
5. Data is displayed in the overlay panel, and the main measurement layer remains available.

## Risks / Dependencies

- Chrome extension permissions need to be scoped carefully to avoid unnecessary access.
- Rendering overlays must avoid interfering with page interaction or layout.
- The MVP should be measurement-first; advanced tools must not block the baseline user experience.
- Manifest V3 compatibility can introduce API differences that need deliberate implementation.

## Success Metrics

- Extension can be activated from the Chrome toolbar without a page reload.
- Core measurement actions are visible in less than one second after activation.
- Users can finish a basic width/height or point-to-point measurement in under 15 seconds.
- Zero critical runtime errors in the Chrome extension test environment.

## Decision Summary

The MVP should prioritize measurable, reliable page-layout functionality rather than becoming a broad “developer toolkit.” The product should be intentionally focused on pixel measurement and guide workflows. Color pickup, protractor, grid, CSS/font, and image comparison should remain in the roadmap as optional, separately validated extensions to the core product.

# Formal Requirements Breakdown

## Product Requirements

### REQ-01: Extension activation
The extension shall expose a toolbar icon and popup UI that enables a user to activate measurement modes.

Acceptance criteria:
- The extension icon is visible in the Chrome toolbar.
- Clicking the icon opens a popup or equivalent browser action surface.
- The popup presents menu actions for Ruler, Distance, Guides, and advanced mode access.

### REQ-02: Page overlay rendering
The extension shall render page-level measurement overlays such as rulers and measurement lines within the active tab.

Acceptance criteria:
- A horizontal measurement line can be created and rendered.
- A vertical measurement line can be created and rendered.
- Rulers remain visible while the user is in measurement mode.

### REQ-03: Coordinates and measurement model
The extension shall use browser viewport or DOM coordinate math to calculate visual positions and pixel distances.

Acceptance criteria:
- User-selected start and end points produce an accurate pixel distance readout.
- Measurement labels are displayed in the browser page overlay.
- Values update on drag operations.

### REQ-04: Element dimension reporting
The extension shall identify page element geometry based on DOM selection events.

Acceptance criteria:
- When the user selects an element, the overlay reports width and height.
- Height and width are expressed in pixels.
- The selected element is visually highlighted or reflected in the active measurement mode.

### REQ-05: Guide management
The extension shall support graphic guides that can be created, repositioned, and removed.

Acceptance criteria:
- A new guide can be added from the popup or overlay.
- Existing guides can be dragged and re-positioned.
- Users can remove a guide or clear the guide layer.

### REQ-06: Advanced mode support
The extension architecture shall support additional future modes without replacing the core overlay measurement engine.

Acceptance criteria:
- The UI can show an advanced feature mode selector.
- The advanced mode registration is isolated from the core measurement mode.
- Core measurement mode remains functional when advanced tools are disabled.

## User Stories

### Epic 01 — Measurement activation

Story US-01.1: As a web designer, I want to launch the extension from the toolbar so that I can begin measuring without a page reload.

Acceptance criteria:
- The popup opens in less than one second.
- User sees a mode switcher and a clear controls area.

Story US-01.2: As a QA reviewer, I want to reset the session so that I can clear previous measurement overlays before a fresh check.

Acceptance criteria:
- Clear action removes all active page overlays.
- UI state reflects a reset session.

### Epic 02 — Ruler workflow

Story US-02.1: As a developer, I want horizontal and vertical guide lines so that I can confirm alignment with page structure.

Acceptance criteria:
- Ruler mode renders at least one horizontal line and one vertical line.
- Users can drag guide handles and maintain the measurement view.

Story US-02.2: As a UX reviewer, I want to inspect a selected element’s dimensions so that I can validate spacing and layout consistency.

Acceptance criteria:
- Selecting an element reports width and height.
- Width/height values are rendered in the current measurement panel.

### Epic 03 — Distance measurement

Story US-03.1: As a QA engineer, I want to capture two points and determine distance so that I can validate visual spacing between two objects.

Acceptance criteria:
- Two point captures create a measurement line.
- Pixel distance is displayed in the overlay or measurement panel.

Story US-03.2: As a designer, I want a persisted measurement view so that I can compare dimensions while reviewing a page.

Acceptance criteria:
- Current measurement traces remain visible on page navigation if the extension state remains active.
- A user can erase a measurement or clear all measurements.

### Epic 04 — Advanced capabilities

Story US-04.1: As a design systems user, I want a color picker mode so that I can identify target colors on page elements.

Acceptance criteria:
- Color mode opens an eyedropper flow.
- Newly selected color is displayed with readable value output.

Story US-04.2: As a visual QA user, I want a protractor mode so that I can validate angled elements.

Acceptance criteria:
- Protractor mode can display angle value between two points or alignments.
- Non-core mode is isolated from the measurement mode.

Story US-04.3: As a UI implementation user, I want grid overlay support so that I can compare against a page grid.

Acceptance criteria:
- Grid overlay can be shown and hidden.
- Grid settings configure spacing and offset.

## Engineering Work Breakdown

### Phase 01 — Foundation

Task ENG-01.1: Scaffold Manifest V3 Chrome extension structure.

Engineering notes:
- Create manifest with action popup, content scripts, background service worker, and extension assets.
- Confirm permissions required for DOM inspection and page rendering.

Task ENG-01.2: Create popup and toolbar integration.

Engineering notes:
- Build popup HTML, CSS, and JavaScript shell.
- Bind mode controls: Ruler, Distance, Guides, and Optional.

Task ENG-01.3: Build content script bridge.

Engineering notes:
- Inject measurement UI state into the current tab.
- Maintain message passing between popup, background, and content script.

### Phase 02 — Core overlay implementation

Task ENG-02.1: Create measurement overlay layer.

Engineering notes:
- Draw horizontal and vertical measurement lines.
- Render measurement labels and update positions.

Task ENG-02.2: Build DOM selection and geometry extraction.

Engineering notes:
- Read bounding rectangles from selected DOM elements.
- Compute pixel width/height and alignment coordinates.

Task ENG-02.3: Implement point-to-point distance capture.

Engineering notes:
- Capture x/y selection events from the tab.
- Calculate distance via coordinate deltas.

Task ENG-02.4: Implement guide management.

Engineering notes:
- Create, drag, resize, and delete guide operations.
- Save guide data in a runtime state object.

### Phase 03 — UX and testability

Task ENG-03.1: Build measurement panel and numeric reporting.

Engineering notes:
- Present selected measurement data in the overlay or side panel.
- Keep labels accessible and non-blocking.

Task ENG-03.2: Create automated tests for core measurement actions.

Engineering notes:
- Unit test coordinate conversion logic.
- Integration test popup mode switching and overlay injection.

Task ENG-03.3: Validate browser compatibility and permissions.

Engineering notes:
- Smoke test the extension in Chromium.
- Verify Manifest V3 compatibility.

### Phase 04 — Optional advanced modes

Task ENG-04.1: Design Color Picker architecture.

Engineering notes:
- Add an eyedropper mode to consume color values from the page.
- Consider safe permission boundaries.

Task ENG-04.2: Design Protractor mode architecture.

Engineering notes:
- Add angle computation logic and display elements.
- Keep it optional.

Task ENG-04.3: Design Grid overlay architecture.

Engineering notes:
- Offer an overlay mode that renders grid lines based on settings.
- Define UX for intensity and visibility.

## Implementation Priority

Priority 1 — Must ship for MVP:
- Toolbar activation
- Horizontal/vertical ruler overlay
- Point-to-point distance measurement
- Element width/height reporting
- Clear/reset controls

Priority 2 — Should be included if tolerance allows:
- Guide management options
- Optional measurement panel refinements

Priority 3 — Future roadmap:
- Color picker
- Protractor
- Grid overlay
- CSS/font inspection
- Screenshot comparison
