import useSWR from "swr";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

export function useProperties(filters?: {
  sector?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const queryString = new URLSearchParams(filters as any).toString();
  const { data, error, isLoading, mutate } = useSWR(
    `/api/properties${queryString ? `?${queryString}` : ""}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
      staleTime: 60000, // 1 minute
    }
  );

  return {
    properties: data?.properties || [],
    isLoading,
    error,
    mutate,
  };
}

export function useProperty(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    id ? `/api/properties/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      staleTime: 300000, // 5 minutes
    }
  );

  return {
    property: data,
    isLoading,
    error,
    mutate,
  };
}

export function useFavorites(userId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/favorites?userId=${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 15000, // 15 seconds
      staleTime: 30000, // 30 seconds
    }
  );

  return {
    favorites: data?.favorites || [],
    isLoading,
    error,
    mutate,
  };
}
