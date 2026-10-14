import React from 'react';

export interface IconProps {
  className?: string;
  size?: number;
}

export const RadarIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    <path d="M12 12m-5 0a5 5 0 1 0 10 0a5 5 0 1 0 -10 0" />
    <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
    <path d="M12 3v9" />
    <path d="M12 12l6 6" />
  </svg>
);

export const MemoryIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
  </svg>
);

export const CvIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const TerminalIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const CloseIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const EditIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const UploadIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const MessageSquareIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const SendIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const ChevronUpIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

export const ExternalLinkIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export const AlertTriangleIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const LockIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const FlaskIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M10 2v7.31L4.41 19.3A2 2 0 0 0 6.16 22h11.68a2 2 0 0 0 1.75-2.7L14 9.31V2" />
    <line x1="8.5" y1="2" x2="15.5" y2="2" />
    <line x1="8.5" y1="14" x2="15.5" y2="14" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const CopyIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const EyeOffIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

export const FileTextIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export const BarChartIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const UserPlusIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

export const CompanyBadgeIcon: React.FC<IconProps & { orgKey?: string }> = ({
  className = '',
  size = 20,
  orgKey = 'general',
}) => {
  switch (orgKey) {
    case 'nebius':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-label="Nebius logo"
        >
          <polygon
            points="12 2 2 7 12 12 22 7 12 2"
            fill="rgba(16,185,129,0.2)"
            stroke="#10b981"
            strokeWidth="1.8"
          />
          <polyline points="2 17 12 22 22 17" stroke="#10b981" strokeWidth="1.8" />
          <polyline points="2 12 12 17 22 12" stroke="#34d399" strokeWidth="1.6" />
        </svg>
      );
    case 'nvidia':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-label="NVIDIA logo"
        >
          <path
            d="M3 13.5C3.5 8.5 7.8 5 12.5 5c5 0 9 3.5 9.5 8.5"
            stroke="#76b900"
            strokeWidth="2"
          />
          <path
            d="M6 13.5C6.5 10 9 7.5 12.5 7.5c3.5 0 6 2.5 6.5 6"
            stroke="#76b900"
            strokeWidth="1.8"
          />
          <circle cx="12.5" cy="13.5" r="2.2" fill="#76b900" stroke="#76b900" />
        </svg>
      );
    case 'mext':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-label="MEXT logo"
        >
          <circle
            cx="12"
            cy="12"
            r="9.5"
            fill="rgba(244,63,94,0.18)"
            stroke="#f43f5e"
            strokeWidth="1.8"
          />
          <circle cx="12" cy="12" r="4" fill="#f43f5e" stroke="#f43f5e" />
        </svg>
      );
    case 'anthropic':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-label="Anthropic logo"
        >
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            fill="rgba(249,115,22,0.18)"
            stroke="#f97316"
            strokeWidth="1.6"
          />
        </svg>
      );
    case 'cern':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-label="CERN logo"
        >
          <circle cx="12" cy="12" r="9.5" stroke="#06b6d4" strokeWidth="1.8" />
          <circle
            cx="12"
            cy="12"
            r="5.5"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          <circle cx="12" cy="12" r="2" fill="#06b6d4" stroke="#06b6d4" />
        </svg>
      );
    case 'yc':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className={className}
          aria-label="Y Combinator logo"
        >
          <rect x="2" y="2" width="20" height="20" rx="4" fill="#ea580c" />
          <path
            d="M7 6.5l4.5 6V18h1.8v-5.5l4.7-6h-2.2l-3.4 4.8L8.9 6.5H7z"
            fill="#ffffff"
          />
        </svg>
      );
    case 'openai':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#10b981"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-label="OpenAI logo"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10M7 12h10" />
          <circle cx="12" cy="12" r="3" fill="#10b981" />
        </svg>
      );
    case 'google':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-label="Google DeepMind logo"
        >
          <rect x="3" y="3" width="8" height="8" rx="2" fill="#3b82f6" />
          <rect x="13" y="3" width="8" height="8" rx="2" fill="#ef4444" />
          <rect x="3" y="13" width="8" height="8" rx="2" fill="#eab308" />
          <rect x="13" y="13" width="8" height="8" rx="2" fill="#22c55e" />
        </svg>
      );
    case 'mit':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f43f5e"
          strokeWidth="2"
          strokeLinecap="round"
          className={className}
          aria-label="MIT logo"
        >
          <rect x="3" y="4" width="3" height="16" fill="#f43f5e" />
          <rect x="8" y="4" width="3" height="10" fill="#f43f5e" />
          <rect x="13" y="4" width="3" height="16" fill="#f43f5e" />
          <rect x="18" y="8" width="3" height="12" fill="#f43f5e" />
        </svg>
      );
    case 'meta':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#0284c7"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-label="Meta logo"
        >
          <path d="M4 14c1.5-4 4-7 8-3 4-4 6.5-1 8 3-1.5 4-4 7-8 3-4 4-6.5 1-8-3z" />
        </svg>
      );
    case 'huggingface':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#eab308"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-label="Hugging Face logo"
        >
          <circle cx="12" cy="12" r="9" />
          <circle cx="9" cy="10" r="1.5" fill="#eab308" />
          <circle cx="15" cy="10" r="1.5" fill="#eab308" />
          <path d="M8 15s1.5 2 4 2 4-2 4-2" />
        </svg>
      );
    case 'linux':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-label="Linux Foundation logo"
        >
          <rect x="4" y="3" width="16" height="18" rx="4" />
          <path d="M9 10h.01M15 10h.01M10 14h4" />
        </svg>
      );
    case 'stanford':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#b91c1c"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-label="Stanford logo"
        >
          <polygon points="12 2 4 22 20 22" fill="rgba(185,28,28,0.15)" />
          <line x1="12" y1="8" x2="12" y2="17" />
        </svg>
      );
    case 'rust':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ea580c"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-label="Rust logo"
        >
          <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
          <circle cx="12" cy="12" r="3" fill="#ea580c" />
        </svg>
      );
    case 'neurips':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-label="NeurIPS logo"
        >
          <circle cx="6" cy="6" r="2.5" fill="#a855f7" stroke="#a855f7" />
          <circle cx="18" cy="6" r="2.5" fill="#a855f7" stroke="#a855f7" />
          <circle cx="12" cy="18" r="2.5" fill="#a855f7" stroke="#a855f7" />
          <line x1="6" y1="6" x2="12" y2="18" stroke="#a855f7" strokeWidth="1.6" />
          <line x1="18" y1="6" x2="12" y2="18" stroke="#a855f7" strokeWidth="1.6" />
          <line x1="6" y1="6" x2="18" y2="6" stroke="#c084fc" strokeWidth="1.6" />
        </svg>
      );
    case 'horizon':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-label="Horizon Europe logo"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="rgba(250,204,21,0.12)"
            stroke="#facc15"
            strokeWidth="1.6"
            strokeDasharray="2.5 2"
          />
          <path d="M8.5 12l2.5 2.5 4.5-4.5" stroke="#facc15" strokeWidth="2" />
        </svg>
      );
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-label="Open Source logo"
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="3"
            stroke="#52525b"
            strokeWidth="1.6"
            fill="rgba(24,24,27,0.5)"
          />
          <polyline points="8 9 12 13 8 17" stroke="#10b981" strokeWidth="1.8" />
          <line x1="13" y1="17" x2="16" y2="17" stroke="#71717a" strokeWidth="1.8" />
        </svg>
      );
  }
};

