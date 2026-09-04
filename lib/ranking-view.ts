import type { Account, SkinConcern, SkinType } from "./types";

type SessionView = {
  accountId: string;
  profileKey: string;
  skin: SkinType;
  concerns: SkinConcern[];
};

let sessionView: SessionView | null = null;

export function profileKeyOf(account: Pick<Account, "skinType" | "concerns">) {
  return `${account.skinType ?? ""}|${account.concerns.join(",")}`;
}

export function readRankingView(account: Account): { skin: SkinType; concerns: SkinConcern[] } {
  if (!account.skinType) return { skin: "복합성", concerns: account.concerns };
  if (sessionView?.accountId === account.id && sessionView.profileKey === profileKeyOf(account)) {
    return { skin: sessionView.skin, concerns: sessionView.concerns };
  }
  return { skin: account.skinType, concerns: account.concerns };
}

export function writeRankingView(account: Account, skin: SkinType, concerns: SkinConcern[]) {
  sessionView = {
    accountId: account.id,
    profileKey: profileKeyOf(account),
    skin,
    concerns,
  };
}
