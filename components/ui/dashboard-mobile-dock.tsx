"use client";

import type { IconProps } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, Plus } from "@phosphor-icons/react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/** Viewport ≤768px — mesmo critério CSS `max-width: 768px`. */
export const DASHBOARD_MOBILE_DOCK_MAX_WIDTH_PX = 768;

type DockNavItem = {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ComponentType<IconProps>;
};

function isDockActive(
  pathname: string,
  href: string,
  rootHref: string,
  mode: "admin" | "student"
): boolean {
  if (mode === "admin") {
    return pathname === href || (href !== rootHref && pathname.startsWith(`${href}/`));
  }
  return (
    pathname === href ||
    (href !== rootHref && (pathname.startsWith(`${href}/`) || pathname.startsWith(`${href}?`)))
  );
}

function DockVerticalNav({
  items,
  rootHref,
  mode,
  sheetTitle,
  onNavigate,
}: {
  items: readonly DockNavItem[];
  rootHref: string;
  mode: "admin" | "student";
  sheetTitle: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <ScrollArea className="h-full py-6">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-foreground">
          {sheetTitle}
        </h2>
        <div className="space-y-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = isDockActive(pathname, href, rootHref, mode);
            return (
              <Button key={href} variant="ghost" className="w-full justify-start" asChild>
                <Link href={href} onClick={onNavigate}>
                  <Icon
                    className="mr-2 h-4 w-4 shrink-0"
                    weight={active ? "fill" : "regular"}
                    aria-hidden
                  />
                  {label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
}

export interface DashboardMobileDockProps {
  items: readonly DockNavItem[];
  rootHref: string;
  mode: "admin" | "student";
  sheetTitle: string;
  ariaLabel: string;
  className?: string;
}

/**
 * Barra inferior para dashboards (admin / aluno), visível só com viewport **até 768px**.
 */
export function DashboardMobileDock({
  items,
  rootHref,
  mode,
  sheetTitle,
  ariaLabel,
  className,
}: DashboardMobileDockProps) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = React.useState(false);

  const first = items[0];
  const second = items[1];
  const overflow = items.slice(2);

  if (!first) return null;

  const FirstIcon = first.icon;
  const SecondIcon = second?.icon;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 min-[769px]:hidden max-[768px]:block",
        className
      )}
    >
      <div className="pointer-events-auto flex justify-center px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-2">
        <nav
          aria-label={ariaLabel}
          className={cn(
            "flex items-center justify-center gap-1 rounded-full border border-border/80 bg-card/95 p-2 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80"
          )}
        >
          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href={first.href}>
              <FirstIcon
                className="h-5 w-5"
                weight={isDockActive(pathname, first.href, rootHref, mode) ? "fill" : "regular"}
                aria-hidden
              />
              <span className="sr-only">{first.label}</span>
            </Link>
          </Button>
          {second && SecondIcon ? (
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link href={second.href}>
                <SecondIcon
                  className="h-5 w-5"
                  weight={isDockActive(pathname, second.href, rootHref, mode) ? "fill" : "regular"}
                  aria-hidden
                />
                <span className="sr-only">{second.label}</span>
              </Link>
            </Button>
          ) : null}
          {overflow.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" className="rounded-full bg-primary text-primary-foreground ">
                  <Plus className="h-5 w-5" weight="bold" aria-hidden />
                  <span className="sr-only">Mais páginas</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" side="top" className="min-w-[12rem]">
                {overflow.map(({ href, label, icon: Icon }) => (
                  <DropdownMenuItem key={href} asChild>
                    <Link href={href} className="flex cursor-pointer items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0" weight="regular" aria-hidden />
                      {label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <List className="h-5 w-5" weight="regular" aria-hidden />
                <span className="sr-only">Abrir menu completo</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100%,280px)] p-0">
              <DockVerticalNav
                items={items}
                rootHref={rootHref}
                mode={mode}
                sheetTitle={sheetTitle}
                onNavigate={() => setSheetOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </div>
  );
}
