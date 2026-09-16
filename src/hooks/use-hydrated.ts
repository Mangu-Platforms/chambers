import { useEffect, useState } from "react";
import { useResumeStore } from "@/lib/resume/store";

export function useHydrated() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const api = useResumeStore.persist;
    const finish = () => {
      useResumeStore.getState().setHydrated();
      setReady(true);
    };
    if (!api || typeof api.rehydrate !== "function") {
      finish();
      return;
    }
    if (api.hasHydrated()) {
      finish();
      return;
    }
    const unsub = api.onFinishHydration(finish);
    void api.rehydrate();
    return unsub;
  }, []);
  return ready;
}
