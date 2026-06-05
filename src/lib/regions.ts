import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Region {
  id: string;
  letter: string;
  name: string;
  description: string | null;
  president: string | null;
  order_index: number;
}

export interface Division {
  id: string;
  region_id: string;
  code: string;
  name: string;
  description: string | null;
  order_index: number;
}

export interface Club {
  id: string;
  division_id: string;
  name: string;
  city: string | null;
  email: string | null;
  phone: string | null;
  meetings: string | null;
  address: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  president: string | null;
  logo_url: string | null;
  order_index: number;
}

export function useRegions() {
  return useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .order("order_index")
        .order("letter");
      if (error) throw error;
      return (data ?? []) as Region[];
    },
  });
}

export function useRegion(id: string | undefined) {
  return useQuery({
    queryKey: ["region", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("regions").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as Region | null;
    },
  });
}

export function useRegionByLetter(letter: string) {
  return useQuery({
    queryKey: ["region", "letter", letter],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .eq("letter", letter)
        .maybeSingle();
      if (error) throw error;
      return data as Region | null;
    },
  });
}

export function useDivisions(regionId: string | undefined) {
  return useQuery({
    queryKey: ["divisions", regionId],
    enabled: !!regionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("divisions")
        .select("*")
        .eq("region_id", regionId!)
        .order("order_index")
        .order("code");
      if (error) throw error;
      return (data ?? []) as Division[];
    },
  });
}

export function useDivision(id: string | undefined) {
  return useQuery({
    queryKey: ["division", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("divisions").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as Division | null;
    },
  });
}

export function useClubs(divisionId: string | undefined) {
  return useQuery({
    queryKey: ["clubs", divisionId],
    enabled: !!divisionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .eq("division_id", divisionId!)
        .order("order_index")
        .order("name");
      if (error) throw error;
      return (data ?? []) as Club[];
    },
  });
}

export function useClub(id: string | undefined) {
  return useQuery({
    queryKey: ["club", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from("clubs").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as Club | null;
    },
  });
}

export function useAllClubs() {
  return useQuery({
    queryKey: ["clubs", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clubs")
        .select("*, divisions(code, region_id, regions(letter, name))")
        .order("name");
      if (error) throw error;
      return data ?? [];
    },
  });
}
