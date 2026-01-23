
import React from 'react';

interface IconProps {
    className?: string;
    fill?: string;
    stroke?: string;
    viewBox?: string;
    strokeWidth?: number;
}

const defaultProps = {
    className: "h-6 w-6",
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.5,
};

export const AnalysisIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
);
export const DebateIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
);
export const StrategyIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
);
export const HistoryIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
export const LogoutIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
);
export const ScaleIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.153.24c-1.119 0-2.235-.34-3.218-.99-1.396-.92-2.936-2.033-4.483-3.286" />
    </svg>
);
export const MicrophoneIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
);
export const CameraIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
);
export const PhotoIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);
export const MapIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-10.5v.75m.01 0a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zm0 0a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM9 3.5c1.13 0 2.222.13 3.268.375a2.25 2.25 0 011.732 2.2v10.5a2.25 2.25 0 01-1.732 2.2A20.306 20.306 0 019 19.5a20.306 20.306 0 01-3.268-.375 2.25 2.25 0 01-1.732-2.2V6.075a2.25 2.25 0 011.732-2.2A20.306 20.306 0 019 3.5z" />
    </svg>
);
export const XMarkIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
export const CheckCircleIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
export const DashboardIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);
export const LightBulbIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a.75.75 0 01-1.125.65 11.26 11.26 0 01-3.75 0 .75.75 0 01-1.125-.65V18.75h7.5V20.228zM12 3a6 6 0 00-6 6c0 1.341.442 2.58 1.189 3.57a6.01 6.01 0 003.311 2.241V12.75h3v2.061a6.01 6.01 0 003.311-2.241A5.99 5.99 0 0018 9a6 6 0 00-6-6z" />
    </svg>
);
export const ShieldCheckIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
);
export const UserGroupIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a5.971 5.971 0 00-.941 3.197m0 0l.001.031c0 .225.012.447.037.666A11.944 11.944 0 0112 21c2.17 0 4.207-.576 5.963-1.584A6.062 6.062 0 0118 18.719m-12 0a5.971 5.971 0 00.941-3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
);
export const ExclamationIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
);
export const SearchIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196 7.5 7.5 0 0010.607 10.607z" />
    </svg>
);
export const MicroscopeIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm.53 5.47a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.72-1.72v5.69a.75.75 0 001.5 0v-5.69l1.72 1.72a.75.75 0 101.06-1.06l-3-3z" />
    </svg>
);
export const ClipboardCheckIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 16.15l2.6 2.6L19.25 13M9 5h.01M15 5h.01M9 19h6a2 2 0 002-2V7a2 2 0 00-2-2h-1l-1-1H9l-1 1H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);
export const ComputerDesktopIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
    </svg>
);
export const UploadIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);
export const DownloadIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);
export const ThumbUpIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 010-5.764c.259-.85 1.083-1.368 1.972-1.368h.908c.445 0 .72.498.523.898-.097.197-.187.397-.27.602" />
    </svg>
);
export const ThumbDownIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m3.334-8.5l-3.334 8.5h3.334l-3.334 8.5M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25z" />
    </svg>
);
export const CopyIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
);
export const CheckIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);
export const DocumentTextIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 009.75 21h7.5a2.25 2.25 0 002.25-2.25V14.25zM9 10.125c0-.621.504-1.125 1.125-1.125h.375c.621 0 1.125.504 1.125 1.125v.375c0 .621-.504 1.125-1.125 1.125h-.375a1.125 1.125 0 01-1.125-1.125v-.375zm0 4.5c0-.621.504-1.125 1.125-1.125h.375c.621 0 1.125.504 1.125 1.125v.375c0 .621-.504 1.125-1.125 1.125h-.375a1.125 1.125 0 01-1.125-1.125v-.375zm0 4.5c0-.621.504-1.125 1.125-1.125h.375c.621 0 1.125.504 1.125 1.125v.375c0 .621-.504 1.125-1.125 1.125h-.375a1.125 1.125 0 01-1.125-1.125v-.375z" />
    </svg>
);
export const UsersIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
);
export const ShieldExclamationIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM4.5 9.75a11.99 11.99 0 003.462 8.485L12 21.75l4.038-3.515A11.99 11.99 0 0019.5 9.75V5.625c0-1.036-.84-1.875-1.875-1.875h-11.25c-1.036 0-1.875.84-1.875 1.875v4.125z" />
    </svg>
);
export const ChevronDownIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);
export const ChartBarIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);
export const ChatBubbleLeftRightIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379L10.5 21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
);
export const BrainIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v3.75m0-3.75H8.25m3.75 0H15.75M12 15.75V12m0 0a3 3 0 10-3-3m3 3a3 3 0 113-3m-3 3V8.25m0 0a3 3 0 00-3-3m3 3a3 3 0 013-3m-3 3v2.25" />
    </svg>
);
export const ResearchIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196 7.5 7.5 0 0010.607 10.607z" />
    </svg>
);
export const SettingsIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.114-.94h1.086c.554 0 1.024.398 1.114.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.768.767a1.125 1.125 0 01.12 1.45l-.527.737a1.125 1.125 0 00.108 1.205c.166.396.506.71.93.78l.894.149c.542.09.94.56.94 1.114v1.086c0 .554-.398 1.024-.94 1.114l-.894.149a1.125 1.125 0 00-.93.78c-.164.398-.142.855.108 1.205l.527.738a1.125 1.125 0 01-.12 1.45l-.767.768a1.125 1.125 0 01-1.45.12l-.737-.527a1.125 1.125 0 00-1.205.108c-.396.166-.71.506-.78.93l-.149.894c-.09.542-.56.94-1.114.94h-1.086c-.554 0-1.024-.398-1.114-.94l-.149-.894a1.125 1.125 0 00-.78-.93c-.398-.164-.855-.142-1.205.108l-.738.527a1.125 1.125 0 01-1.45-.12l-.768-.767a1.125 1.125 0 01-.12-1.45l.527-.737a1.125 1.125 0 00-.108-1.205c-.166-.396-.506-.71-.93-.78l-.894-.149A1.125 1.125 0 013 13.125V12.04c0-.554.398-1.024.94-1.114l.894-.149a1.125 1.125 0 00.93-.78c.164-.398.142-.855-.108-1.205l-.527-.738a1.125 1.125 0 011.12-1.45l.767-.768a1.125 1.125 0 011.45-.12l.738.527c.35.25.807.272 1.205.108.396-.166.71-.506.78-.93l.149-.894z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
export const CalendarIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-15.75-1.5h10.5" />
    </svg>
);
export const FolderIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-19.5 0A2.25 2.25 0 004.5 15h15a2.25 2.25 0 002.25-2.25m-19.5 0v.75A2.25 2.25 0 004.5 18h15a2.25 2.25 0 002.25-2.25V12.75M12 3v3.75m0 0H8.25m3.75 0H15.75" />
    </svg>
);
export const TagIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.659A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
);
export const TrashIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);
export const PaperAirplaneIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
);
export const SunIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M3 12h2.25m.386-6.364l1.591 1.591M12 7.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" />
    </svg>
);
export const MoonIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 12.75a9 9 0 11-11.25-11.25 9 9 0 0011.25 11.25z" />
    </svg>
);
export const DatabaseIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75M3.75 10.125v3.75m16.5 0v3.75M3.75 13.875v3.75" />
    </svg>
);
export const TheaterIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-19.5 0A2.25 2.25 0 004.5 15h15a2.25 2.25 0 002.25-2.25m-19.5 0v.75A2.25 2.25 0 004.5 18h15a2.25 2.25 0 002.25-2.25V12.75M12 3v3.75m0 0H8.25m3.75 0H15.75" />
    </svg>
);
export const ArrowPathIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
);
export const ArrowsRightLeftIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
);
export const StarIcon: React.FC<IconProps> = ({ className, fill }) => (
    <svg {...defaultProps} className={className || defaultProps.className} fill={fill || defaultProps.fill}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
);
export const CheckBadgeIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
    </svg>
);
export const BeakerIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v1.244c0 .462.202.9.554 1.202l5.436 4.653a1.125 1.125 0 010 1.714l-5.436 4.653a1.125 1.125 0 01-.554 1.202v1.244m-5.25-16.5v16.5m0 0h12m-12 0v-1.5m0 0h12m-12 0a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-1.5m-12 0v-1.5" />
    </svg>
);
export const CurrencyDollarIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
export const PencilSquareIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
);
export const PlusIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

export const MagicWandIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
);
export const CropIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3v3m-3-12H5.25m14.25 3.75h3M2.25 21.75h19.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5v-7.5a2.25 2.25 0 00-2.25-2.25h-7.5" />
    </svg>
);
export const TextScanIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
);
export const ShareIcon: React.FC<IconProps> = ({ className }) => (
    <svg {...defaultProps} className={className || defaultProps.className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>
);
