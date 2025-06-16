"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Home() {
  const [deviceId, setDeviceId] = useState("");
  const router = useRouter();

  const goToDevice = () => {
    if (!deviceId.trim()) return;
    router.push(`/device/${deviceId.trim()}`);
  };

  const goToController = () => {
    router.push("/control-panel");
  };

  return (
    <main className="flex justify-center items-center h-screen bg-muted px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-blue-600">
            Socket Command System
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Controller Navigation */}
          <div className="space-y-2">
            <h4 className="font-semibold">Control Panel</h4>
            <Button className="w-full" onClick={goToController}>
              Go to Controller
            </Button>
          </div>

          {/* Device Navigation */}
          <div className="space-y-2">
            <h4 className="font-semibold">Connect as Device</h4>
            <Input
              placeholder="Enter Device ID"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
            />
            <Button
              className="w-full"
              onClick={goToDevice}
              disabled={!deviceId.trim()}
            >
              Go to Device
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
