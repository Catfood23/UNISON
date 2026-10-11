# UNISON — Different Minds. One Vision.

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

You need Node.js and npm to develop and run the app locally. Bun is optional.

```sh
git clone https://github.com/Catfood23/UNISON.git
cd UNISON
npm install --no-package-lock
npm run dev
```

In Windows PowerShell, if `npm` is blocked by the script execution policy, use the `.cmd` launcher:

```powershell
npm.cmd install --no-package-lock
npm.cmd run dev
```

Create and run a production build with:

```sh
npm run build
npm start
```

## Reports API (prototype backend)

Reports are handled by the server instead of browser local storage:

- `GET /api/reports` lists reports.
- `POST /api/reports` validates and creates a report.
- `PATCH /api/reports/:id` updates a report status (presentation demo control).
- `DELETE /api/reports/:id` deletes a report.

For local development without Google configuration, the server writes reports to `.data/reports.json` (ignored by Git). Set `UNISON_DATA_DIR` to use another local directory.

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

The Apps Script bridge source and manifest are in `google-apps-script/`. If you edit the bridge later, save and deploy a new version of the web app. This prototype still has no resident accounts, staff authorization, or abuse protection. Anyone who can use the app can view or change its reports, so do not collect real personal or sensitive information or open it as a public civic service until those controls are added.

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
3. Before the first deployment, configure the local Google bridge in `.env` using `.env.example`. The first local request to `/api/reports` imports existing `.data/reports.json` records and photos into Sheets/Drive. Verify the records in the spreadsheet before deploying. The production Worker intentionally skips local-file migration because Worker files are not persistent.
4. Push the deployment files to `main`, or run **Actions → Deploy UNISON to Cloudflare Workers → Run workflow**. The workflow builds using the Cloudflare Nitro preset and deploys the app. The Worker URL will be shown in the workflow output or Cloudflare dashboard.
5. The workflow installs the two Google settings as Worker **secrets** after deployment. It uses the URL and shared secret from the GitHub Actions secrets above. Confirm the first deployment completed successfully before sharing the Worker URL.

The deployed report endpoints remain public for the class demo: visitors can read, submit, change demo statuses and delete reports. Use only fictional/sample content until access control and abuse protection are added.
