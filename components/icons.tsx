export function LogoMark({ className, color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden>
      <path
        d="M88 28c-8.5-10-21-16-35-16C28.5 12 10 31 10 56s18.5 44 43 44c14.5 0 27.2-6.2 35.6-16.5"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M52 28h18c10 0 18 6.2 18 15.2 0 6.4-4.2 11.4-10.4 13.6C85.4 59.2 90 65 90 72.6 90 82.8 81 90 69 90H52V28Z"
        stroke={color}
        strokeWidth="5.2"
        strokeLinejoin="round"
      />
      <path
        d="M58 38.5h10.5c5.4 0 9 2.8 9 7.2s-3.6 7.2-9 7.2H58V38.5Zm0 20.6h12.2c5.8 0 9.8 3 9.8 7.8 0 4.8-4 7.8-9.8 7.8H58V59.1Z"
        fill={color}
      />
      <path d="M92 18l3.2 7.4 7.4 3.2-7.4 3.2L92 39l-3.2-7.2-7.4-3.2 7.4-3.2L92 18Z" fill={color} />
    </svg>
  );
}

export function IconHome({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.7}
        fill={active ? "currentColor" : "none"}
      />
    </svg>
  );
}

export function IconHeart({ filled, size = 22 }: { filled?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"}>
      <path
        d="M12 20s-7.2-4.4-9.2-8.6C1.4 8.6 3.2 5.6 6.4 5.2 8.2 5 9.8 5.8 12 8c2.2-2.2 3.8-3 5.6-2.8 3.2.4 5 3.4 3.6 6.2C19.2 15.6 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconUser({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth={active ? 2.2 : 1.7} />
      <path
        d="M5 19.2c1.2-3.2 3.7-5 7-5s5.8 1.8 7 5"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.7}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconBack() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M15 5 8 12l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconCart() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M7 8h10l-.9 11H7.9L7 8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 8V6.6A3 3 0 0 1 15 6.6V8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconMinus() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 7h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconRefresh() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M12 7A5 5 0 1 1 8.2 2.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8.2 1v2.4H10.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconFilter() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9" cy="7" r="2.4" fill="#fff" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="15" cy="17" r="2.4" fill="#fff" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function IconLink() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M10 13.5a4.5 4.5 0 0 0 6.4.1l1.6-1.6a4.5 4.5 0 1 0-6.4-6.4l-.9.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M14 10.5a4.5 4.5 0 0 0-6.4-.1L6 12a4.5 4.5 0 1 0 6.4 6.4l.9-.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconWarn() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 4.8 3.4 19.4h17.2L12 4.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 10.2v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="17.3" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconSearch() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconPen() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M4 20h4L20 8l-4-4L4 16v4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export function IconStar({ filled, size = 22 }: { filled?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M12 3.6 14.6 9l6 .8-4.4 4.2 1.1 5.9L12 17.2 6.7 19.9 7.8 14 3.4 9.8l6-.8L12 3.6Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function IconKakao() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        d="M12 4C6.9 4 2.8 7.2 2.8 11.1c0 2.5 1.7 4.7 4.3 6l-.9 3.3c-.1.3.3.6.6.4l4-2.6c.4 0 .8.1 1.2.1 5.1 0 9.2-3.2 9.2-7.1S17.1 4 12 4Z"
        fill="#191600"
      />
    </svg>
  );
}

export function IconGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h5.9c-.3 1.4-1 2.6-2.2 3.4v2.8h3.6c2.1-1.9 3.3-4.7 3.3-8.3Z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.8 0-5.2-1.9-6.1-4.4H2.2v2.9C4 20.5 7.7 23 12 23Z" />
      <path fill="#FBBC05" d="M5.9 14.2c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2V6.9H2.2C1.4 8.5 1 10.2 1 12s.4 3.5 1.2 5.1l3.7-2.9Z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.5 2.2 15 1 12 1 7.7 1 4 3.5 2.2 6.9l3.7 2.9C6.8 7.3 9.2 5.4 12 5.4Z" />
    </svg>
  );
}

export function IconUp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 14l6-6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCheck({ on }: { on?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" fill={on ? "#F8845F" : "none"} stroke={on ? "#F8845F" : "#E0D7D3"} strokeWidth="1.4" />
      <path d="M6 10.2 8.6 13l5.4-6" stroke={on ? "#fff" : "#E0D7D3"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSearchSm() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconRank({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 18h3V10H4v8Zm6.5 0h3V6h-3v12ZM17 18h3v-7h-3v7Z" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 1.4 : 1.7} />
    </svg>
  );
}

export function IconShare() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="6" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17" cy="6.5" r="2.2" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17" cy="17.5" r="2.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 11.2 15 7.4M8 12.8 15 16.6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

export function IconChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 3.5 11 8 6 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 8v4.4l2.8 1.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconComment() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M5 6.5h14v10H9.2L5 19.4V6.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 11h6M9 14h3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconBadgeCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 3.4 14.2 5l2.6.2 1.2 2.3 2.2 1.4-.6 2.6.6 2.6-2.2 1.4-1.2 2.3-2.6.2L12 20.6 9.8 19l-2.6-.2-1.2-2.3-2.2-1.4.6-2.6-.6-2.6 2.2-1.4 1.2-2.3 2.6-.2L12 3.4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m8.8 12.1 2.1 2.1 4.3-4.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function VionLogo({ variant = "orange", className }: { variant?: "orange" | "white" | "black"; className?: string }) {
  return <img className={className} src={`/vion/logo/logo_${variant}.png`} alt="vion" />;
}
