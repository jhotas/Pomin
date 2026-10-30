"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./logo";
import { SidebarNav } from "./sidebar-nav";
import { StorageScope } from "./storage-scope";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.showModal();
    closeButtonRef.current?.focus();
  }, [open]);

  function close() {
    // A modal dialog makes the rest of the page inert, so close it before
    // moving focus back to the button that opened it.
    dialogRef.current?.close();
    setOpen(false);
    openButtonRef.current?.focus();
  }

  return (
    <div className="flex h-14 items-center justify-between border-b-2 border-text bg-cream px-4 md:hidden">
      <Link href="/">
        <Logo />
      </Link>
      <button
        ref={openButtonRef}
        type="button"
        onClick={() => setOpen(true)}
        className="-mr-2 flex size-11 items-center justify-center rounded-full text-text hover:bg-active"
      >
        <Menu aria-hidden size={22} strokeWidth={2.25} />
        <span className="sr-only">Open menu</span>
      </button>

      {open && (
        <dialog
          ref={dialogRef}
          aria-label="Menu"
          onCancel={(event) => {
            event.preventDefault();
            close();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              close();
            }
          }}
          className="m-0 flex h-dvh max-h-none w-full max-w-none flex-col bg-cream p-4 text-text backdrop:bg-cream"
        >
          <div className="flex h-14 items-center justify-between">
            <Logo />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={close}
              className="-mr-2 flex size-11 items-center justify-center rounded-full hover:bg-active"
            >
              <X aria-hidden size={22} strokeWidth={2.25} />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <div className="mt-6 text-section">
            <SidebarNav onNavigate={close} />
          </div>
          <div className="mt-auto">
            <StorageScope />
          </div>
        </dialog>
      )}
    </div>
  );
}
