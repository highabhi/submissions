"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/app/lib/utils";

const Sidebar = React.forwardRef<
  React.ElementRef<typeof Dialog.Content>,
  React.ComponentPropsWithoutRef<typeof Dialog.Content>
>(({ className, ...props }, ref) => (
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
    <Dialog.Content
      ref={ref}
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full w-64 flex-col bg-background shadow-lg p-4",
        className
      )}
      {...props}
    />
  </Dialog.Portal>
));
Sidebar.displayName = "Sidebar";

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Dialog.Trigger>,
  React.ComponentPropsWithoutRef<typeof Dialog.Trigger>
>(({ className, ...props }, ref) => (
  <Dialog.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-gray-800 text-white px-4 py-2",
      className
    )}
    {...props}
  >
    Open Sidebar
  </Dialog.Trigger>
));
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-2 p-4", className)} {...props} />
  )
);
SidebarHeader.displayName = "SidebarHeader";

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-2 p-4", className)} {...props} />
  )
);
SidebarFooter.displayName = "SidebarFooter";

export { Sidebar, SidebarTrigger, SidebarHeader, SidebarFooter, Dialog };