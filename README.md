# UNISON — Different Minds. One Vision.

## Browser demo authentication and role workspaces

The current front-end includes a browser-only demo sign-in. It is for classroom demonstration and is **not secure authentication**. Accounts, sessions and reports created in the role-based interface are stored in that browser's local storage; do not use real passwords or personal data. The site does not send demo reports to a municipality.

- Resident routes: `/app`, `/report`, `/track`, `/map`, `/emergency`, `/announcements`, `/profile`.
- Admin workspace: `/admin` (overview, reports, users, announcements, map/emergency sample contacts and reset settings).
- Auth routes: `/login`, `/signup`, `/forgot-password`.
- Demo admin: `admin@unison.demo` / `Admin@123`.
- Accounts are stored as readable browser data and can be changed with browser developer tools. Forgot password is a success-message demo, not email recovery. Admin protections are UI/demo rules, not security controls.
- Resident reports are scoped by account ID in this browser. Admin changes update the same browser data immediately.
- If browser storage is cleared, accounts and reports are removed. The admin workspace starts with one clearly labelled sample report. Demo reports submitted with this UI are not sent to the older Google Sheets/Drive bridge. Existing cloud records remain in the Google Sheet/Drive and are not migrated into local storage.

The project keeps TanStack Router (the existing router used by UNISON); no React Router dependency was added. Route files are in `src/routes/`, reusable layouts and screens in `src/components/`, and the browser demo model/storage/auth in `src/lib/demo-*` and `src/lib/auth-context.tsx`.

The repository uses **npm** as its package manager and commits `package-lock.json`. GitHub Actions uses `npm ci` so CI and local development resolve the same dependency tree.

Build a clean, modern, beginner-friendly website called UNISON for a first-year college Innovation and Design Thinking (IDT) group project based on the United Nations theme "Sustainable Cities and Communities."

Goal: Help residents view neighborhood information, report civic problems, track complaints, and access emergency services in one place.

1. Design

Use a modern, minimal, professional design.

Use white backgrounds, dark green accents, light green highlights, and readable typography.

Make the website responsive on laptops and mobile phones.

Use simple icons, rounded cards, clear buttons, and plenty of whitespace.

Keep the interface easy to understand for first-time users.

2. Dashboard

Create a homepage with:

UNISON logo and navigation bar, using the tagline "Different Minds. One Vision."

Welcome message and neighborhood location selector.

Weather card with temperature and conditions.

Summary cards for total reports, pending issues, and resolved issues.

Quick-action buttons: Report a Problem, Community Map, Emergency Services.

Recent community announcements.

3. Report a Problem

Create a working complaint form with:

Issue category: pothole, damaged road, broken streetlight, garbage, drainage, or waterlogging.

Location field.

Description field.

Optional photo upload.

Submit Report button.

After submission, display a success message and a complaint reference ID. Store submitted reports on the local demo server so they can be viewed during the demo.

4. Complaint Tracking

Display submitted complaints as cards with:

Issue title and location.

Date submitted.

Status: Submitted, Verified, In Progress, or Resolved.

Category and description.

Allow users to filter complaints by status.

5. Community Map

Create a simple map section showing reported neighborhood issues with location markers. If a real map integration is unavailable, use a clearly labelled demo map or a simple map placeholder.

6. Emergency Services

Show separate cards for:

Nearby hospitals.

Police stations.

Ambulance services.

Emergency helpline numbers.

Provide call and directions links where appropriate. Use verified public information or clearly labelled sample data; do not invent nearby facilities.

7. Community Announcements

Show example announcements for road repairs, water supply interruptions, and garbage collection schedules. Clearly label example content as demo data.

8. Technical requirements

Use simple, maintainable code and reusable components.

Make all navigation buttons and forms functional.

Save demo complaints through the server API using local development storage.

Include loading, empty, and success states.

Do not require user accounts, payments, or a complicated backend.

Do not claim complaints are sent to a real municipality.

Include a small footer stating that this is an educational prototype.

9. Final result

Generate the complete working website, not just a static mockup. Prioritize the dashboard, complaint form, issue tracking, emergency services, and responsive design. Keep the project lightweight and suitable for a four-member college group to explain during an IDT presentation.

## Development

You need Node.js 22 or later and npm.

```sh
git clone https://github.com/Catfood23/UNISON.git
cd UNISON
npm ci
npm run dev
```

In Windows PowerShell, use `npm.cmd` for these commands if script execution policy blocks `npm.ps1`.

Create and run a production build with:

```sh
npm run build
npm start
```

## Legacy reports API (not used by the current role-based browser UI)

These endpoints remain in the repository and support the earlier server-backed demo. The current `/app` resident and `/admin` demo workspaces use browser local storage and do not call these endpoints. Previously stored Sheets/Drive reports remain in those services and are not imported into browser accounts.

The legacy API persists reports server-side (local `.data` or Google Sheets/Drive when configured). The current role-based website does not call this API:

