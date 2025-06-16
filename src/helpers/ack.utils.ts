// types/ack.ts

export interface AckSuccess<T = any> {
  status: 'success';
  data: T;
}

export interface AckError {
  status: 'error';
  reason: string;
}

export type Ack<T = any> = AckSuccess<T> | AckError;

export const ackSuccess = <T>(data: T): AckSuccess<T> => ({
  status: 'success',
  data,
});

export const ackError = (reason: string): AckError => ({
  status: 'error',
  reason,
});

export const isAckSuccess = <T = unknown>(ack: Ack<T>): ack is AckSuccess<T> =>
    ack.status === 'success';

export const isAckError = (ack: Ack<any>): ack is AckError =>
    ack.status === 'error';
