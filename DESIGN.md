# Sydney carpentry preview — design context

## Purpose and authority

This is a bilingual residential-carpentry enquiry site, not a verified business-coverage claim. The supplied v3 `source-package/01_MASTER_BUILD_SPEC.md` and `config/` own scope and approval rules; `site.config.json` is the deployment fact gate. This document records the implemented visual/interaction choices and cannot authorize unknown business facts.

## Visual direction

The September 23 conversion pass retains every existing real-work image, route and soft timber palette. Runtime styles remain owned by `public/site.css`: warm paper, sage, timber and ink tokens are unchanged. Body copy and action labels are larger, while a three-scenario repair-decision section gives homepage visitors a useful route into the existing Owner pages. A shared call/photo-enquiry rail closes every route; on narrow screens its two primary actions become a compact fixed dock with document padding reserved beneath it. The existing office address is shown with a Google Maps embed and a direct map-link fallback on Home and Contact, labelled as the Sydney CBD office rather than a walk-in or suburb presence claim. The existing Worker remains the only enquiry acceptance path; the UI distinguishes saved enquiries from pending internal delivery.

The September 23 reference refresh keeps the established Mel One imagery and warm rounded system while making the shared navigation more legible. The three service-menu groups now use muted timber, sage and blue-grey surfaces; expanded, hovered, focused and current-page states are visibly distinct. The header floats on the warm page surface, the hero uses a light sage field with dark readable copy, and major action buttons remain pill-shaped. The references informed hierarchy and wayfinding only; their brands, assets, testimonials and service claims were not copied. Existing service and suburb URLs are unchanged.

The user-confirmed Sydney CBD office address is stored in `site.config.json` and displayed consistently on About, Contact and the shared footer in both languages. It is identified as an office address, not a walk-in promise or proof of a work location.

The customer-concerns section makes four decisions visible before the real-work gallery: quote inclusions, local repair versus replacement, newly exposed damage, and disruption to the home. The FAQ expands these with material supply, removal, cost factors, scheduling and verifiable company/insurance information. Every answer avoids fixed-price, guaranteed-attendance or unconditional workmanship claims. The section is bilingual, links to the full FAQ and enquiry, and collapses to one column on a narrow viewport.

The September 23 redesign uses warm paper `#F7F6F1`, off-white `#FFFEFB`, sage `#DFE9E1`, ink `#20343D` and timber `#CC955F`. Cards use a 28–32px radius, larger feature panels 32–36px, and CTAs are pill-shaped. The four-group footer covers identity/contact, services, areas/work and company/privacy. All original supplied work photos remain public, including when a service intro also uses a photo from its gallery. These rules supersede the older navy-and-square layout descriptions below.

The site uses a restrained editorial timber-work register: deep blue ink, white and cool off-white surfaces, and warm timber accents. Serif display headings distinguish task pages; a legible sans body supports long English and Simplified Chinese text. The homepage hero is a generated general work scene; it is not placed in the real-job gallery or tied to a suburb or completed-job claim. The Sydney Roofing local preview informed the city-first hierarchy and problem-to-service navigation only; its brand, phone, images, claims and unapproved suburb routes are not reused.

The bilingual timber door-frame Owner page now includes a four-image portrait-format field-photo strip. Captions describe only visible door/frame/threshold details and the section explicitly avoids asserting a completed repair or location. The visual treatment uses existing surface, border, radius and ink tokens, with four columns on wide screens and fewer columns on narrow screens; natural image dimensions reserve layout space. The two towel-rail photos are real but remain out of the carpentry page system because the current service scope has no bathroom fixture Owner.

The later user-confirmed real-case batch extends that same field-photo system on the existing window, door/frame and interior-carpentry Owner pages, without new location or keyword-variant routes. New images use a 3:4 photo variant while the first door-detail group keeps its 9:16 variant. Visible copy separates timber repair, agreed painting/finishing and compatible lock hardware; it does not infer before/after sequencing, completed work or emergency locksmith service. Key-bearing, identifiable-reflection and private-possession photos are excluded from public assets. Public asset groups and provenance boundaries are recorded in `MEDIA.md`; the more detailed local-only inventory stays under `reports/`.

