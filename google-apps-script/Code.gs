const HEADERS = ["id", "category", "neighborhood", "location", "description", "photoFileId", "date", "status"];
const MAX_TEXT = { location: 120, description: 1000 };

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const props = PropertiesService.getScriptProperties();
    if (!body.secret || body.secret !== props.getProperty("UNISON_SHARED_SECRET")) return output({ ok: false, error: "Unauthorized." });
    const result = withLock(function () { return dispatch(body, props); });
    return output({ ok: true, data: result });
  } catch (err) {
    console.error(err);
    return output({ ok: false, error: String(err && err.message ? err.message : "Storage request failed.") });
  }
}

function dispatch(body, props) {
  switch (body.action) {
    case "migrationStatus": return { complete: props.getProperty("UNISON_LOCAL_IMPORT_DONE") === "true" };
    case "importLocal": return importLocal(body.reports || [], props);
    case "list": return listReports();
    case "create": return createReport(body.report || {});
    case "updateStatus": return updateStatus(body.id, body.status);
    case "delete": return deleteReport(body.id);
    case "getPhoto": return getPhoto(body.id);
    default: throw new Error("Unsupported storage action.");
  }
}

function output(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function withLock(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}

function getSheet() {
  const id = PropertiesService.getScriptProperties().getProperty("UNISON_SHEET_ID");
  if (!id) throw new Error("Set UNISON_SHEET_ID in Apps Script properties.");
  const spreadsheet = SpreadsheetApp.openById(id);
  let sheet = spreadsheet.getSheetByName("Reports");
  if (!sheet) sheet = spreadsheet.insertSheet("Reports");
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  return sheet;
}

function getPhotoFolder() {
  const id = PropertiesService.getScriptProperties().getProperty("UNISON_PHOTO_FOLDER_ID");
  if (!id) throw new Error("Set UNISON_PHOTO_FOLDER_ID in Apps Script properties.");
  return DriveApp.getFolderById(id);
}

function safeCell(value) {
  const text = String(value == null ? "" : value);
  return /^[=+@-]/.test(text) ? "'" + text : text;
}

function rowToReport(row) {
  const date = row[6] instanceof Date ? row[6].toISOString() : String(row[6]);
  const report = { id: String(row[0]), category: String(row[1]), neighborhood: String(row[2]), location: String(row[3]), description: String(row[4]), date: date, status: String(row[7]) };
  if (row[5]) report.photo = "/api/reports/" + encodeURIComponent(report.id) + "/photo";
  return report;
}

function findRow(id) {
  if (!id || typeof id !== "string") return -1;
  const sheet = getSheet();
  if (sheet.getLastRow() < 2) return -1;
  const found = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).createTextFinder(id).matchEntireCell(true).findNext();
  return found ? found.getRow() : -1;
}

function listReports() {
  const sheet = getSheet();
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues().filter(function (r) { return r[0]; }).map(rowToReport).reverse();
}

function validateReport(r) {
  const categories = ["Pothole", "Damaged road", "Broken streetlight", "Garbage", "Drainage", "Waterlogging"];
  const neighborhoods = ["Green Park (demo)", "Lakeview (demo)", "Riverside (demo)", "Old Town (demo)"];
  if (!r || categories.indexOf(r.category) < 0 || neighborhoods.indexOf(r.neighborhood) < 0) throw new Error("Invalid report category or neighborhood.");
  if (typeof r.location !== "string" || !r.location.trim() || r.location.length > MAX_TEXT.location) throw new Error("Invalid report location.");
  if (typeof r.description !== "string" || !r.description.trim() || r.description.length > MAX_TEXT.description) throw new Error("Invalid report description.");
  if (r.photo && (typeof r.photo !== "string" || r.photo.length > 2000000 || r.photo.indexOf("data:image/jpeg;base64,") !== 0)) throw new Error("Invalid report photo.");
}

function savePhoto(dataUrl, reportId) {
  if (!dataUrl) return "";
  const prefix = "data:image/jpeg;base64,";
  if (dataUrl.indexOf(prefix) !== 0) throw new Error("Only JPEG photos are accepted.");
  const bytes = Utilities.base64Decode(dataUrl.slice(prefix.length));
  const blob = Utilities.newBlob(bytes, "image/jpeg", reportId + ".jpg");
  return getPhotoFolder().createFile(blob).getId();
}

function makeReport(r, existingId) {
  validateReport(r);
  const id = existingId || "UN-" + Utilities.getUuid().slice(0, 8).toUpperCase();
  const photoFileId = savePhoto(r.photo, id);
  return [id, safeCell(r.category), safeCell(r.neighborhood), safeCell(r.location.trim()), safeCell(r.description.trim()), photoFileId, new Date().toISOString(), "Submitted"];
}

function createReport(r) {
  const row = makeReport(r, null);
  getSheet().appendRow(row);
  return rowToReport(row);
}

function importLocal(reports, props) {
  if (props.getProperty("UNISON_LOCAL_IMPORT_DONE") === "true") return { imported: 0, complete: true };
  if (!Array.isArray(reports) || reports.length > 5000) throw new Error("Invalid local report migration payload.");
  const sheet = getSheet();
  const imported = [];
  reports.forEach(function (r) {
    if (!r || typeof r.id !== "string" || !r.id || findRow(r.id) !== -1) return;
    const row = makeReport(r, r.id);
    row[6] = r.date || new Date().toISOString();
    row[7] = ["Submitted", "Verified", "In Progress", "Resolved"].indexOf(r.status) >= 0 ? r.status : "Submitted";
    imported.push(row);
  });
  if (imported.length) sheet.getRange(sheet.getLastRow() + 1, 1, imported.length, HEADERS.length).setValues(imported);
  props.setProperty("UNISON_LOCAL_IMPORT_DONE", "true");
  return { imported: imported.length, complete: true };
}

function updateStatus(id, status) {
  if (["Submitted", "Verified", "In Progress", "Resolved"].indexOf(status) < 0) throw new Error("Invalid report status.");
  const rowNumber = findRow(id);
  if (rowNumber < 0) return null;
  const sheet = getSheet();
  sheet.getRange(rowNumber, 8).setValue(status);
  return rowToReport(sheet.getRange(rowNumber, 1, 1, HEADERS.length).getValues()[0]);
}

function deleteReport(id) {
  const rowNumber = findRow(id);
  if (rowNumber < 0) return false;
  const sheet = getSheet();
  const photoId = sheet.getRange(rowNumber, 6).getValue();
  if (photoId) { try { DriveApp.getFileById(String(photoId)).setTrashed(true); } catch (err) { console.warn("Photo file was already unavailable.", err); } }
  sheet.deleteRow(rowNumber);
  return true;
}

function getPhoto(id) {
  const rowNumber = findRow(id);
  if (rowNumber < 0) return null;
  const fileId = getSheet().getRange(rowNumber, 6).getValue();
  if (!fileId) return null;
  const blob = DriveApp.getFileById(String(fileId)).getBlob();
  return { mimeType: "image/jpeg", base64: Utilities.base64Encode(blob.getBytes()) };
}
