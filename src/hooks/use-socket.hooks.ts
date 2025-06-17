"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@/types/socket";

type SocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseSocketOptions {
  query: Record<string, string>;
  namespace?: string;
}

export function useSocket({
  query,
  namespace = "/socket",
}: UseSocketOptions): SocketClient | null {
  const [socket, setSocket] = useState<SocketClient | null>(null);
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  useEffect(() => {
    const socketInstance: SocketClient = io(
      serverUrl ? `${serverUrl}${namespace}` : namespace,
      {
        transports: ["websocket"],
        query,
      },
    );

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return socket;
}
