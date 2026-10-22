# ClassIQ – Frontend Assessment

Responsive implementation of the ClassIQ EdTech design (Figma) using HTML5, CSS3 and vanilla JavaScript.

## Pages

| Page | File | Description |
| --- | --- | --- |
| Home | `index.html` | Hero, partner logos, course categories, all-in-one section, footer with newsletter |
| Courses | `courses.html` | Banner + course grid with category filters and enroll action |
| Login | `login.html` | Sign-in form with validation |
| Sign Up | `signup.html` | Registration form with validation |

## How to run

No build step or install is needed.

1. Unzip the folder.
2. Open `index.html` in a browser, **or** (recommended) serve the folder locally so fonts preload correctly:
   - VS Code: right-click `index.html` → **Open with Live Server**
   - or from the project folder: `python -m http.server 5500` and visit `http://localhost:5500`

## Features

- Pixel-close layout, spacing, typography and colours taken from the Figma file
- Fully responsive: desktop (1440), laptop, tablet and mobile breakpoints (1280 / 1024 / 860 / 600px), with a toggle menu on small screens
- Design tokens as CSS custom properties (colours, font families, weights, sizes, radii, shadows, container width)
- Working sign up / login flow (stored in `localStorage` for demo purposes, no backend), logged-in state shown in the header with logout
- Course filters (`courses.html?category=web|data|app`), linked from the "View Courses" buttons on the home page
- Enroll / unenroll per user, redirects to login when not signed in
- Newsletter form with email validation
- Accessible: semantic landmarks, skip link, labelled inputs, `aria-invalid` / live-region error messages, visible focus states, `prefers-reduced-motion` support

## SEO & performance

- Unique `<title>`, meta description, canonical URL, Open Graph and Twitter card tags on every page
- JSON-LD structured data (`EducationalOrganization`) on the home page
- `robots.txt`, `sitemap.xml`, `site.webmanifest`, SVG + PNG favicons and Apple touch icon
- Auth pages marked `noindex`
- One heading hierarchy per page (single `h1`), descriptive `alt` text on all images
- Self-hosted WOFF2 fonts with `font-display: swap` and preload
- Images converted to WebP with explicit `width`/`height` (no layout shift), lazy-loaded below the fold, hero image with `fetchpriority="high"`
- Icons inlined as SVG (no icon font request), single CSS and single deferred JS file

> Note: replace `https://www.classiq.com/` in the meta tags, `robots.txt` and `sitemap.xml` with the real domain when deploying.

## Folder structure

```
ClassIQ/
├── index.html
├── courses.html
├── login.html
├── signup.html
├── robots.txt
├── sitemap.xml
├── site.webmanifest
├── README.md
└── assets/
    ├── css/style.css
    ├── js/main.js
    ├── fonts/        Poppins & Inter (woff2)
    └── images/       logo, favicons, memoji illustrations, partner logos, og-image
```

## Tools & libraries

- No frameworks or build tools – plain HTML, CSS and JavaScript
- Fonts: [Poppins](https://fonts.google.com/specimen/Poppins) and [Inter](https://fonts.google.com/specimen/Inter) (SIL Open Font License), self-hosted
- Icons: [Font Awesome Free](https://fontawesome.com) SVG paths (CC BY 4.0)
- Illustrations and partner logos exported from the Figma design and optimised to WebP

## Small design notes

- Fixed copy typos from the design file ("Cources" → "Courses", "Bussiness" → "Business").
- The Login screen's button reads "Login" (it says "SignUp" in the design).
- Course cards on the Courses page are empty placeholders in Figma; they are filled with sample course data so the page is functional.
