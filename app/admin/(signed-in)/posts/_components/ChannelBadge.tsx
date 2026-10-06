import {
  FacebookLogo,
  Globe,
  InstagramLogo,
  LinkedinLogo,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { statuses } from "@/components/admin/status";
import {
  channelNames,
  type Channel,
  type ChannelState,
} from "@/lib/admin/posts";

export const channelIcons: Record<Channel, Icon> = {
  website: Globe,
  facebook: FacebookLogo,
  instagram: InstagramLogo,
  linkedin: LinkedinLogo,
};

// One enabled channel: its name, and once publishing has started its
// result in that status's tint ("Instagram · Failed"). Before then it is a
// quiet paper pill: the channel is on, nothing has gone out.
export function ChannelBadge({ channel, status }: ChannelState) {
  const Icon = channelIcons[channel];
  const style = status
    ? statuses.publication[status]
    : { tint: "bg-paper", text: "text-muted", label: undefined };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-[11px] py-1 text-[0.78rem] leading-tight font-semibold whitespace-nowrap ${style.tint} ${style.text}`}
    >
      <Icon aria-hidden="true" size={16} className="shrink-0" />
      {style.label
        ? `${channelNames[channel]} · ${style.label}`
        : channelNames[channel]}
    </span>
  );
}

export function ChannelBadges({ channels }: { channels: ChannelState[] }) {
  if (channels.length === 0)
    return <span className="text-[0.88rem] text-muted">No channels on</span>;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {channels.map((state) => (
        <li key={state.channel}>
          <ChannelBadge {...state} />
        </li>
      ))}
    </ul>
  );
}
