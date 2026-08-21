# another-angle

A Next.js site where every page is a fully independent, statically-exported
HTML page, deployed to an S3 static website bucket.

## How "independent pages" works here

Next.js's App Router already maps one folder → one URL → one static HTML
file. As long as a page doesn't import data or components from another
page (only from shared, presentational things like a nav bar), each page:

- builds to its own `out/<route>/index.html`
- can be opened directly in a browser with no server
- can be deployed on its own without touching any other page's files

```
app/
  layout.tsx        <- shared shell only (html/body tags, global nav)
  page.tsx          <- home page:      /
  tech/
    page.tsx         <- category page:  /tech/
  <new-category>/
    page.tsx          <- add a new folder + page.tsx = new independent page
```

## Adding a new category page

1. `mkdir app/travel`
2. Create `app/travel/page.tsx` (copy `app/tech/page.tsx` as a starting
   point and change the content/metadata).
3. Optionally add a link to it in `app/components/SiteNav.tsx`.
4. `npm run build` — you'll see the new route in the build output and a
   new `out/travel/index.html`.

No routing config, no sitemap file, no other page needs to change.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
```

## Building the static site

```bash
npm run build
```

Output lands in `./out`. Because `next.config.ts` sets `output: "export"`,
this is a plain folder of HTML/CSS/JS — no Node server required to serve
it. You can open `out/index.html` directly, or run:

```bash
npx serve out
```

to preview it the way S3 will serve it.

## One-time AWS setup

1. **Create the bucket** (bucket name must be globally unique):
   ```bash
   aws s3 mb s3://your-bucket-name --region ap-south-1
   ```

2. **Enable static website hosting:**
   ```bash
   aws s3 website s3://your-bucket-name \
     --index-document index.html \
     --error-document 404/index.html
   ```

3. **Allow public reads** — attach this bucket policy (replace the bucket
   name), e.g. via `aws s3api put-bucket-policy`:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::your-bucket-name/*"
       }
     ]
   }
   ```
   You'll also need to turn off "Block all public access" for the bucket
   in the S3 console (Permissions tab) for the policy above to take
   effect.

4. **Install and configure the AWS CLI**, if not already:
   ```bash
   aws configure
   ```

## Deploying

```bash
./deploy.sh your-bucket-name
```

This runs `npm run build`, then syncs `./out` to the bucket — static
assets get long-lived caching, HTML files get `must-revalidate` so new
deploys show up immediately without users needing a hard refresh.

Your site is then live at:

```
http://your-bucket-name.s3-website-<region>.amazonaws.com
```

### Optional: custom domain + HTTPS

S3 website endpoints are HTTP-only. For a real domain with HTTPS, put
CloudFront in front of the bucket and point your domain's DNS at the
CloudFront distribution — happy to walk through that setup when you're
ready to add a domain.

## Notes / constraints of static export

- No API routes with server logic (`app/api/*` with real backend code) —
  everything has to be resolvable at build time.
- No `next/image` optimization at request time — `next.config.ts` sets
  `images.unoptimized: true` so `<Image>` still works but doesn't resize
  on the fly.
- No ISR/on-demand revalidation — content updates require a rebuild +
  redeploy (`./deploy.sh`).
