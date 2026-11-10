type IconName =
  | 'activity'
  | 'arrow'
  | 'check'
  | 'copy'
  | 'external'
  | 'plug'
  | 'refresh'
  | 'send'
  | 'token'
  | 'wallet'

interface IconProps {
  name: IconName
  size?: number
}

export function Icon({ name, size = 20 }: IconProps) {
  const paths: Record<IconName, React.ReactNode> = {
    activity: <path d="M4 12a8 8 0 1 0 2.34-5.66M4 4v4h4M12 8v4l3 2" />,
    arrow: <path d="m9 18 6-6-6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>,
    external: <><path d="M14 3h7v7M10 14 21 3" /><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" /></>,
    plug: <><path d="M12 22v-5M9 7V2M15 7V2M6 7h12v4a6 6 0 0 1-12 0V7Z" /></>,
    refresh: <><path d="M20 11a8 8 0 1 0-2.34 5.66" /><path d="M20 4v7h-7" /></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
    token: <><circle cx="9" cy="9" r="6" /><circle cx="15" cy="15" r="6" /><path d="M7 9h4M9 7v4" /></>,
    wallet: <><path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6" /><path d="M16 13h4" /></>,
  }

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {paths[name]}
    </svg>
  )
}
