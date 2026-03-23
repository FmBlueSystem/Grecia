import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
  CANAL_OPTIONS,
  TIPO_CASO_OPTIONS,
  AREA_OPTIONS,
  TIEMPO_ESTIMADO_OPTIONS,
} from "@/lib/constants";

interface DropdownOptions {
  canal: string[];
  tipo_caso: string[];
  area: string[];
  tiempo_estimado: string[];
}

const FALLBACK: DropdownOptions = {
  canal: [...CANAL_OPTIONS],
  tipo_caso: [...TIPO_CASO_OPTIONS],
  area: [...AREA_OPTIONS],
  tiempo_estimado: [...TIEMPO_ESTIMADO_OPTIONS],
};

export function useDropdownOptions() {
  const { data, error, isLoading } = useSWR<DropdownOptions>(
    "/api/dropdown-options",
    fetcher,
    {
      dedupingInterval: 60_000,
      fallbackData: FALLBACK,
      revalidateOnFocus: false,
    },
  );

  return {
    options: data ?? FALLBACK,
    isLoading,
    error,
  };
}
