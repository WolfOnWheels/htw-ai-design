# AI in Design & Business Communication — HTW Berlin

Course website for the seminar: 26 research topics in six clusters, with sign-up (two places per topic). Built on the HTW Berlin corporate design.

Live: https://wolfonwheels.github.io/htw-ai-design/

## Sign-up backend (Google Sheet)

Sign-ups are stored in a Google Sheet through a small Apps Script web app. The page only ever receives topic, place and name; emails stay in the sheet.

1. Create a new Google Sheet (for example "HTW AI Design – Sign-ups").
2. Open **Extensions → Apps Script**, replace the default code with [`apps-script/Code.gs`](apps-script/Code.gs) and save.
3. Click **Deploy → New deployment**, choose type **Web app**, set *Execute as* to **Me** and *Who has access* to **Anyone**, then **Deploy** and authorize.
4. Copy the web app URL (it ends in `/exec`) and put it into `index.html`:
   ```js
   const API = 'https://script.google.com/macros/s/…/exec';
   ```
5. Commit and push. Until `API` is set, the page shows "Sign-up opens soon".

The script allows two places per topic and one place per email address. To remove a sign-up, delete its row in the sheet; the page picks it up within 30 seconds. Students can withdraw from the browser they signed up in.

## End of semester

All submissions will be published here: a homepage with one tile per topic, linking to each artifact, process log and sources.

---

Font: HTWBerlin by Jürgen Huber/Malte Herok, CC BY-NC-ND 4.0, for HTW Berlin purposes only. Logo: HTW Berlin word-and-image mark (DPMA 30 2013 051 492), used under the HTW Berlin corporate design terms.
