import {
  DeviceCommandPayload,
  DeviceJoinedMissionPayload,
  DeviceStatusUpdatePayload,
  JoinMissionRoomsPayload,
  SendMissionCommandPayload,
} from "./socket-events-payload.types";
import {
  DeviceCommandAckPayload,
  DeviceStatusUpdateAckPayload,
  JoinMissionRoomsAckPayload,
  SendMissionCommandAckPayload,
} from "./socket-ack-payloads.types";
import { MissionSocketEvents } from "./socket-events-names.types";
import { SocketEventHandler } from "@/types/socket/base-socket.types";

export interface MissionSocketCTSEventMap {
  [MissionSocketEvents.DEVICE_STATUS_UPDATE]: SocketEventHandler<
    DeviceStatusUpdatePayload,
    DeviceStatusUpdateAckPayload
  >;
  [MissionSocketEvents.DEVICE_COMMAND]: SocketEventHandler<
    DeviceCommandPayload,
    DeviceCommandAckPayload
  >;
  [MissionSocketEvents.JOIN_MISSION_ROOMS]: SocketEventHandler<
    JoinMissionRoomsPayload,
    JoinMissionRoomsAckPayload
  >;
  [MissionSocketEvents.SEND_MISSION_COMMAND]: SocketEventHandler<
    SendMissionCommandPayload,
    SendMissionCommandAckPayload
  >;
}
export interface MissionSocketSTCEventMap extends MissionSocketCTSEventMap {
  [MissionSocketEvents.DEVICE_JOINED_MISSION]: SocketEventHandler<
    DeviceJoinedMissionPayload,
    void
  >;
}

export type ClientToServerEvents = MissionSocketCTSEventMap;
export type ServerToClientEvents = MissionSocketSTCEventMap;
