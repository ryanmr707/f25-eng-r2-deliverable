"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Database } from "@/lib/schema";
import Image from "next/image";
import { useState } from "react";

type Species = Database["public"]["Tables"]["species"]["Row"];

export default function SpeciesDetailsDialog({ species }: { species: Species }) {
  const [open, setOpen] = useState(false);

  const population = typeof species.total_population === "number" ? species.total_population.toLocaleString() : "N/A";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mt-3 w-full">Learn More</Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-1">
            <span className="text-xl">{species.scientific_name ?? "N/A"}</span>
            {species.common_name ? (
              <span className="text-base font-normal italic text-muted-foreground">{species.common_name}</span>
            ) : null}
          </DialogTitle>
          <DialogDescription>Detailed information about this species.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {species.image ? (
            <div className="relative h-56 w-full">
              <Image
                src={species.image}
                alt={species.scientific_name ?? "Species image"}
                fill
                className="rounded-md object-cover"
              />
            </div>
          ) : null}

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Scientific name</dt>
              <dd className="font-medium">{species.scientific_name ?? "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Common name</dt>
              <dd className="font-medium">{species.common_name ?? "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Kingdom</dt>
              <dd className="font-medium">{species.kingdom ?? "N/A"}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Total population</dt>
              <dd className="font-medium">{population}</dd>
            </div>
          </dl>

          {species.description ? (
            <div>
              <h4 className="mb-1 text-sm text-muted-foreground">Description</h4>
              <p className="whitespace-pre-line leading-relaxed">{species.description}</p>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
