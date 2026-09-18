"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { IconHeart, IconHome, IconRank, IconUser, VionLogo } from "./icons";
import { useStore } from "@/lib/store";
import { avatarSrc } from "@/lib/nicknames";

export function PhoneShell({ children, splash }: { children?: ReactNode; splash?: boolean }) {
  return (
    <div className={`shell${splash ? " shell-splash" : ""}`}>
      <div className="shell-body">{children ?? <div className="boot-loading" aria-hidden><VionLogo variant="orange" className="logo" /><i /></div>}</div>
      <ToastHost />
    </div>
  );
}

export function TabBar() {
  const path = usePathname();
  const tabs = [
    { href: "/home", key: "home", label: "홈", Icon: IconHome },
    { href: "/ranking", key: "rank", label: "랭킹", Icon: IconRank },
    { href: "/wishlist", key: "wish", label: "찜", Icon: IconHeart },
    { href: "/profile", key: "my", label: "마이", Icon: IconUser },
  ];
  return (
    <nav className="tabbar">
      {tabs.map((t) => {
        const on = path === t.href || path.startsWith(t.href + "/");
        const Icon = t.Icon;
        return (
          <Link key={t.key} href={t.href} className={on ? "on" : ""}>
            {t.key === "wish" ? <IconHeart filled={on} /> : t.key === "rank" ? <IconRank active={on} /> : <Icon active={on} />}
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function ToastHost() {
  const { toast } = useStore();
  if (!toast) return null;
  return <div className="toast">{toast}</div>;
}

export function Dim({
  children,
  onBack,
}: {
  children: ReactNode;
  onBack?: () => void;
}) {
  return (
    <div className="dim" onClick={onBack}>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="stars" style={{ fontSize: size }}>
      {"★".repeat(Math.round(value))}
      {"☆".repeat(Math.max(0, 5 - Math.round(value)))}
    </span>
  );
}

export function Thumb({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`thumb ${className ?? ""}`} role="img" aria-label={alt}>
      <img src={src} alt="" referrerPolicy="no-referrer" />
    </div>
  );
}

export function Avatar({ name, className }: { name?: string; className?: string }) {
  return (
    <div className={`avatar${className ? ` ${className}` : ""}`} aria-hidden>
      <img src={avatarSrc(name)} alt="" />
    </div>
  );
}
