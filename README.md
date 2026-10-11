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

After submission, display a success message and a complaint reference ID. Store submitted reports locally so they can be viewed during the demo.

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

Save demo complaints using browser local storage where appropriate.

Include loading, empty, and success states.

Do not require user accounts, payments, or a complicated backend.

Do not claim complaints are sent to a real municipality.

Include a small footer stating that this is an educational prototype.

9. Final result

Generate the complete working website, not just a static mockup. Prioritize the dashboard, complaint form, issue tracking, emergency services, and responsive design. Keep the project lightweight and suitable for a four-member college group to explain during an IDT presentation.

## Development

You need Node.js and npm to develop and run the app locally.

```sh
git clone <this-repository-url>
cd smart-hood
npm install
npm run dev
```

Create and run a production build with:

```sh
npm run build
npm start
```
