import z from "zod";

// DEVICE_COMMAND
export const DeviceCommandSchema = z.object({
  missionId: z.string().min(1),
  deviceId: z.string().min(1),
  command: z.string().min(1),
  from: z.string().optional(),
});
export type DeviceCommandPayload = z.infer<typeof DeviceCommandSchema>;

// DEVICE_STATUS_UPDATE
export const DeviceStatusUpdateSchema = z.object({
  missionId: z.string().min(1),
  deviceId: z.string().min(1),
  status: z.string().min(1),
  timestamp: z.number().int().positive(),
});
export type DeviceStatusUpdatePayload = z.infer<
  typeof DeviceStatusUpdateSchema
>;

export const JoinMissionRoomsSchema = z.object({
  missions: z.array(z.string().min(1)).min(1),
});
export type JoinMissionRoomsPayload = z.infer<typeof JoinMissionRoomsSchema>;

export const SendMissionCommandSchema = z.object({
  missionId: z.string().min(1),
  command: z.string().min(1),
  from: z.string().optional(),
});
export type SendMissionCommandPayload = z.infer<
  typeof SendMissionCommandSchema
>;

export const DeviceJoinedMissionPayloadSchema = z.object({
  missionId: z.string().min(1),
  deviceId: z.string().min(1),
});

export type DeviceJoinedMissionPayload = z.infer<
  typeof DeviceJoinedMissionPayloadSchema
>;
