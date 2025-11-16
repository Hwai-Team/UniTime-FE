import imgEllipse3 from "figma:asset/f91cb282a320bdb8f415eea1243b0513ac78ea4c.png";
import imgAppWide2X1 from "figma:asset/e5ce890bca00124a5371399de473bf05de51d0d1.png";
import { imgSmallerCircle } from "./svg-85vd9";

function SmallerCircle() {
  return (
    <div className="[grid-area:1_/_1] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-250.522px_-311.127px] mask-size-[1200px_1165px] ml-[166.522px] mt-[116.127px] relative size-[21.911px]" data-name="smaller circle" style={{ maskImage: `url('${imgSmallerCircle}')` }}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="smaller circle">
          <circle cx="10.9554" cy="10.9554" id="Ellipse 5" r="10.4554" stroke="var(--stroke-0, #4D3763)" />
          <circle cx="10.9554" cy="10.9554" fill="var(--fill-0, #2A193C)" id="Ellipse 6" r="3.88217" stroke="var(--stroke-0, #4D3763)" />
        </g>
      </svg>
    </div>
  );
}

function CirclesBacground() {
  return (
    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[84px] mt-[195px] opacity-30 place-items-start relative" data-name="Circles/Bacкground">
      <div className="[grid-area:1_/_1] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-84px_-195px] mask-size-[1200px_1165px] ml-0 mt-0 relative size-[1032px]" style={{ maskImage: `url('${imgSmallerCircle}')` }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1032 1032">
          <circle cx="516" cy="516" id="Ellipse 2" opacity="0.1" r="515.5" stroke="var(--stroke-0, white)" />
        </svg>
      </div>
      <div className="[grid-area:1_/_1] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-200.127px_-311.127px] mask-size-[1200px_1165px] ml-[116.127px] mt-[116.127px] opacity-[0.15] relative size-[799.745px]" style={{ maskImage: `url('${imgSmallerCircle}')` }}>
        <img alt="" className="block max-w-none size-full" height="799.745" src={imgEllipse3} width="799.745" />
      </div>
      <div className="[grid-area:1_/_1] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-317.35px_-428.35px] mask-size-[1200px_1165px] ml-[233.35px] mt-[233.35px] relative size-[565.299px]" style={{ maskImage: `url('${imgSmallerCircle}')` }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 566 566">
          <circle cx="282.65" cy="282.65" id="Ellipse 4" opacity="0.2" r="282.15" stroke="var(--stroke-0, white)" />
        </svg>
      </div>
      <SmallerCircle />
    </div>
  );
}

function App() {
  return (
    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[40px] mt-[496.877px] place-items-start relative" data-name="App">
      <div className="[grid-area:1_/_1] h-[815.246px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-40px_-496.877px] mask-size-[1200px_1165px] ml-0 mt-0 relative rounded-[10px] w-[1120px]" style={{ maskImage: `url('${imgSmallerCircle}')` }}>
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_-20px_70px_0px_rgba(140,69,255,0.25),0px_-19px_70px_0px_rgba(140,69,255,0.4)]" />
      </div>
      <div className="[grid-area:1_/_1] h-[793.242px] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-51.002px_-507.879px] mask-size-[1200px_1165px] ml-[11.002px] mt-[11.002px] pointer-events-none relative rounded-[8px] w-[1098px]" data-name="App Wide@2x 1" style={{ maskImage: `url('${imgSmallerCircle}')` }}>
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover rounded-[8px] size-full" src={imgAppWide2X1} />
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 rounded-[8px]" />
      </div>
    </div>
  );
}

function MaskGroup() {
  return (
    <div className="[grid-area:1_/_1] grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative" data-name="Mask group">
      <div className="[grid-area:1_/_1] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-189px_-280px] mask-size-[1200px_1165px] ml-[189px] mt-[280px] relative size-[825px]" data-name="blur2" style={{ maskImage: `url('${imgSmallerCircle}')` }}>
        <div className="absolute inset-[-64.727%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1893 1893">
            <g filter="url(#filter0_f_1_120)" id="blur2">
              <circle cx="946.5" cy="946.5" fill="var(--fill-0, #602A9A)" r="412.5" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="1893" id="filter0_f_1_120" width="1893" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_1_120" stdDeviation="267" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <div className="[grid-area:1_/_1] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-317px_-408px] mask-size-[1200px_1165px] ml-[317px] mt-[408px] relative size-[569px]" data-name="blur" style={{ maskImage: `url('${imgSmallerCircle}')` }}>
        <div className="absolute inset-[-39.367%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1017 1017">
            <g filter="url(#filter0_f_1_118)" id="blur">
              <circle cx="508.5" cy="508.5" fill="var(--fill-0, #622A9A)" r="284.5" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="1017" id="filter0_f_1_118" width="1017" x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend in="SourceGraphic" in2="BackgroundImageFix" mode="normal" result="shape" />
                <feGaussianBlur result="effect1_foregroundBlur_1_118" stdDeviation="112" />
              </filter>
            </defs>
          </svg>
        </div>
      </div>
      <CirclesBacground />
      <App />
    </div>
  );
}

