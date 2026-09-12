# Performance improvements

This version keeps the existing landing-page design and admin content while improving first-load performance:

- Local JPG assets have optimized WebP counterparts used by default.
- Above-the-fold logo and banner are preloaded and loaded eagerly.
- Below-the-fold screenshots and similar-app images remain lazy-loaded.
- `vite-plugin-singlefile` was removed so the Vite build can use normal cached JS/CSS assets instead of one large inlined document.
- Vercel serves WebP assets with a long immutable cache lifetime.
- `/admin` is handled through a Vercel SPA rewrite so direct navigation does not return 404.

The original JPG files are retained for compatibility with any saved/custom image URLs.
