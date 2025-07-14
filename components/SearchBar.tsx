"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.replace(`${window.location.pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative w-full max-w-sm">
      <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search by country name or code..."
        defaultValue={searchParams.get("search")?.toString() ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full pl-10"
      />
    </div>
  );
}
