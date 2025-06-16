# 🧭 MissionCenter Client

**MissionCenter Client** is a real-time dashboard and device interface built with **Next.js 15**, enabling dynamic mission control and device-level communication using **Socket.IO**.

The system provides two distinct views tailored for different roles:

- **Control Panel** – for operators to send commands and monitor device statuses across multiple missions.
- **Device Screen** – for individual mission devices to receive commands and participate in real-time updates.

---

## ⚙️ Tech Stack

- **Framework**: [Next.js 15 (App Router)]
- **Language**: TypeScript
- **UI Library**: [shadcn/ui]
- **Realtime Layer**: [Socket.IO Client]
- **Styling**: Tailwind CSS

---

## 📦 Features

### 🎛 Control Panel

- Connect to multiple mission rooms
- View devices connected to each mission in real-time
- Send:
    - Mission-wide commands (`SEND_MISSION_COMMAND`)
    - Direct device-level commands (`DEVICE_COMMAND`)
- View detailed command delivery logs and device status updates per mission

### 📲 Device Interface

- Connect as a specific device using a `deviceId` from the URL
- Dynamically select and join one or more missions
- Receive and log:
    - Commands sent directly to the device
    - Broadcasted mission-level commands
- Display live mission connection status and logs

---

## 🧩 Application Structure

- `app/` – Routes for Home, Control Panel, and dynamic Device pages
- `components/` – Shared UI building blocks
- `hooks/` – Custom `useSocket` hook for Socket.IO integration
- `types/` – Shared TypeScript definitions for socket payloads and events
- `lib/` – Utility functions and helpers

---

## 🚦 Usage

### Local Development

```bash
pnpm install
pnpm dev
```

### Environment Setup

Configure the Socket.IO server endpoint and connection options inside the `useSocket` hook or via `.env.local`.

---

## 📁 Pages

- `/` – Home screen with navigation
- `/control-panel` – Mission controller interface
- `/device/[deviceId]` – Device UI view using path param

---

## 🧠 Future Improvements

- Authentication for device and controller roles
- Device connection retry & resilience strategies
- Command history persistence (e.g., localStorage or backend DB)
- Visual mission activity graphs

---

## 📍 Project Goals

MissionCenter Client aims to serve as a minimal but powerful interface for interacting with mission-critical devices using real-time WebSocket communication. Its goal is to be easily extendable for remote operations, testing labs, simulations, and educational use cases where device/command interactions need to be simulated or visualized clearly.
