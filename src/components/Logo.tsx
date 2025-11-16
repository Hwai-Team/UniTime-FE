import svgPathsIcon from '../imports/svg-typ41462c3';

interface LogoProps {
  variant?: 'icon' | 'full';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ variant = 'full', size = 'md', className = '' }: LogoProps) {
  // 크기별 스타일
  const sizeConfig = {
    sm: { height: 'h-8', iconSize: 32, fontSize: 'text-xl', spacing: 'gap-2' },
    md: { height: 'h-12', iconSize: 48, fontSize: 'text-3xl', spacing: 'gap-3' },
    lg: { height: 'h-16', iconSize: 64, fontSize: 'text-4xl', spacing: 'gap-4' },
  };

  const config = sizeConfig[size];

  // 아이콘만 렌더링
  if (variant === 'icon') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div style={{ width: config.iconSize, height: config.iconSize }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 101 117">
            <g clipPath="url(#clip0_logo)">
              <rect fill="url(#paint0_linear)" fillOpacity="0.88" height="16" width="15.4068" x="52.1354" y="60" />
              <path d={svgPathsIcon.p22aa8b80} fill="white" />
              <path d={svgPathsIcon.p38ee2300} fill="url(#paint1_linear)" />
              <rect fill="url(#paint2_linear)" height="16" width="15.4068" x="32.6198" y="60" />
              <path d={svgPathsIcon.p15d7f00} fill="white" />
              <g>
                <rect fill="url(#paint3_linear)" height="4" width="1" x="36.2402" y="58" />
                <rect fill="#601B9D" height="4" width="1" x="36.2402" y="58" />
              </g>
              <g>
                <rect fill="url(#paint5_linear)" height="4" width="1" x="43.2402" y="58" />
                <rect fill="#601B9D" height="4" width="1" x="43.2402" y="58" />
              </g>
              <rect fill="url(#paint7_linear)" height="16" width="15.4068" x="52.2399" y="40" />
              <path d={svgPathsIcon.p3eeaf180} fill="white" />
              <g>
                <rect fill="url(#paint8_linear)" height="4" width="1" x="55.8604" y="38" />
              </g>
              <g>
                <rect fill="url(#paint11_linear)" height="4" width="1" x="62.8604" y="38" />
              </g>
              <circle cx="24.7402" cy="72.5" fill="#531A95" r="1.5" />
              <rect fill="#3B056B" fillOpacity="0.88" height="12" width="1" x="24.2402" y="73" />
              <path d={svgPathsIcon.p2877b200} fill="url(#paint14_linear)" />
              <path d={svgPathsIcon.p3c9e0bb0} fill="url(#paint15_linear)" />
              <rect fill="#460393" fillOpacity="0.9" height="4" transform="rotate(-90 24.2402 86)" width="1" x="24.2402" y="86" />
              <path d={svgPathsIcon.p187b7c00} fill="url(#paint16_angular)" />
            </g>
            <defs>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear" x1="59.8389" x2="59.8389" y1="60" y2="76">
                <stop stopColor="#4F1A7E" />
                <stop offset="1" />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear" x1="60.7402" x2="60.7402" y1="65" y2="69.3086">
                <stop stopColor="#57007F" />
                <stop offset="1" stopColor="#2B005C" />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear" x1="40.3232" x2="40.3232" y1="60" y2="76">
                <stop stopColor="#601B9D" />
                <stop offset="1" />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear" x1="36.7402" x2="36.7402" y1="58" y2="62">
                <stop stopColor="#601B9D" />
                <stop offset="1" />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint5_linear" x1="43.7402" x2="43.7402" y1="58" y2="62">
                <stop stopColor="#601B9D" />
                <stop offset="1" />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint7_linear" x1="59.9433" x2="59.9433" y1="40" y2="56">
                <stop stopColor="#9C82F1" />
                <stop offset="1" stopColor="#601B9D" />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint8_linear" x1="56.3604" x2="56.3604" y1="38" y2="42">
                <stop stopColor="#9C82F1" />
                <stop offset="1" stopColor="#601B9D" />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint11_linear" x1="63.3604" x2="63.3604" y1="38" y2="42">
                <stop stopColor="#9C82F1" />
                <stop offset="1" stopColor="#601B9D" />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint14_linear" x1="59.7402" x2="59.7402" y1="29" y2="40">
                <stop stopColor="#8A67FC" />
                <stop offset="1" stopColor="#523E96" />
              </linearGradient>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint15_linear" x1="45.7402" x2="45.7402" y1="46" y2="60">
                <stop stopColor="#7531C8" />
                <stop offset="1" stopColor="#601B9D" />
              </linearGradient>
              <radialGradient id="paint16_angular" cx="0" cy="0" gradientTransform="translate(50.2661 58.3257)" gradientUnits="userSpaceOnUse" r="100">
                <stop offset="0.2" stopColor="rgba(43, 1, 91, 0.94)" />
                <stop offset="0.37" stopColor="rgba(34, 1, 73, 0.95)" />
                <stop offset="0.67" stopColor="rgba(0, 0, 0, 1)" />
              </radialGradient>
              <clipPath id="clip0_logo">
                <rect fill="white" height="116.651" width="100.532" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
    );
  }

  // 전체 로고 (아이콘 + 텍스트)
  return (
    <div className={`flex items-center ${config.spacing} ${className}`}>
      <div style={{ width: config.iconSize, height: config.iconSize }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 101 117">
          <g clipPath="url(#clip0_logo_full)">
            <rect fill="url(#paint0_linear_full)" fillOpacity="0.88" height="16" width="15.4068" x="52.1354" y="60" />
            <path d={svgPathsIcon.p22aa8b80} fill="white" />
            <path d={svgPathsIcon.p38ee2300} fill="url(#paint1_linear_full)" />
            <rect fill="url(#paint2_linear_full)" height="16" width="15.4068" x="32.6198" y="60" />
            <path d={svgPathsIcon.p15d7f00} fill="white" />
            <g>
              <rect fill="url(#paint3_linear_full)" height="4" width="1" x="36.2402" y="58" />
              <rect fill="#601B9D" height="4" width="1" x="36.2402" y="58" />
            </g>
            <g>
              <rect fill="url(#paint5_linear_full)" height="4" width="1" x="43.2402" y="58" />
              <rect fill="#601B9D" height="4" width="1" x="43.2402" y="58" />
            </g>
            <rect fill="url(#paint7_linear_full)" height="16" width="15.4068" x="52.2399" y="40" />
            <path d={svgPathsIcon.p3eeaf180} fill="white" />
            <g>
              <rect fill="url(#paint8_linear_full)" height="4" width="1" x="55.8604" y="38" />
            </g>
            <g>
              <rect fill="url(#paint11_linear_full)" height="4" width="1" x="62.8604" y="38" />
            </g>
            <circle cx="24.7402" cy="72.5" fill="#531A95" r="1.5" />
            <rect fill="#3B056B" fillOpacity="0.88" height="12" width="1" x="24.2402" y="73" />
            <path d={svgPathsIcon.p2877b200} fill="url(#paint14_linear_full)" />
            <path d={svgPathsIcon.p3c9e0bb0} fill="url(#paint15_linear_full)" />
            <rect fill="#460393" fillOpacity="0.9" height="4" transform="rotate(-90 24.2402 86)" width="1" x="24.2402" y="86" />
            <path d={svgPathsIcon.p187b7c00} fill="url(#paint16_angular_full)" />
          </g>
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_full" x1="59.8389" x2="59.8389" y1="60" y2="76">
              <stop stopColor="#4F1A7E" />
              <stop offset="1" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_full" x1="60.7402" x2="60.7402" y1="65" y2="69.3086">
              <stop stopColor="#57007F" />
              <stop offset="1" stopColor="#2B005C" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint2_linear_full" x1="40.3232" x2="40.3232" y1="60" y2="76">
              <stop stopColor="#601B9D" />
              <stop offset="1" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint3_linear_full" x1="36.7402" x2="36.7402" y1="58" y2="62">
              <stop stopColor="#601B9D" />
              <stop offset="1" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint5_linear_full" x1="43.7402" x2="43.7402" y1="58" y2="62">
              <stop stopColor="#601B9D" />
              <stop offset="1" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint7_linear_full" x1="59.9433" x2="59.9433" y1="40" y2="56">
              <stop stopColor="#9C82F1" />
              <stop offset="1" stopColor="#601B9D" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint8_linear_full" x1="56.3604" x2="56.3604" y1="38" y2="42">
              <stop stopColor="#9C82F1" />
              <stop offset="1" stopColor="#601B9D" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint11_linear_full" x1="63.3604" x2="63.3604" y1="38" y2="42">
              <stop stopColor="#9C82F1" />
              <stop offset="1" stopColor="#601B9D" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint14_linear_full" x1="59.7402" x2="59.7402" y1="29" y2="40">
              <stop stopColor="#8A67FC" />
              <stop offset="1" stopColor="#523E96" />
            </linearGradient>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint15_linear_full" x1="45.7402" x2="45.7402" y1="46" y2="60">
              <stop stopColor="#7531C8" />
              <stop offset="1" stopColor="#601B9D" />
            </linearGradient>
            <radialGradient id="paint16_angular_full" cx="0" cy="0" gradientTransform="translate(50.2661 58.3257)" gradientUnits="userSpaceOnUse" r="100">
              <stop offset="0.2" stopColor="rgba(43, 1, 91, 0.94)" />
              <stop offset="0.37" stopColor="rgba(34, 1, 73, 0.95)" />
              <stop offset="0.67" stopColor="rgba(0, 0, 0, 1)" />
            </radialGradient>
            <clipPath id="clip0_logo_full">
              <rect fill="white" height="116.651" width="100.532" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <span 
        className={`font-semibold text-white ${config.fontSize} tracking-tight`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        UniTime
      </span>
    </div>
  );
}
