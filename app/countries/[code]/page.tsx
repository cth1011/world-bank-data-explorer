"use client";

import { useQuery } from "@tanstack/react-query";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftIcon } from "lucide-react";

const fetchCountryData = async (code: string) => {
  const res = await fetch(`/api/wb/countries/${code}`);
  if (!res.ok) {
    if (res.status === 404) notFound();
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch country data");
  }
  return res.json();
};

export default function CountryDetailPage() {
  const params = useParams();
  const code = Array.isArray(params.code) ? params.code[0] : params.code;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["country", code],
    queryFn: () => fetchCountryData(code as string),
    enabled: !!code,
    retry: false,
  });

  if (isLoading) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <Skeleton className="h-10 w-48 mb-4" />
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-6 w-72 mt-2" />
        </header>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="container mx-auto p-4 md:p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p>{(error as Error).message}</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">← Back to All Countries</Link>
        </Button>
      </main>
    );
  }

  const { countryName, data: mergedData } = data;

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeftIcon className="w-4 h-4" /> Back to All Countries
          </Link>
        </Button>
        <h1 className="mt-4 text-4xl font-bold tracking-tight lg:text-5xl">
          {countryName}
        </h1>
        <p className="text-lg text-muted-foreground">
          Key indicators for the last 10 years.
        </p>
      </header>

      <Table>
        <TableCaption>Population and GDP Per Capita (USD)</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Year</TableHead>
            <TableHead>Population</TableHead>
            <TableHead>GDP Per Capita</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mergedData.map(
            ({
              year,
              population,
              gdp,
            }: {
              year: number;
              population: number;
              gdp: number;
            }) => (
              <TableRow key={year}>
                <TableCell className="font-medium">{year}</TableCell>
                <TableCell>
                  {population ? population.toLocaleString() : "N/A"}
                </TableCell>
                <TableCell>
                  {gdp
                    ? `${gdp.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}`
                    : "N/A"}
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </main>
  );
}
