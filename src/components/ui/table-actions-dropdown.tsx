"use client";

import { MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export interface TableActionItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive" | "edit" | "edit-secondary";
  disabled?: boolean;
  hidden?: boolean;
  separator?: boolean;
}

export interface TableActionsDropdownProps {
  items: TableActionItem[];
  trigger?: ReactNode;
  align?: "left" | "right";
  className?: string;
  disabled?: boolean;
}

export function TableActionsDropdown({
  items,
  trigger,
  align = "right",
  className = "",
  disabled = false,
}: TableActionsDropdownProps) {
  const visibleItems = items.filter((item) => !item.hidden);

  if (visibleItems.length === 0) {
    return null;
  }

  const defaultTrigger = (
    <Button
      variant="ghost"
      size="sm"
      disabled={disabled}
      className="h-8 w-8 p-0 hover:bg-gray-100"
    >
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        {trigger || defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align === "right" ? "end" : "start"}
        className="w-56 border-border"
      >
        {visibleItems.map((item, index) => (
          <div key={`action-${index}-${item.label}`}>
            {item.separator && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={item.onClick}
              disabled={item.disabled}
              variant={
                item.variant === "edit" || item.variant === "edit-secondary"
                  ? "default"
                  : item.variant
              }
              className="cursor-pointer"
            >
              {item.icon && (
                <span className="mr-2 flex-shrink-0">{item.icon}</span>
              )}
              {item.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
