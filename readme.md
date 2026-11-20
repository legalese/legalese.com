# legalese.com homepage for Legalese

A statically generated website using Next.js, Markdown, and TypeScript.
Administration via PagesCMS

## Sections edited in Pages CMS

| Collection | Folder | URLs |
| --- | --- | --- |
| Blog Posts | `_posts` | `/posts/<slug>` |
| Pages | `_pages` | `/<slug>` |
| Products | `_products` | `/products`, `/products/<slug>` |
| Solutions | `_solutions` | `/solutions`, `/solutions/<slug>` |
| Apps | `_apps` | `/apps`, `/apps/<slug>` |
| Commons pages | `_commons` | `/commons` (the `index` entry), `/commons/<slug>` |

Products, Solutions, Apps and Commons pages have two switches:

- **Published**: an unpublished entry is not built. To preview drafts locally, build with
  `NEXT_PUBLIC_SHOW_DRAFTS=1`.
- **Status**: `live` gives the entry a page and a menu link; `coming` lists it with a Coming tag and no page.
  A section appears in the header menu once it has a published entry.

## Commons

`/commons/<jurisdiction>` and `/commons/<jurisdiction>/<type>/<slug>` are generated from
[legalese/commons](https://github.com/legalese/commons), not edited here. Jurisdiction codes are the
Akoma Ntoso form: ISO 3166-1 alpha-2 in lowercase, and for a subdivision a hyphen and its ISO 3166-2
code (`au` is Commonwealth law, `au-wa` Western Australia). Types are `act`, `sl`, `bill`, `case`,
`doctrine` and `policy`.

The data lives in `data/commons/` (instrument lists and statistics) and `public/commons-data/`
(statute-map data, loaded only on a jurisdiction page). To refresh it from a Commons checkout, run the
generator in the private `legalese/workbench` repository and commit the result:

```
python site/build_commons_site_data.py ../legalese.github.io
```