export const BellIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

export const TechIcon: React.FC<IconProps & { name: string }> = ({ name, className = '', size = 20 }) => {
  const norm = name.toLowerCase();

  if (norm.includes('docker')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <rect x="2" y="11" width="20" height="8" rx="2" stroke="#38bdf8" fill="rgba(56,189,248,0.1)" />
        <rect x="4" y="6" width="3" height="3" rx="0.5" stroke="#38bdf8" />
        <rect x="8.5" y="6" width="3" height="3" rx="0.5" stroke="#38bdf8" />
        <rect x="13" y="6" width="3" height="3" rx="0.5" stroke="#38bdf8" />
        <rect x="8.5" y="2" width="3" height="3" rx="0.5" stroke="#38bdf8" />
      </svg>
    );
  }

  if (norm.includes('pytorch')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M13 3L8 14h5l-2 7 7-11h-5l2-7z" stroke="#f97316" fill="rgba(249,115,22,0.15)" strokeLinejoin="round" />
        <circle cx="17.5" cy="4.5" r="1.5" fill="#f97316" stroke="none" />
      </svg>
    );
  }

  if (norm.includes('python')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <path d="M12 2C7 2 7 4 7 5.5V8h5v1.5H5.5C4 9.5 2 9.5 2 14.5s2 5 3.5 5H7v-2.5c0-1.5 1-2.5 2.5-2.5h5c1.5 0 2.5-1 2.5-2.5V8c0-1.5-1-6-5-6z" stroke="#38bdf8" />
        <path d="M12 22c5 0 5-2 5-3.5V16h-5v-1.5h6.5c1.5 0 3.5 0 3.5-5s-2-5-3.5-5H17v2.5c0 1.5-1 2.5-2.5 2.5h-5c-1.5 0-2.5 1-2.5 2.5V16c0 1.5 1 6 5 6z" stroke="#facc15" />
      </svg>
    );
  }

  if (norm.includes('vector') || norm.includes('rag') || norm.includes('hnsw')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <circle cx="12" cy="12" r="3" stroke="#a855f7" fill="rgba(168,85,247,0.2)" />
        <circle cx="5" cy="6" r="2" stroke="#a855f7" />
        <circle cx="19" cy="6" r="2" stroke="#a855f7" />
        <circle cx="5" cy="18" r="2" stroke="#a855f7" />
        <circle cx="19" cy="18" r="2" stroke="#a855f7" />
        <line x1="6.8" y1="7.4" x2="9.8" y2="10.2" stroke="#71717a" strokeDasharray="2 2" />
        <line x1="17.2" y1="7.4" x2="14.2" y2="10.2" stroke="#71717a" strokeDasharray="2 2" />
        <line x1="6.8" y1="16.6" x2="9.8" y2="13.8" stroke="#71717a" strokeDasharray="2 2" />
        <line x1="17.2" y1="16.6" x2="14.2" y2="13.8" stroke="#71717a" strokeDasharray="2 2" />
      </svg>
    );
  }

  if (norm.includes('llm') || norm.includes('agent')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <rect x="3" y="4" width="18" height="14" rx="3" stroke="#10b981" fill="rgba(16,185,129,0.1)" />
        <circle cx="8" cy="11" r="1.5" fill="#10b981" />
        <circle cx="16" cy="11" r="1.5" fill="#10b981" />
        <path d="M10 14h4" stroke="#10b981" strokeLinecap="round" />
        <line x1="12" y1="1" x2="12" y2="4" stroke="#10b981" />
        <circle cx="12" cy="1" r="1" fill="#10b981" />
      </svg>
    );
  }

  if (norm.includes('go')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
        <circle cx="7" cy="12" r="5" stroke="#00add8" />
        <circle cx="17" cy="12" r="5" stroke="#00add8" />
        <path d="M17 12h-3" stroke="#00add8" />
        <path d="M7 10a2 2 0 0 0-2 2" stroke="#00add8" />
      </svg>
    );
  }

  if (norm.includes('linux')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <ellipse cx="12" cy="13" rx="6" ry="8" stroke="#e4e4e7" fill="rgba(228,228,231,0.08)" />
        <circle cx="10" cy="9" r="1" fill="#e4e4e7" />
        <circle cx="14" cy="9" r="1" fill="#e4e4e7" />
        <polygon points="12,11 10,13 14,13" fill="#facc15" stroke="none" />
        <path d="M8 21c-2 0-3-1-3-2s2-2 3-2" stroke="#facc15" />
        <path d="M16 21c2 0 3-1 3-2s-2-2-3-2" stroke="#facc15" />
      </svg>
    );
  }

  if (norm.includes('ros') || norm.includes('robot')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <circle cx="12" cy="12" r="9" stroke="#f43f5e" fill="rgba(244,63,94,0.1)" />
        <circle cx="12" cy="7" r="2" fill="#f43f5e" />
        <circle cx="7" cy="15" r="2" fill="#f43f5e" />
        <circle cx="17" cy="15" r="2" fill="#f43f5e" />
        <line x1="12" y1="9" x2="12" y2="12" stroke="#f43f5e" />
        <line x1="12" y1="12" x2="8.5" y2="13.5" stroke="#f43f5e" />
        <line x1="12" y1="12" x2="15.5" y2="13.5" stroke="#f43f5e" />
      </svg>
    );
  }

  if (norm.includes('sql') || norm.includes('data') || norm.includes('postgres')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <ellipse cx="12" cy="5" rx="8" ry="3" stroke="#3b82f6" fill="rgba(59,130,246,0.15)" />
        <path d="M4 5v7c0 1.66 3.58 3 8 3s8-1.34 8-3V5" stroke="#3b82f6" />
        <path d="M4 12v7c0 1.66 3.58 3 8 3s8-1.34 8-3v-7" stroke="#3b82f6" />
      </svg>
    );
  }

  if (norm.includes('rust')) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
        <circle cx="12" cy="12" r="8" stroke="#ea580c" />
        <path d="M8 8h5a2.5 2.5 0 0 1 0 5H8z" stroke="#ea580c" />
        <line x1="8" y1="8" x2="8" y2="16" stroke="#ea580c" />
        <line x1="11" y1="13" x2="15" y2="16" stroke="#ea580c" />
      </svg>
    );
  }

  // Default tech/terminal badge
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="#71717a" />
      <polyline points="8 9 12 13 8 17" stroke="#10b981" />
      <line x1="13" y1="17" x2="16" y2="17" stroke="#71717a" />
    </svg>
  );
};



