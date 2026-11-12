# Architecture

- Store administrator-created public subpages in `site_pages` and render them through `/paginas/$slug`; database publication policies keep drafts private without generating route files.
- Extend existing desktop and mobile menus with shared typed subpage links, preserving all built-in navigation.
- Normalize club region identifiers through the shared region helper for filtering and selectors, while preserving stored descriptive names unless the user changes the region; imported names can include descriptions and whitespace.