import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { userApi } from "../api/endpoints";
import { apiError } from "../api/client";

export function useSavedVendors() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  useFocusEffect(useCallback(() => {
    let active = true;
    userApi.saved().then(({ data }) => { if (active) setSavedIds(new Set(data.data.map((vendor) => vendor._id))); }).catch((cause) => { if (active) setError(apiError(cause)); });
    return () => { active = false; };
  }, []));
  async function toggle(id: string) {
    try {
      const response = savedIds.has(id) ? await userApi.unsave(id) : await userApi.save(id);
      setSavedIds(new Set(response.data.data.map((vendor) => vendor._id)));
      setError("");
    } catch (cause) { setError(apiError(cause)); }
  }
  return { savedIds, toggle, savedError: error };
}
