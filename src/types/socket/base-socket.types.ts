import { z } from 'zod';
import {Ack} from "@/helpers/ack.utils";

export type SocketData = Record<string, unknown>; // can override


export type SocketEventHandler<EventPayload = any, AckPayload = any> = (
  payload: EventPayload,
  ack?: (ack: Ack<AckPayload>) => void
) => void;

export const PingAckPayloadSchema = z.object({
  pong: z.string(),
});

export type PingAckPayload = z.infer<typeof PingAckPayloadSchema>;

export const PingSchema = z.string().min(1);
export type PingPayload = z.infer<typeof PingSchema>;
