import { ValueOf } from "@/types/general";

export const MissionSocketEvents = {
  DEVICE_COMMAND: "device-command",
  DEVICE_STATUS_UPDATE: "device-status-update",
  JOIN_MISSION_ROOMS: "join-mission-rooms",
  SEND_MISSION_COMMAND: "send-mission-command",
  DEVICE_JOINED_MISSION: "device-joined-mission",
  DEVICE_LEFT_MISSION: "device-left-mission",
  PING: "ping",
} as const;

export type MissionSocketEvent = ValueOf<typeof MissionSocketEvents>;
