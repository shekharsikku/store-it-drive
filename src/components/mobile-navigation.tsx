"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UserAvatar } from "@/components/user-avatar";
import { navItems } from "@/constants";
import { signOutUser, type UserDocument } from "@/lib/actions/user.actions";
import { cn } from "@/lib/utils";

const MobileNavigation = ({ $id: ownerId, accountId, fullName, email }: UserDocument) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="mobile-header">
      <Image src="/assets/icons/logo-full-brand.svg" alt="logo" width={120} height={52} loading="eager" />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <Image src="/assets/icons/menu.svg" alt="Search" width={30} height={30} />
        </SheetTrigger>
        <SheetContent className="shad-sheet h-screen px-3">
          <SheetTitle>
            <div className="header-user">
              <UserAvatar seed={accountId} />
              <div className="sm:hidden lg:block">
                <p className="subtitle-2 capitalize">{fullName}</p>
                <p className="caption w-36! truncate!">{email}</p>
              </div>
            </div>
            <Separator className="mb-4 bg-light-200/20!" />
          </SheetTitle>

          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              {navItems.map(({ url, name, icon }) => (
                <Link key={name} href={url} className="lg:w-full">
                  <li className={cn("mobile-nav-item", pathname === url && "shad-active")}>
                    <Image
                      src={icon}
                      alt={name}
                      width={24}
                      height={24}
                      className={cn("nav-icon", pathname === url && "nav-icon-active")}
                    />
                    <p>{name}</p>
                  </li>
                </Link>
              ))}
            </ul>
          </nav>

          <Separator className="my-5 bg-light-200/20!" />

          <div className="flex flex-col justify-between gap-5 pb-5">
            <FileUploader ownerId={ownerId} accountId={accountId} className="w-full" />
            <Button type="submit" className="mobile-sign-out-button" onClick={async () => await signOutUser()}>
              <Image src="/assets/icons/logout.svg" alt="logo" width={24} height={24} />
              <p>Logout</p>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export { MobileNavigation };
