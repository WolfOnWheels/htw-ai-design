/**
 * Sign-up backend for the HTW Berlin course page "AI in Design & Business Communication".
 * Paste into Extensions > Apps Script of a Google Sheet, then Deploy > New deployment > Web app
 * (Execute as: Me, Who has access: Anyone). Copy the /exec URL into the page.
 *
 * The page only ever receives topic, place and name. Emails and withdraw tokens stay in the sheet.
 */
const SHEET = 'Signups';
const TOPICS = 26;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sheet_() {
  const ss = SpreadsheetApp.getActive();
  let s = ss.getSheetByName(SHEET);
  if (!s) {
    s = ss.insertSheet(SHEET);
    s.appendRow(['topic', 'place', 'name', 'email', 'signed_up', 'token']);
    s.setFrozenRows(1);
  }
  return s;
}

function rows_() {
  const values = sheet_().getDataRange().getValues();
  return values.slice(1)
    .map((r, i) => ({ row: i + 2, topic: Number(r[0]), slot: Number(r[1]), name: String(r[2]), email: String(r[3]), token: String(r[5]) }))
    .filter(r => r.topic);
}

function status_() {
  return rows_().map(r => ({ topic: r.topic, slot: r.slot, name: r.name.replace(/^'/, '') }));
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Stops names like "=HYPERLINK(...)" from running as formulas in the sheet.
function clean_(s, max) {
  s = String(s || '').trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function doGet() {
  return out_({ ok: true, slots: status_() });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse((e.postData && e.postData.contents) || '{}');
    const topic = Number(d.topic), slot = Number(d.slot);

    if (d.action === 'signup') {
      const name = clean_(d.name, 80), email = String(d.email || '').trim().slice(0, 120);
      if (!(topic >= 1 && topic <= TOPICS) || (slot !== 1 && slot !== 2) || !name || !EMAIL.test(email)) {
        return out_({ ok: false, error: 'invalid' });
      }
      const rows = rows_();
      if (rows.some(r => r.topic === topic && r.slot === slot)) return out_({ ok: false, error: 'taken', slots: status_() });
      if (rows.some(r => r.email.toLowerCase() === email.toLowerCase())) return out_({ ok: false, error: 'duplicate', slots: status_() });
      const token = Utilities.getUuid();
      sheet_().appendRow([topic, slot, name, email, new Date(), token]);
      return out_({ ok: true, token: token, slots: status_() });
    }

    if (d.action === 'withdraw') {
      const r = rows_().find(r => r.topic === topic && r.slot === slot && r.token && r.token === String(d.token));
      if (!r) return out_({ ok: false, error: 'notfound', slots: status_() });
      sheet_().deleteRow(r.row);
      return out_({ ok: true, slots: status_() });
    }

    return out_({ ok: false, error: 'unknown' });
  } finally {
    lock.releaseLock();
  }
}