function AppMask() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="App & Mask">
      <MaskGroup />
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] items-center left-1/2 top-[145px] translate-x-[-50%]">
      <div className="bg-clip-text bg-gradient-to-b font-['Inter:Medium',sans-serif] font-medium from-[#ffffff] from-[54.167%] leading-[84px] not-italic relative shrink-0 text-[82px] text-center text-nowrap to-[#b372cf] tracking-[-4.1492px] whitespace-pre" style={{ WebkitTextFillColor: "transparent" }}>
        <p className="mb-0">Boost your</p>
        <p>rankings with AI.</p>
      </div>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[31px] not-italic relative shrink-0 text-[20px] text-center text-white tracking-[-0.002px] w-[544px]">Elevate your site’s visibility effortlessly with AI, where smart technology meets user-friendly SEO tools.</p>
      <div className="h-[57px] relative rounded-[12px] shrink-0 w-[137px]">
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[12px]" />
      </div>
      <div className="absolute bg-white box-border content-stretch flex gap-[8px] items-center justify-center left-[calc(50%+0.5px)] px-[15px] py-[5px] rounded-[8px] top-[270px] translate-x-[-50%]" data-name="CTA S">
        <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium justify-center leading-[0] not-italic relative shrink-0 text-[15px] text-black text-center text-nowrap tracking-[-0.1515px]">
          <p className="leading-[31px] whitespace-pre">Start for free</p>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative size-full" data-name="Hero">
      <AppMask />
      <Frame />
      <div className="absolute bg-gradient-to-b from-[3.797%] from-[rgba(0,0,0,0)] h-[308px] left-0 to-[#050208] to-[86.043%] top-[857px] w-[1200px]" data-name="Black Shade" />
      <div className="absolute bg-black box-border content-stretch flex gap-[7px] items-center left-[calc(50%-0.5px)] px-[14px] py-[8px] rounded-[50px] top-[90px] translate-x-[-50%]" data-name="Badge/M">
        <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.15)] border-solid inset-0 pointer-events-none rounded-[50px]" />
        <div className="bg-[#9855ff] h-[18px] relative rounded-[40px] shrink-0 w-[34px]" data-name="Badge/S">
          <div className="flex flex-col items-center justify-center size-full">
            <div className="box-border content-stretch flex flex-col gap-[10px] h-[18px] items-center justify-center p-[10px] relative w-[34px]">
              <div className="flex flex-col font-['Inter:Bold',sans-serif] font-bold h-[17px] justify-center leading-[0] not-italic relative shrink-0 text-[10px] text-black tracking-[-0.001px] w-[24px]">
                <p className="leading-[26px]">NEW</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#9855ff] text-[16px] text-nowrap tracking-[-0.0016px]">
          <p className="leading-[26px] whitespace-pre">Latest integration just arrived</p>
        </div>
      </div>
    </div>
  );
}