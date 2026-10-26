# Slow demo site

A one-page website for a fictional company, **Slowpoke Property Co.**, that is slow **on purpose**.
It gives the PMW Speed Engine a public, client-free site to audit for the portfolio demo.
The page is marked `noindex` so search engines skip it.

## Commands

```bash
npm run dev      # serve public/ at http://127.0.0.1:5050
npm run check    # confirm every planted issue is still in place
npm run assets   # regenerate the heavy images and CSS (output is identical each time)
```

## Answer key: the planted issues

| # | Issue | Where | Expected to hurt |
|---|---|---|---|
| 1 | Google Fonts with no `font-display` and no preconnect | `index.html` head | FCP, LCP |
| 2 | 48 KB stylesheet, almost all unused, render-blocking | `css/framework.css` | FCP, unused CSS |
| 3 | Old jQuery 1.12.4, loaded synchronously | `index.html` head | FCP, Best Practices |
| 4 | Sync "analytics" script that blocks the main thread for 450 ms | `js/analytics.js` | FCP, TBT |
| 5 | The same script included twice | `js/carousel.js` | TBT, duplicate file |
| 6 | 3.7 MB hero image (the LCP element), `loading="lazy"`, no width/height | `img/hero.png` | LCP, CLS |
| 7 | Oversized listing images, no dimensions, one with no alt text | `img/listing-*.png` | LCP, CLS, Accessibility |
| 8 | Below-the-fold iframe that isn't lazy-loaded | `embed/map.html` | page weight |
| 9 | Promo banner injected after 1.5 s with no reserved space | `js/app.js` | CLS |
| 10 | Menu and FAQ tap handlers that block for 300 to 350 ms | `js/app.js` | INP |

Also: low-contrast text in the "For owners" section (Accessibility).

Not planted: slow server response (TTFB). Static hosting like Vercel answers fast.
