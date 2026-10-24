# Island Treasures Wi-Fi Quest

Mobile web experience for guests arriving at Punta Langosta, Cozumel.

## Visitor flow

1. Accept the Wi-Fi terms and receive 10 complimentary minutes.
2. Follow the 1½-minute shortcut through Diamonds International to Island Treasures.
3. Obtain the Wi-Fi code at Island Treasures and unlock the extended session.
4. Optionally complete three stops: Island Treasures, Diamonds International and Island Booty.
5. Show the live completion screen at Island Booty and have staff mark the souvenir as claimed.

Progress and claim status persist on the visitor's device. Operational codes are validated by hashes and are not printed in the interface or documentation.

## Test mode

Append `?demo=1` to the URL to shorten the first session to 20 seconds and display the QA skip control. The normal URL uses the full 10-minute timer.

## UniFi captive-portal integration

The production build expects the page and the network services to share the same domain:

- `POST /api/free` with no parameters activates the complimentary 10-minute session.
- `POST /api/code` with JSON `{ "code": "XXXX" }` validates the cashier code and activates 60 minutes.
- A successful response is `{ "ok": true, "minutes": 10|60 }`.
- Supported errors are `invalid_code`, `already_used`, `expired` and `rate_limited`.

On localhost, GitHub Pages and URLs containing `?demo=1`, the interface stays in preview mode and does not call the production services. This keeps the public prototype usable while the same files remain ready to be hosted on the captive-portal server.

## Before launch

- Deliver this complete folder to the network administrator for same-domain hosting and a controlled UniFi test.
- Replace the working legal text with the approved company identity, privacy contact and promotion validity/stock.
- Confirm final operational codes and rotate them before public launch.
- Test on the actual Wi-Fi network and on current iPhone and Android devices.
