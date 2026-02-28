# Smartwatch Heart Rate Debugger

This project is a browser-based smartwatch debugger that connects to a Bluetooth heart-rate sensor, reads live heart-rate values, and visualizes the data in real time.
---

## What This Code Does

At runtime, the app performs four main jobs:

1. Connects to a nearby Bluetooth smartwatch/heart-rate device.
2. Subscribes to heart-rate notifications from the device.
3. Stores incoming heart-rate values and computes summary statistics.
4. Plots both raw heart-rate and moving-average trends on a graph.

The UI updates continuously with:
- Current heart rate
- Full recent value history
- Average, minimum, and maximum values
- Time-series graph with smoothing (moving average)

---

## Project Structure

- index.html contains the app layout and includes for stylesheet and script.
- style.css contains all visual styling.
- script.js contains Bluetooth communication, heart-rate processing logic, and graph updates.

---

## Libraries and Platform APIs Used

### 1) Plotly.js

Plotly is loaded through a CDN in the HTML file.

It is used to render:
- Trace 1: Raw heart rate values (line + markers)
- Trace 2: Moving average (line)

### 2) Web Bluetooth API (browser built-in)

Used to discover and connect to BLE devices and access GATT services/characteristics.

Key APIs used:
- Bluetooth device request through the browser device chooser
- GATT server connection
- Access to the standard Heart Rate service
- Access to the Heart Rate Measurement characteristic
- Notification subscription for live heart-rate updates
- Notification event handling for every incoming reading

---

### Processing flow

Every time a new sensor notification arrives:

1. Read the heart-rate value from the measurement payload.
2. Update the current heart-rate display label.
3. Store the new sample in the heart-rate history array.
4. Recompute average, min, max.
5. Update the full recent heart-rate history text.
6. Replot chart with raw + moving average traces.

### BLE identifiers used

- Heart Rate Service UUID is 0x180D.
- Heart Rate Measurement Characteristic UUID is 0x2A37.

### Step-by-step access sequence

1. User clicks **Connect Smartwatch**.
2. Browser opens the Bluetooth chooser and lets the user select a compatible nearby device.
3. The selected device is connected using GATT.
4. The app requests access to the Heart Rate service.
5. The app requests access to the Heart Rate Measurement characteristic.
6. The app starts notifications so data is pushed continuously from device to browser.
7. On each notification, heart-rate data is decoded and applied to UI/stats/graph.

---

## Implementation

This section explains practical behavior in simple terms so you can understand why the app works and where it may need improvement.

### 1) How heart-rate bytes are interpreted

The app currently reads heart rate from the second byte of the measurement packet.

Simple packet view:

Byte 0  -> Flags (tells data format)
Byte 1  -> Heart Rate value (used by current app)
Byte 2+ -> Extra fields (optional, depends on flags)

- Many devices send 8-bit heart rate, so reading byte 1 works correctly.
- Some devices send 16-bit heart rate when a flag bit is enabled.
- In that case, reading only byte 1 may give an incorrect value.

Bit-level idea for the flags byte:

Byte 1 has 8 bits wherein 
- bit 0 signifies HR format flag
- rest of the bits are optional field indicators

HR format bit meaning:
- 0 means heart rate is 8-bit (1 byte)
- 1 means heart rate is 16-bit (2 bytes)

So a robust parser should first check this bit, then decide whether to read 1 byte or 2 bytes for bpm.

### 2) Device selection behavior

The app currently allows selecting any nearby Bluetooth device, and then it checks for heart-rate support.

Flow view:

Show all nearby devices
	|
User picks one device
	|
Try to open Heart Rate service
	|
If service exists -> continue
If service missing -> connection fails

## Execution

Because this is a static app, any static host works.

### Local

1. Open with a local static server (recommended) or on localhost.
2. Open in a Chromium-based browser that supports Web Bluetooth.
3. Click **Connect Smartwatch** and choose your device.

### Deployed (Vercel)

- The app can be deployed as static files.
- Browser still requires HTTPS and user interaction for Bluetooth access.

---