- `GET /api/reports` lists a privacy-limited summary (reference, category, neighborhood, date, status).
- `GET /api/reports/:id` returns the same limited fields for tracking by reference.
- `POST /api/reports` validates and creates a report.
- `GET /api/admin/reports` returns full report details and requires an admin session.
- `PATCH /api/reports/:id` updates a report status and requires an admin session.
- `DELETE /api/reports/:id` deletes a report and requires an admin session.
- `GET /api/reports/:id/photo` serves report photos only to an authenticated administrator.
- `POST` and `DELETE /api/admin/session` create and clear the signed admin session.

For local development without Google configuration, the server writes reports to `.data/reports.json` (ignored by Git). Set `UNISON_DATA_DIR` to use another local directory. Set `UNISON_ADMIN_PASSWORD` to a unique password of at least 24 characters to use the admin dashboard locally.

## Google Sheets and Drive storage

The server can store report metadata in a Google Sheet and uploaded photos in a private Google Drive folder. The browser talks only to the UNISON API; the Apps Script URL and shared secret stay server-side. Do not share the Drive folder or put the shared secret in frontend code.

1. In Google Drive, create a spreadsheet and a folder for UNISON report photos. Keep the photo folder private. Copy each ID from its URL (the text between `/d/` and the next slash for a spreadsheet; the folder ID follows `/folders/`).
2. Open [script.google.com](https://script.google.com), create a project, and paste `google-apps-script/Code.gs` into its editor. In **Project Settings → Script Properties**, add:
   - `UNISON_SHARED_SECRET`: a long random value you create.
   - `UNISON_SHEET_ID`: the spreadsheet ID.
   - `UNISON_PHOTO_FOLDER_ID`: the Drive folder ID.
3. Deploy the project as a **Web app**, executing as **you**. The access must allow anonymous requests (the option is commonly labeled **Anyone**, not “Anyone with a Google account”) because UNISON's server cannot sign into Google. This makes the endpoint internet-reachable; each request is checked against the shared secret, so keep that secret private and never put it in browser code. Copy the deployed web app URL ending in `/exec`.
4. Copy `.env.example` to `.env`. Set `UNISON_GOOGLE_APPS_SCRIPT_URL` to the `/exec` URL and set `UNISON_GOOGLE_SHARED_SECRET` to the same secret as `UNISON_SHARED_SECRET` in Apps Script. `.env` is ignored by Git.
5. Restart the development server with `npm.cmd run dev` on Windows. The first Google-backed API request imports reports from `.data/reports.json` once, including their photos, then switches report reads and changes to Google storage. Keep the local file until you have confirmed the imported reports appear in the app.

The Apps Script bridge source and manifest are in `google-apps-script/`. If you edit the bridge later, save and deploy a new version of the web app. The current role interface is not a security boundary. The legacy API keeps its separate signed admin session and should not be treated as protected by the browser demo login.

## Free deployment with Cloudflare Workers

UNISON is a full-stack TanStack Start app. GitHub Pages cannot run its report API, so the included GitHub Actions workflow deploys both the site and API to a Cloudflare Worker. The Worker calls the Apps Script bridge; the Google URL and shared secret stay in Cloudflare Worker secrets. GitHub Actions is the deploy pipeline, not the API server.

The Cloudflare Worker free plan and Google Apps Script have usage limits. Keep this as a small educational demo, check the providers' current quotas, and do not upgrade to a paid plan unless the team chooses to.

### One-time setup

1. In Cloudflare, create a Workers API token with permission to deploy Workers, and copy the account ID.
2. In GitHub, open **Catfood23/UNISON → Settings → Secrets and variables → Actions**. Add these repository secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `UNISON_GOOGLE_APPS_SCRIPT_URL`
   - `UNISON_GOOGLE_SHARED_SECRET`
   - `UNISON_ADMIN_PASSWORD` (recommended before using the admin dashboard; unique, at least 24 characters, generated with a password manager)
3. Before the first deployment, configure the local Google bridge in `.env` using `.env.example`. The first local request to `/api/reports` imports existing `.data/reports.json` records and photos into Sheets/Drive. Verify the records in the spreadsheet before deploying. The production Worker intentionally skips local-file migration because Worker files are not persistent.
4. Push the deployment files to `main`, or run **Actions → Deploy UNISON to Cloudflare Workers → Run workflow**. The workflow builds using the Cloudflare Nitro preset and deploys the app. The Worker URL will be shown in the workflow output or Cloudflare dashboard.
5. After deployment, the workflow installs the Google settings as Worker **secrets** and installs the admin password if it was provided. Confirm the deployment completed successfully before sharing the Worker URL.

The older Worker API continues to use the Google bridge and its separate signed admin cookie. The new resident/admin workspaces use browser-only accounts and reports; they are not connected to the Google Sheet or Drive. Admin demo UI protections are not server security. Use fictional data only.
