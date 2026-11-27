# Architecture

- Store administrator-created public subpages in `site_pages` and render them through `/paginas/$slug`; database publication policies keep drafts private without generating route files.
- Extend existing desktop and mobile menus with shared typed subpage links, preserving all built-in navigation.
- Normalize club region identifiers through the shared region helper for filtering and selectors, while preserving stored descriptive names unless the user changes the region; imported names can include descriptions and whitespace.
- Group events by their explicitly stored leonistic year, not their date; shared year navigation and list components keep public and administrative subpages consistent while preserving event detail URLs.
- Keep donation validation and payment-confirmation rules in the shared donation-flow helper so checkout and receipt eligibility remain consistent.
- Gate new Stripe checkout sessions and payment controls through the shared payment-status switch; preserve receipt reads, webhooks and existing supporter management so pausing does not erase history or prevent cancellations.
- Read donation tracking through the authenticated browser client with existing administrator-only RLS; never expose donor details through public report functions.
- Order Grandes Leões through the shared seeded 24-hour shuffle and browser clock hook; stable UTC periods synchronize visitors without scheduled database work or hydration mismatches.
- Centralize admin report sources and paginated RLS-scoped reads; export nested fields to separate Excel sheets and full-length PDF record layouts, preparing Excel automatically after consultation and all files before download to retain mobile user activation.

- Use the shared document download control on all public document lists: request storage attachments without previews or new tabs, and fetch external files only on demand with an explicit ready-to-download step on touch devices.

- Manage institutional leadership as categories of the existing leaders table through the shared leader list/editor; public category pages and biography/gallery views read leaders_public, while site_content remains optional page-level copy.
- Share protocol topic definitions between desktop/mobile nested navigation and the un-nested dynamic topic route; preserve the existing protocol overview URL and avoid inventing unpublished content.