## Tokens and ownership

`public/site.css` is the single runtime token source. Its `:root` defines `--ink`, `--ink-soft`, `--paper`, `--surface`, `--line`, `--timber`, `--timber-dark`, `--focus`, scrollbar colours, radius and spacing. Area cards reuse those tokens; no second theme adapter exists. Text content and area research selections live in `src/content.mjs`, while `src/site.mjs` owns route rendering and approved-versus-pending area presentation.

## Navigation and forms

Home → service Owner → same-language enquiry, and Home → Areas → independent suburb page → relevant service Owner → enquiry are the main paths. Preview currently has 56 distinct suburb page pairs; these are research-backed enquiry pages, not proof of attendance. Production output hides pending examples and names only approved locations. English/Chinese switches lead to the equivalent page. On narrow screens the navigation becomes an accessible button menu; headings, CTA and cards reflow into one column. Reduced-motion preference removes decorative movement.

The two `<select>` controls on the enquiry form intentionally use the browser/OS native popup: the task choice and reply language are short, single-select lists, and the site does not promise custom popup geometry. The form uses `novalidate` and owned bilingual validation feedback. Actual contact routing and photo retention remain gated by approved business settings.

## Verification boundary

## Beyond reference adaptation — 2026-09-22

Reference inspected: https://www.beyondmaintenance.com.au/ at 1440px and 390px. Adopted its clear service proposition, prominent contact action, concise reassurance row and image-led service evidence, not its branding, imagery, testimonials, insurance or experience claims. Retained our navy/timber theme, bilingual service Owners, area verification gates, real case galleries and enquiry backend. Five selected-work links lead directly to existing service galleries rather than duplicate project pages. Navigation includes real work, and a closing photo-enquiry block repeats the established contact action.

Browser checking exposed an existing static-page issue: service query parameters were present in CTA links but not reflected in the contact select because build-time rendering receives no query. The contact script now accepts only an existing option value from the query. The full browser path is verified after this fix; no backend recipient or delivery behavior changed.

## Release verification boundary

## Fence maintenance and Waratah reference

The user confirmed fence maintenance as a core business. Extend S05, never a competing synonym route. Waratah's public maintenance navigation and component-based explanations inform the task guide; its orange/black header provides an accent-hierarchy reference, not a replacement brand palette. Keep our existing navy, white and timber tokens. The homepage fence feature uses timber rules; the Owner uses three check categories and wrapping anchor navigation. Preserve the existing title, H1, route, real photos, other services and enquiry backend. Brand context is read from the shared fact configuration, with the existing Mel One preview fallback. No rural wire products, competitor photos, proprietary names or longevity claims are transferred.

The local six-case browser matrix covers English/Chinese at 1440, 390 and 320 pixels, no horizontal overflow, section anchors and fence CTA selecting S05 in the contact form. This is not delivery, ranking or production evidence.

## Photo-led editorial refresh — 2026-09-23

The service directory now gives every core Owner a relevant image. User-supplied field photographs remain the evidence for windows, doors, fencing, interior panels and cabinet work. Four generated general-work images fill the fascia, rotten-timber, timber-gate and deck gaps; their provenance is retained in `MEDIA.md`, and they are not represented as completed Mel One jobs or assigned to any suburb. The general homepage hero is likewise separate from the real-work section.

Home service navigation opens with a large fence-maintenance feature, followed by uneven image-led service cards and a direct photo-enquiry panel. The five real-work images form one tall lead and four compact secondary tiles. Service Owners use a split image/text introduction with alternating alignment, followed by their distinct problem, scope, quote and FAQ content. Where the intro uses a supplied field photograph, the gallery skips that duplicate image without dropping the visual evidence from the page. Mobile falls back to one column, with copy before the image and touchable service links. No new service or suburb Owner URL was created for this refresh.

The local preview is noindex and not a production release. Browser checks must cover both languages and narrow/wide layouts, link destinations, visible coverage caveats and no horizontal overflow. Unit, live Worker, URL and content-coverage results belong in `reports/`; unrun or externally blocked cases remain unpassed.
