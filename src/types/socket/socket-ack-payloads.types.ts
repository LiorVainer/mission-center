import { z } from 'zod';

export const DeviceCommandAckPayloadSchema = z.object({
  deliveredTo: z.string().min(1),
});
export type DeviceCommandAckPayload = z.infer<typeof DeviceCommandAckPayloadSchema>;

export const DeviceStatusUpdateAckPayloadSchema = z.object({
  received: z.boolean(),
});

export type DeviceStatusUpdateAckPayload = z.infer<typeof DeviceStatusUpdateAckPayloadSchema>;

export const JoinMissionRoomsAckPayloadSchema = z.object({
  joined: z.array(z.string()),
  devices: z.record(z.string(), z.array(z.string())),
});

export type JoinMissionRoomsAckPayload = z.infer<typeof JoinMissionRoomsAckPayloadSchema>;

export const SendMissionCommandAckPayloadSchema = z.object({
  deliveredTo: z.string(),
});
export type SendMissionCommandAckPayload = z.infer<typeof SendMissionCommandAckPayloadSchema>;