"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SearchBar } from "@/components/SearchBar";
import { CountriesPagination } from "@/components/CountriesPagination";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Country } from "@/lib/types";

const fetchCountries = async (page: string, search: string) => {
  const params = new URLSearchParams({ page, search, per_page: "20" });
  const res = await fetch(`/api/wb/countries?${params.toString()}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch countries");
  }
  return res.json();
};

export default function Page() {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") ?? "1";
  const search = searchParams.get("search") ?? "";

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["countries", page, search],
    queryFn: () => fetchCountries(page, search),
    placeholderData: (previousData) => previousData,
    retry: false,
  });

  const countries: Country[] = data?.data ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / 20);

  return (
    <main>
      <section className="mb-12 bg-blue-400 p-4 md:p-8">
        <div className="flex flex-col md:flex-row items-center justify-center container mx-auto">
          <div className="relative max-w-sm hidden md:block md:pr-16">
            <Image
              src="/student.png"
              alt="A student learning about the world with a globe and map"
              width={200}
              height={200}
              className=""
              priority
            />
          </div>
          <div className="text-center md:text-left md:w-1/2">
            <h1 className="text-4xl text-white font-bold tracking-tight lg:text-5xl">
              World Bank Data Explorer
            </h1>
            <p className="mt-4 text-lg text-white">
              Your gateway to understanding global economies. Browse countries
              to learn about their GDP, population, and more.
            </p>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 pb-12">
        <div className="mb-8 flex justify-center">
          <SearchBar />
        </div>

        {isError && (
          <div className="text-center text-red-500">
            Error: {(error as Error).message}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : countries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {countries.map((country) => (
              <Link href={`/countries/${country.id}`} key={country.id} passHref>
                <Card className="hover:border-primary transition-colors h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>{country.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground flex-grow">
                    <p>Region: {country.region}</p>
                    <p>Income: {country.incomeLevel}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground mt-12">
            No countries found for your search.
          </div>
        )}

        <div className="mt-8">
          <CountriesPagination
            currentPage={Number(page)}
            totalPages={totalPages}
          />
        </div>
      </section>
    </main>
  );
}
