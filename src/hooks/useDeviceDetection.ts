import { useEffect, useState, useCallback } from "react";

interface DeviceInfo {
  id: string;
  category: "mobile" | "tablet" | "desktop" | "unknown";
  platform: string;
  hasTouch: boolean;
  firesTouch: boolean;
  keyboardLocation: "numpad" | "left" | "right" | "standard";
  firstSeen: number;
}

interface KeyEvent {
  type: "keydown";
  key: string;
  code: string;
  location: number;
  repeat: boolean;
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  isComposing: boolean;
  isTrusted: boolean;
  device: DeviceInfo;
  ts: number;
}

function detectDeviceFromEvent(ev: KeyboardEvent): DeviceInfo {
  // Experimental, may be undefined on many browsers
  const firesTouch =
    (ev as any).sourceCapabilities?.firesTouchEvents === true;

  const hasTouch =
    typeof navigator !== "undefined" &&
    (navigator.maxTouchPoints > 0 || "ontouchstart" in window);

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const uaData = (navigator as any)?.userAgentData;
  const platform = uaData?.platform ?? navigator.platform ?? "unknown";

  let category: "mobile" | "tablet" | "desktop" | "unknown" = "unknown";
  if (/Android/i.test(ua)) {
    category = /Mobile/i.test(ua) ? "mobile" : "tablet";
  } else if (/iPhone/i.test(ua)) {
    category = "mobile";
  } else if (/iPad|iPadOS/i.test(ua)) {
    category = "tablet";
  } else if (/Macintosh|Windows|Linux|CrOS/i.test(ua)) {
    category = "desktop";
  }

  const loc =
    ev.location === 3
      ? "numpad"
      : ev.location === 1
        ? "left"
        : ev.location === 2
          ? "right"
          : "standard";

  // Create a unique device ID based on device characteristics
  const deviceId = `${category}-${platform}-${hasTouch}-${firesTouch}-${loc}`;

  return {
    id: deviceId,
    category,
    platform,
    hasTouch,
    firesTouch,
    keyboardLocation: loc,
    firstSeen: Date.now(),
  };
}

export function useDeviceDetection() {
  const [detectedDevices, setDetectedDevices] = useState<Map<string, DeviceInfo>>(new Map());
  const [assignedDevices, setAssignedDevices] = useState<{
    player1?: DeviceInfo;
    player2?: DeviceInfo;
  }>({});

  const handleKeyDown = useCallback((ev: KeyboardEvent) => {
    const deviceInfo = detectDeviceFromEvent(ev);

    const payload: KeyEvent = {
      type: "keydown",
      key: ev.key,
      code: ev.code,
      location: ev.location, // 0=standard,1=left,2=right,3=numpad
      repeat: ev.repeat,
      ctrl: ev.ctrlKey,
      alt: ev.altKey,
      shift: ev.shiftKey,
      meta: ev.metaKey,
      isComposing: ev.isComposing,
      isTrusted: ev.isTrusted,
      device: deviceInfo,
      ts: Date.now(),
    };

    console.log("[input]", payload);

    // Update detected devices
    setDetectedDevices(prev => {
      const updated = new Map(prev);
      if (!updated.has(deviceInfo.id)) {
        updated.set(deviceInfo.id, deviceInfo);
      }
      return updated;
    });

    // Auto-assign devices, prioritizing numpads
    setAssignedDevices(prev => {
      const updated = { ...prev };
      
      // If this is a numpad and we don't have it assigned yet
      if (deviceInfo.keyboardLocation === "numpad") {
        if (!prev.player1 || prev.player1.keyboardLocation !== "numpad") {
          updated.player1 = deviceInfo;
        } else if (!prev.player2 || prev.player2.keyboardLocation !== "numpad") {
          // Only assign to player2 if it's a different numpad than player1
          if (prev.player1.id !== deviceInfo.id) {
            updated.player2 = deviceInfo;
          }
        }
      } else {
        // For non-numpad devices, assign to any free slot
        if (!prev.player1) {
          updated.player1 = deviceInfo;
        } else if (!prev.player2 && prev.player1.id !== deviceInfo.id) {
          updated.player2 = deviceInfo;
        }
      }
      
      return updated;
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const isDeviceAssignedToPlayer = useCallback((deviceId: string, playerNumber: 1 | 2): boolean => {
    const player = playerNumber === 1 ? assignedDevices.player1 : assignedDevices.player2;
    return player?.id === deviceId;
  }, [assignedDevices]);

  const getPlayerForDevice = useCallback((deviceId: string): 1 | 2 | null => {
    if (assignedDevices.player1?.id === deviceId) return 1;
    if (assignedDevices.player2?.id === deviceId) return 2;
    return null;
  }, [assignedDevices]);

  const resetDeviceAssignments = useCallback(() => {
    setAssignedDevices({});
    setDetectedDevices(new Map());
  }, []);

  return {
    detectedDevices: Array.from(detectedDevices.values()),
    assignedDevices,
    isDeviceAssignedToPlayer,
    getPlayerForDevice,
    resetDeviceAssignments,
  };
}

export function useLogKeydown() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onKeyDown = (ev: KeyboardEvent) => {
      const deviceInfo = detectDeviceFromEvent(ev);

      const payload = {
        type: "keydown",
        key: ev.key,
        code: ev.code,
        location: ev.location, // 0=standard,1=left,2=right,3=numpad
        repeat: ev.repeat,
        ctrl: ev.ctrlKey,
        alt: ev.altKey,
        shift: ev.shiftKey,
        meta: ev.metaKey,
        isComposing: ev.isComposing,
        isTrusted: ev.isTrusted,
        device: deviceInfo,
        ts: Date.now(),
      };

      console.log("[input]", payload);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
