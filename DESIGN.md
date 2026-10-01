---
name: DockProof Receiving Dossier
description: Evidence-first operations interface for receiving, inspection, and exception review.
colors:
  forest: "#1d3a32"
  forest-raised: "#26483d"
  canvas: "#f3f2ed"
  paper: "#fffefa"
  ink: "#1c2e27"
  muted: "#65736c"
  line: "#d9dcd0"
  terracotta: "#bd8655"
  pass: "#146443"
  exception: "#9c3328"
  uncertain: "#8b5b11"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(34px, 3vw, 46px)"
    fontWeight: 700
    lineHeight: 0.95
  body:
    fontFamily: "IBM Plex Sans, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "10px"
    fontWeight: 600
    letterSpacing: "0.08em"
rounded:
  control: "4px"
  card: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "24px"
---

## Overview

DockProof is an inspection dossier, not a generic analytics dashboard. The interface makes physical arrivals, purchase-order expectations, evidence, and commercial decisions easy to scan under time pressure. A dark forest navigation rail anchors the workspace; warm paper surfaces read as receiving records. Terracotta marks document structure without competing with verdict colors.

## Colors

Forest is for navigation and primary actions. Canvas and paper form a quiet reading surface; thin sage-gray borders organize data. Green, rust red, and amber are reserved for PASS, EXCEPTION/FAIL, and UNCERTAIN. Status must also be written in words and supported by icons or labels, never by color alone. Avoid purple/indigo brand accents and gray text on saturated backgrounds.

## Typography

Barlow Condensed provides compact, confident page and section headings. IBM Plex Sans carries instructions and table content. IBM Plex Mono identifies SKUs, POs, hashes, measurements, eyebrows, and operational metadata. Use tabular figures for quantities and benchmark metrics.

## Layout

The desktop shell uses a 252px navigation rail, 64px topbar, and a document canvas capped at 1680px. Page headers act as the first sheet of a dossier. Dense records use tables with clear headers and horizontal scrolling on narrow screens. At mobile widths the rail becomes a menu and content uses 16–22px gutters; cards stack before text becomes cramped.

## Elevation & Depth

Prefer borders, rules, and tonal separation to floating shadows. Only subtle hover lift is allowed on interactive cards. No glow, glass, blur, or ornamental gradient.

## Shapes

Controls have 4px corners, sheets and cards about 8px. The restrained geometry should feel like physical operations paperwork, not a playful consumer product.

## Components

Primary buttons use forest with paper text; secondary buttons are outlined. Status chips carry semantic tone and explicit verdict text. Page covers use a 3px top rule. Table headers are monospaced uppercase. Inputs have visible labels and a warm focus outline. Loading, empty, error, and read-only states must explain the next action.

## Do's and Don'ts

- Do show expected beside observed and cite the evidence behind a decision.
- Do preserve UNCERTAIN when photos or counts cannot establish a fact.
- Do describe current behavior accurately, particularly mock observation mode and CSV import.
- Don't make mock data appear to be genuine visual analysis.
- Don't claim a shipment is verified from an incomplete evidence record.
