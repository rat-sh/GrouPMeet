import { useQuery, useMutation } from "@tanstack/react-query";
import type { User } from "@/types";
import { useApi } from "@/lib/axios";

export const useUsers = () => {
  const { apiWithAuth } = useApi();

  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await apiWithAuth<User[]>({ method: "GET", url: "/users" });
      return data;
    },
  });
};

export const useMe = () => {
  const { apiWithAuth } = useApi();

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await apiWithAuth<User>({ method: "GET", url: "/users/me" });
      return data;
    },
    retry: 1,
  });
};

export const useSyncContacts = () => {
  const { apiWithAuth } = useApi();

  return useMutation({
    mutationFn: async (phoneNumbers: string[]) => {
      const { data } = await apiWithAuth<User[]>({
        method: "POST",
        url: "/users/sync-contacts",
        data: { phoneNumbers },
      });
      return data;
    },
  });
};

