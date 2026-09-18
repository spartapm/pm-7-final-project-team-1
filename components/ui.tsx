"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { IconHeart, IconHome, IconRank, IconUser, VionLogo } from "./icons";
import { useStore } from "@/lib/store";
import { avatarSrc } from "@/lib/nicknames";

export function PhoneShell({ children, splash }: { children?: ReactNode; splash?: boolean }) {
  const boot = !children;
  return (
    <div className={`shell${splash || boot ? " shell-splash" : ""}`}>
      <div className="shell-body">
        {children ?? (
          <div className="boot-loading" aria-hidden>
            <VionLogo variant="white" className="logo" />
          </div>
        )}
      </div>
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

function blankSrc(src?: string) {
  return !src?.trim();
}

export function SafeImg({ src, alt = "", className }: { src?: string; alt?: string; className?: string }) {
  const [failed, setFailed] = useState(() => blankSrc(src));
  useEffect(() => {
    setFailed(blankSrc(src));
  }, [src]);
  if (failed) {
    return (
      <span className={`img-ph${className ? ` ${className}` : ""}`} aria-hidden>
        이미지 준비중..
      </span>
    );
  }
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

export function Thumb({
  src,
  alt,
  className,
  children,
}: {
  src?: string;
  alt: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`thumb ${className ?? ""}`}
      {...(children ? {} : { role: "img", "aria-label": alt })}
    >
      <SafeImg src={src} alt={alt} />
      {children}
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
