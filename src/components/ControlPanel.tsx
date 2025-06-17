"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useSocket } from "@/hooks/use-socket.hooks";
import { MissionSocketEvents } from "@/types/socket";

const MISSIONS = ["mission-a", "mission-b", "mission-c"];

export const ControlPanel = () => {
  const [command, setCommand] = useState("");
  const [activeMission, setActiveMission] = useState(MISSIONS[0]);
  const [selectedDevice, setSelectedDevice] = useState<string>("ALL");
  const [logs, setLogs] = useState<Record<string, string[]>>({});
  const [joinedMissions, setJoinedMissions] = useState<string[]>([]);
  const [devicesByMission, setDevicesByMission] = useState<
    Record<string, string[]>
  >({});
  const [connected, setConnected] = useState(false);
  const [deviceStatuses, setDeviceStatuses] = useState<
    Record<string, { status: string; timestamp: number }>
  >({});

  const socket = useSocket({
    query: { role: "controller" },
  });

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit(
        MissionSocketEvents.JOIN_MISSION_ROOMS,
        { missions: MISSIONS },
        (ack) => {
          if (ack.status === "success") {
            setJoinedMissions(ack.data.joined);
            setDevicesByMission(ack.data.devices);
          } else {
            console.error("Join failed:", ack.reason);
          }
        },
      );
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on(MissionSocketEvents.DEVICE_STATUS_UPDATE, (data) => {
      const key = `${data.missionId}:${data.deviceId}`;
      const entry = `📡 ${data.status} @ ${new Date(data.timestamp).toLocaleTimeString()}`;
      setLogs((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), entry],
      }));
      const deviceKey = `${data.missionId}:${data.deviceId}`;
      setDeviceStatuses((prev) => ({
        ...prev,
        [deviceKey]: { status: data.status, timestamp: data.timestamp },
      }));
    });

    socket.on(
      MissionSocketEvents.DEVICE_JOINED_MISSION,
      ({ missionId, deviceId }) => {
        setDevicesByMission((prev) => ({
          ...prev,
          [missionId]: [...(prev[missionId] || []), deviceId],
        }));

        const keyAll = missionId; // For broadcast container
        setLogs((prev) => ({
          ...prev,
          [keyAll]: [
            ...(prev[keyAll] || []),
            `✅ Device "${deviceId}" joined mission`,
          ],
        }));
      },
    );

    socket.on(MissionSocketEvents.DEVICE_LEFT_MISSION, (data) => {
      const { missionId, deviceId } = data;
      setDevicesByMission((prev) => ({
        ...prev,
        [missionId]: (prev[missionId] || []).filter((id) => id !== deviceId),
      }));

      // Also remove device status, as it's no longer connected
      setDeviceStatuses((prev) => {
        const newStatuses = { ...prev };
        delete newStatuses[`${missionId}:${deviceId}`];
        return newStatuses;
      });

      // Add a log entry for the disconnection
      const keyAll = missionId;
      setLogs((prev) => ({
        ...prev,
        [keyAll]: [
          ...(prev[keyAll] || []),
          `❌ Device "${deviceId}" disconnected from mission`,
        ],
      }));

      // If the disconnected device was currently selected, reset selection
      if (activeMission === missionId && selectedDevice === deviceId) {
        setSelectedDevice("ALL");
      }
    });

    return () => {
      socket.off(MissionSocketEvents.DEVICE_STATUS_UPDATE);
      socket.off(MissionSocketEvents.DEVICE_JOINED_MISSION);
      socket.off(MissionSocketEvents.DEVICE_LEFT_MISSION); // Clean up new event listener
    };
  }, [socket]);

  const sendCommand = () => {
    if (!command.trim()) return;

    if (selectedDevice === "ALL") {
      socket?.emit(
        MissionSocketEvents.SEND_MISSION_COMMAND,
        { missionId: activeMission, command, from: "controller" },
        (res) => {
          const entry =
            res.status === "error"
              ? `❌ Error: ${res.reason}`
              : `✅ Broadcasted to all devices in ${activeMission}`;
          setLogs((prev) => ({
            ...prev,
            [activeMission]: [...(prev[activeMission] || []), entry],
          }));
        },
      );
    } else {
      socket?.emit(
        MissionSocketEvents.DEVICE_COMMAND,
        {
          missionId: activeMission,
          deviceId: selectedDevice,
          command,
          from: "controller",
        },
        (res) => {
          const key = `${activeMission}:${selectedDevice}`;
          const entry =
            res.status === "error"
              ? `❌ Error: ${res.reason}`
              : `✅ Delivered to ${res.data.deliveredTo}`;
          setLogs((prev) => ({
            ...prev,
            [key]: [...(prev[key] || []), entry],
          }));
        },
      );
    }

    setCommand("");
  };

  return (
    <Card className="max-w-3xl mx-auto mt-10 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-blue-600">
          <span className="flex gap-2 items-center">
            <Badge variant="outline">Controller</Badge> Mission Command
          </span>
          <span
            className={`text-xs ${connected ? "text-green-600" : "text-red-500"}`}
          >
            {connected ? "🟢 Connected" : "🔴 Disconnected"}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs value={activeMission} onValueChange={setActiveMission}>
          <TabsList className="mb-4">
            {MISSIONS.map((mission) => (
              <TabsTrigger key={mission} value={mission}>
                {mission}
                {joinedMissions.includes(mission) && (
                  <span className="ml-1 text-green-600">✔</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {MISSIONS.map((mission) => {
            const devices = devicesByMission[mission] || [];
            return (
              <TabsContent key={mission} value={mission}>
                <div className="flex gap-2 mb-4">
                  <Input
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder={`Command for ${selectedDevice}`}
                    className="flex-1"
                  />
                  <Select
                    value={selectedDevice}
                    onValueChange={setSelectedDevice}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select device" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Devices</SelectItem>
                      {devices.map((id) => (
                        <SelectItem key={id} value={id}>
                          {id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={sendCommand}
                    disabled={!connected || devices.length === 0}
                  >
                    Send
                  </Button>
                </div>

                {devices.length === 0 ? (
                  <p className="text-sm italic text-muted-foreground">
                    No devices in this mission.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {devices.map((id) => {
                      const key = `${mission}:${id}`;
                      return (
                        <div key={id}>
                          <div className="mb-1 flex justify-between items-center">
                            <h4 className="text-sm font-medium text-muted-foreground">
                              {id}
                            </h4>
                            {deviceStatuses[`${mission}:${id}`] ? (
                              <span className="text-xs text-blue-600">
                                {deviceStatuses[`${mission}:${id}`].status} @{" "}
                                {new Date(
                                  deviceStatuses[`${mission}:${id}`].timestamp,
                                ).toLocaleTimeString()}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">
                                No status
                              </span>
                            )}
                          </div>
                          <ScrollArea className="h-32 rounded-md border bg-muted p-2">
                            {(logs[key]?.length ?? 0) === 0 ? (
                              <p className="text-xs italic text-muted-foreground">
                                No logs yet.
                              </p>
                            ) : (
                              <ul className="space-y-1">
                                {logs[key].map((entry, i) => (
                                  <li
                                    key={i}
                                    className={`text-xs ${
                                      entry.includes("Error") ||
                                      entry.includes("disconnected") // Highlight disconnects in red
                                        ? "text-red-500"
                                        : "text-gray-800"
                                    }`}
                                  >
                                    {entry}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </ScrollArea>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>

      <CardFooter className="justify-end text-xs text-muted-foreground">
        Managing missions: {MISSIONS.join(", ")}
      </CardFooter>
    </Card>
  );
};
