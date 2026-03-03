IIT-BBS MenuBoard
A responsive hostel mess menu web app with multi-hall support, dark mode, and live Google Sheets integration.

Live Demo
https://dattarajdhatbale.github.io/IIT-BBS-MenuBoard/
https://iit-bbs-menuboard.netlify.app/

How It Works
Menu data is maintained in a public Google Sheet.
The app fetches data using:
https://opensheet.elk.sh/{spreadsheet-id}/Sheet1

Data is filtered by
Selected Residential Hall
Selected Day
The relevant menu is dynamically injected into the DOM.

All logic is handled in script.js written in JS
Styling is handled in style.css written in CSS3
Structure is defined in index.html written in HTML5

No frameworks. No backend. Fully frontend-powered.
