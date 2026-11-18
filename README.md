# Island Treasures Treasure Quest

Mobile web experience opened voluntarily from an official Island Treasures QR/NFC piece at Plaza Punta Langosta, Cozumel.

## Two separate visitor flows

### Free Wi-Fi

1. A promoter at the cruise arrival area advertises free Wi-Fi and directs visitors to Island Treasures.
2. Island Treasures staff provides the venue's Wi-Fi access instructions or code.
3. The venue and its network administrator manage the connection. This website does not redirect, authenticate or authorize Wi-Fi devices.

### Treasure Quest

1. At Island Treasures, a staff member presents a reusable 3D-printed QR/NFC piece.
2. The visitor taps or scans it to open this website, then returns the piece immediately.
3. The visitor enters one code at Island Treasures, a second at Diamonds International and a final code at Island Booty.
4. The live completion screen is shown at Island Booty and staff marks the souvenir as claimed.

The QR and NFC should contain the same public URL:

`https://pmscorporation.github.io/island-treasures-quest/`

## Technical behavior

- Static HTML, CSS and JavaScript; no backend is required for the prototype.
- No automatic captive-portal redirect and no calls to the Wi-Fi controller.
- No personal data is requested.
- Mission progress and claim status are stored only in the visitor's browser.
- Operational mission codes are validated by hashes and are not printed in the interface or documentation.

## Before launch

- Confirm the three participating stores and operational codes.
- Approve the promotion terms, reward inventory and validity period.
- Test the QR and NFC URL on current iPhone and Android devices.
- Keep the reusable QR/NFC piece at the counter or attached to a lanyard so visitors scan it without taking it away.
