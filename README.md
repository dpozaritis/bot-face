# Robot Face Studio

React frontend for the Personal Robot project. Eight expressions, gaze controls, brightness, color, blinking, speaking animation, expression demo, face-only view and local preference saving. Speaking is animation only: no microphone, speech synthesis or AI is included yet.

## Run on your Mac

Install Node.js 22.12+ (22 LTS recommended). Unzip, open Terminal in this folder, then:

```sh
npm install
npm start
```

Open the Local URL printed by Vite. To test on your iPhone on the same trusted Wi-Fi, open Vite's Network URL in Safari. The development server listens on your network; use a trusted network and stop it with Control-C when finished. The Mac must be awake for this local test.

## Publish later to GitHub Pages

Create a GitHub repository and push the contents of this folder, including `.github`, with `package.json` at the repository root. In Settings > Pages, choose GitHub Actions as the source. Push to `main` or manually run the deployment workflow. The included workflow builds `dist` and deploys it. Relative asset paths support repository subpaths. No publication has been performed for you.

Open the resulting HTTPS URL in Safari on your iPhone, choose Share > Add to Home Screen (enable Open as Web App if offered). The face UI runs on the iPhone itself. Your Mac can be off for the hosted UI; the initial load still needs internet. This version does not cache the app for offline use.

Official references: https://vite.dev/guide/static-deploy.html and https://support.apple.com/en-lamr/guide/iphone/iphea86e5236/ios

## Mac backend and future ESP32

GitHub Pages hosts static frontend files, not your AI or a persistent backend. A future Mac backend can run the model/agent and coordinate state between the iPhone and ESP32. The Mac needs to be awake and reachable for those features. The frontend includes a WebSocket client but no backend service or ESP32 firmware. Local preview needs neither.

Use the connection panel only with a backend implementing this protocol. An HTTPS frontend requires a secure `wss://` endpoint; plain `ws://` is only for local HTTP development. A backend at `localhost` on an iPhone means the iPhone, not the Mac. Remote access requires a separately configured authenticated connection, such as a private VPN with appropriate HTTPS/WSS serving. Do not expose an unauthenticated server directly to the internet. No credentials belong in the public repository.

## Protocol v1

Outbound message:

```json
{"version":1,"type":"face.set","state":{"expression":"happy","gazeX":0,"gazeY":0,"brightness":1,"color":"#99f6cf","autoBlink":true,"speaking":false}}
```

Incoming authoritative state: same shape with `type: "face.state"`. State fields are all required. Expressions: neutral, happy, curious, sleepy, sad, surprised, angry, love. Gaze coordinates -1 to 1; brightness 0.2 to 1. Color is a six-digit hex value. Backend must validate messages and authenticate clients. It should broadcast authoritative state only when values change, excluding the originating socket to avoid echo loops. This client sends its current state on connection; choose an authority policy when building the real backend. Connection is manual, with no automatic retries.

React and CSS do not run on an ESP32. Future firmware must implement its own display renderer, mapping these shared expression names and gaze values to the selected hardware. This shared command boundary reduces future frontend changes; it does not replace firmware development. Visual parity depends on the selected display.

## Validation

`npm run build` checks production bundling. Actual Safari, physical hardware, remote connection, and backend integration must be tested separately. If you modify dependencies, commit the updated lockfile for GitHub Actions.
