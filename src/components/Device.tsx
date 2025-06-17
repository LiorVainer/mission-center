"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useSocket } from "@/hooks/use-socket.hooks";
import {
  DEVICE_STATUS_OPTIONS,
  DeviceCommandPayload,
  DeviceStatus,
  DeviceStatusUpdatePayload,
  DeviceStatusUpdateSchema,
  MissionSocketEvents,
  SendMissionCommandPayload,
} from "@/types/socket";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
import { Button } from "./ui/button";

const ALL_MISSIONS = ["mission-a", "mission-b", "mission-c"];

type CommandEntry = {
  type: "device" | "mission";
  missionId: string;
  command: string;
  from: string;
  timestamp: number;
};

export const Device = () => {
  const params = useParams();
  const deviceId =
    typeof params.deviceId === "string" ? params.deviceId : "unknown-device";

  const socket = useSocket({
    query: { deviceId },
  });

  const [connected, setConnected] = useState(false);
  const [selectedMissions, setSelectedMissions] = useState<string[]>([]);
  const [joinedMissions, setJoinedMissions] = useState<string[]>([]);
  const [commandLog, setCommandLog] = useState<CommandEntry[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<DeviceStatus | "">("");
  const [selectedMissionForStatus, setSelectedMissionForStatus] =
    useState<string>("");
  const [statusAck, setStatusAck] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.off(MissionSocketEvents.DEVICE_COMMAND);
      socket.off(MissionSocketEvents.SEND_MISSION_COMMAND);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || selectedMissions.length === 0) return;

    const newMissions = selectedMissions.filter(
      (m) => !joinedMissions.includes(m),
    );

    if (newMissions.length === 0) return;

    socket.emit(
      MissionSocketEvents.JOIN_MISSION_ROOMS,
      { missions: newMissions },
      (ack) => {
        if (ack.status === "success") {
          setJoinedMissions((prev) => [...prev, ...ack.data.joined]);
        }
      },
    );
  }, [socket, selectedMissions, joinedMissions]);

  useEffect(() => {
    if (!socket) return;

    socket.on(
      MissionSocketEvents.DEVICE_COMMAND,
      (payload: DeviceCommandPayload) => {
        setCommandLog((prev) => [
          ...prev,
          {
            type: "device",
            missionId: payload.missionId,
            command: payload.command,
            from: payload.from ?? "controller",
            timestamp: Date.now(),
          },
        ]);
      },
    );

    socket.on(
      MissionSocketEvents.SEND_MISSION_COMMAND,
      (payload: SendMissionCommandPayload) => {
        setCommandLog((prev) => [
          ...prev,
          {
            type: "mission",
            missionId: payload.missionId,
            command: payload.command,
            from: payload.from ?? "controller",
            timestamp: Date.now(),
          },
        ]);
      },
    );

    socket.on(MissionSocketEvents.DEVICE_LEFT_MISSION, (payload) => {
      setCommandLog((prev) => [
        ...prev,
        {
          from: "server",
          type: "device",
          missionId: payload.missionId, // Device can see which mission it disconnected from
          command: `Device ${payload.deviceId} disconnected from mission.`,
          timestamp: Date.now(),
        },
      ]);
      setJoinedMissions((prev) => prev.filter((m) => m !== payload.missionId));
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off(MissionSocketEvents.DEVICE_COMMAND);
      socket.off(MissionSocketEvents.SEND_MISSION_COMMAND);
      socket.off(MissionSocketEvents.DEVICE_LEFT_MISSION);
    };
  }, [socket]);

  return (
    <Card className="max-w-2xl mx-auto mt-10 shadow-md">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span className="flex gap-2 items-center">
            <Badge variant="outline">Device</Badge> {deviceId}
          </span>
          <span
            className={cn(
              "text-xs",
              connected ? "text-green-600" : "text-red-500",
            )}
          >
            {connected ? "🟢 Connected" : "🔴 Disconnected"}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="mb-4 space-y-2">
          <h4 className="font-medium">Select Missions to Join:</h4>

          <MultiSelect
            options={ALL_MISSIONS.map((id) => ({ value: id, label: id }))}
            value={selectedMissions}
            onValueChange={setSelectedMissions}
          />

          <div>
            <h4 className="font-medium mb-1">Joined Missions:</h4>
            {joinedMissions.length === 0 ? (
              <p className="text-muted-foreground italic">
                Not in any mission rooms yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {joinedMissions.map((id) => (
                  <Badge key={id} variant="default">
                    {id}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <h4 className="font-medium mb-1">Command Log:</h4>
        <ScrollArea className="h-64 border rounded-md bg-muted p-3">
          {commandLog.length === 0 ? (
            <p className="text-muted-foreground italic">
              No commands received.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {commandLog.map((cmd, idx) => (
                <li key={idx} className="text-gray-800">
                  <span className="font-semibold">
                    {cmd.type.toUpperCase()}
                  </span>{" "}
                  |{" "}
                  <span className="text-blue-600">
                    Mission: {cmd.missionId}
                  </span>{" "}
                  | <span>Cmd: {cmd.command}</span> |{" "}
                  <span className="text-muted-foreground">
                    From: {cmd.from}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
        <div className="mt-6 space-y-2">
          <h4 className="font-medium">Send Device Status Update:</h4>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Mission Selector */}
            <div className="w-full sm:w-1/3">
              <Select
                value={selectedMissionForStatus}
                onValueChange={setSelectedMissionForStatus}
              >
                <SelectTrigger className={"w-full"}>
                  {selectedMissionForStatus || "Select Mission"}
                </SelectTrigger>
                <SelectContent>
                  {joinedMissions.map((id) => (
                    <SelectItem key={id} value={id}>
                      {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Selector */}
            <div className="w-full sm:w-1/3">
              <Select
                value={selectedStatus}
                onValueChange={(val) => setSelectedStatus(val as DeviceStatus)}
              >
                <SelectTrigger className={"w-full"}>
                  {selectedStatus ? selectedStatus : "Select Status"}
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(DEVICE_STATUS_OPTIONS) as [
                      DeviceStatus,
                      string,
                    ][]
                  ).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Send Button */}
            <Button
              disabled={!selectedStatus || !selectedMissionForStatus}
              className="flex-1"
              onClick={() => {
                if (!socket) return;

                const payload: DeviceStatusUpdatePayload = {
                  missionId: selectedMissionForStatus,
                  deviceId,
                  status: selectedStatus,
                  timestamp: Date.now(),
                };

                const parsed = DeviceStatusUpdateSchema.safeParse(payload);
                if (!parsed.success) {
                  console.warn("Invalid status payload", parsed.error);
                  return;
                }

                socket.emit(
                  MissionSocketEvents.DEVICE_STATUS_UPDATE,
                  payload,
                  (ack) => {
                    setStatusAck(ack.status === "success");
                    setTimeout(() => setStatusAck(false), 3000);
                  },
                );
              }}
            >
              Send
            </Button>
          </div>

          {statusAck && (
            <p className="text-green-600 text-sm">
              ✅ Status update received by server
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
