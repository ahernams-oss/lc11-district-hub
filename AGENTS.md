# Architecture

- Store administrator-created public subpages in `site_pages` and render them through `/paginas/$slug`; database publication policies keep drafts private without generating route files.
- Extend existing desktop and mobile menus with shared typed subpage links, preserving all built-in navigation.