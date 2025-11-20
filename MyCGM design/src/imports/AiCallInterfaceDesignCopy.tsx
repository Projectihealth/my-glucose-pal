import svgPaths from "./svg-4anzx2xbic";

function Paragraph() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16.5px] left-0 not-italic text-[#5b7ff3] text-[11px] text-nowrap top-[0.5px] tracking-[2.2645px] uppercase whitespace-pre">Olivia AI</p>
    </div>
  );
}

function Heading() {
  return (
    <div className="h-[80px] relative shrink-0 w-full" data-name="Heading 1">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[40px] left-0 not-italic text-[#101828] text-[32px] top-0 tracking-[-0.2338px] w-[298px]">Your Personal Health Companion</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[52.75px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24.375px] left-0 not-italic text-[#6a7282] text-[15px] top-[3px] tracking-[-0.2344px] w-[294px]">Connect with Olivia for personalized health guidance and support.</p>
    </div>
  );
}

function Container() {
  return (
    <div className="box-border content-stretch flex flex-col gap-[12px] h-[189.25px] items-start pb-0 pt-[16px] px-0 relative shrink-0 w-full" data-name="Container">
      <Paragraph />
      <Heading />
      <Paragraph1 />
    </div>
  );
}

function Container1() {
  return <div className="absolute bg-gradient-to-b from-[#5b7ff3] h-[128px] left-0 opacity-0 rounded-[24px] to-[#7b9ff9] top-0 w-[342px]" data-name="Container" />;
}

function Heading1() {
  return (
    <div className="h-[28px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[28px] left-0 not-italic text-[20px] text-nowrap text-white top-0 tracking-[-0.4492px] whitespace-pre">Chat with Olivia</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[14px] text-[rgba(255,255,255,0.8)] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Voice • Video • Text</p>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[4px] h-[52px] items-start left-[80px] top-[6px] w-[147.07px]" data-name="Container">
      <Heading1 />
      <Paragraph2 />
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[32px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        <g clipPath="url(#clip0_2004_430)" id="Icon">
          <path d={svgPaths.p1e7d8500} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
          <path d="M26.6667 2.66667V8" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
          <path d="M29.3333 5.33333H24" id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
          <path d={svgPaths.pecb2400} id="Vector_4" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.33333" />
        </g>
        <defs>
          <clipPath id="clip0_2004_430">
            <rect fill="white" height="32" width="32" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.2)] box-border content-stretch flex items-center justify-center left-0 p-px rounded-[16px] size-[64px] top-0" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(255,255,255,0.3)] border-solid inset-0 pointer-events-none rounded-[16px]" />
      <Icon />
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute bg-[#00d492] left-[52px] rounded-[1.67772e+07px] size-[16px] top-[52px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-2 border-solid border-white inset-0 pointer-events-none rounded-[1.67772e+07px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute left-0 size-[64px] top-0" data-name="Container">
      <Container3 />
      <Container4 />
    </div>
  );
}

function Container6() {
  return (
    <div className="h-[64px] relative shrink-0 w-[227.07px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[64px] relative w-[227.07px]">
        <Container2 />
        <Container5 />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="h-[24px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-1/4 left-[37.5%] right-[37.5%] top-1/4" data-name="Vector">
        <div className="absolute inset-[-10.42%_-20.83%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9 15">
            <path d={svgPaths.p1736cec0} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="relative shrink-0 size-[24px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[24px]">
        <Icon1 />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex h-[64px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container6 />
      <Container7 />
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute bg-gradient-to-b box-border content-stretch flex flex-col from-[#5b7ff3] h-[128px] items-start left-0 pb-0 pt-[32px] px-[32px] rounded-[24px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] to-[#7b9ff9] top-0 w-[342px]" data-name="Container">
      <Container8 />
    </div>
  );
}

function Button() {
  return (
    <div className="h-[128px] overflow-clip relative shrink-0 w-full" data-name="Button">
      <Container1 />
      <Container9 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[25.5px] relative shrink-0 w-[174.234px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[25.5px] relative w-[174.234px]">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[25.5px] left-0 not-italic text-[#101828] text-[17px] text-nowrap top-[0.5px] tracking-[-0.4316px] whitespace-pre">Recent Conversations</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[20px] relative shrink-0 w-[52.383px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[20px] relative w-[52.383px]">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-0 not-italic text-[#5b7ff3] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">View All</p>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex h-[25.5px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Heading2 />
      <Button1 />
    </div>
  );
}

function Container11() {
  return (
    <div className="basis-0 bg-[rgba(95,39,205,0.08)] grow min-h-px min-w-px relative rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] shrink-0 w-[48px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-full items-center justify-center relative w-[48px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[32px] not-italic relative shrink-0 text-[24px] text-neutral-950 text-nowrap tracking-[0.0703px] whitespace-pre">😴</p>
      </div>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[16px] relative shrink-0 w-[63.625px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[63.625px]">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] text-nowrap top-px whitespace-pre">Last Friday</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[68px] relative shrink-0 w-[63.625px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[68px] items-center relative w-[63.625px]">
        <Container11 />
        <Paragraph3 />
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[137.938px]" data-name="Heading 4">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[22.5px] relative w-[137.938px]">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[22.5px] left-0 not-italic text-[#101828] text-[15px] text-nowrap top-[-0.5px] tracking-[-0.2344px] whitespace-pre">{`Diet & Sleep Habits`}</p>
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
            <path d={svgPaths.p3a41db00} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[16px]">
        <Icon2 />
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute content-stretch flex h-[22.5px] items-start justify-between left-0 top-[2px] w-[228.375px]" data-name="Container">
      <Heading3 />
      <Container13 />
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="absolute h-[250.25px] left-0 top-[28.5px] w-[228.375px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.75px] left-0 not-italic text-[#4a5565] text-[14px] top-px tracking-[-0.1504px] w-[229px]">Discussed dietary habits and sleep improvement strategies. You tried eating yogurt at night and for breakfast, which made you feel full. You mentioned eating breakfast late, affecting lunch appetite, so considered reducing breakfast portions. For sleep, you planned to turn on blue light filter and dim lights 1-2 hours before bed, aiming to sleep before 1 AM.</p>
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute left-[11px] size-[12px] top-[7px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_2004_416)" id="Icon">
          <path d={svgPaths.pac8c40} id="Vector" stroke="var(--stroke-0, #5B7FF3)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 1V3" id="Vector_2" stroke="var(--stroke-0, #5B7FF3)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 2H9" id="Vector_3" stroke="var(--stroke-0, #5B7FF3)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p1346bf00} id="Vector_4" stroke="var(--stroke-0, #5B7FF3)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_2004_416">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text() {
  return (
    <div className="absolute h-[16px] left-[29px] top-[5px] w-[85.969px]" data-name="Text">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-0 not-italic text-[#5b7ff3] text-[12px] text-nowrap top-px whitespace-pre">Sleep Goal Set</p>
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute bg-gradient-to-r from-[rgba(91,127,243,0.1)] h-[26px] left-0 rounded-[1.67772e+07px] to-[rgba(123,159,249,0.1)] top-[286.75px] w-[125.969px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(91,127,243,0.2)] border-solid inset-0 pointer-events-none rounded-[1.67772e+07px]" />
      <Icon3 />
      <Text />
    </div>
  );
}

function Container16() {
  return (
    <div className="basis-0 grow h-[312.75px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[312.75px] relative w-full">
        <Container14 />
        <Paragraph4 />
        <Container15 />
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex gap-[16px] h-[312.75px] items-start relative shrink-0 w-full" data-name="Container">
      <Container12 />
      <Container16 />
    </div>
  );
}

function OliviaTab() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col h-[346.75px] items-start left-0 pb-px pt-[17px] px-[17px] rounded-[16px] top-0 w-[342px]" data-name="OliviaTab">
      <div aria-hidden="true" className="absolute border border-gray-100 border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <Container17 />
    </div>
  );
}

function Button2() {
  return (
    <div className="h-[346.75px] relative shrink-0 w-full" data-name="Button">
      <OliviaTab />
    </div>
  );
}

function Container18() {
  return (
    <div className="basis-0 bg-[rgba(255,159,67,0.08)] grow min-h-px min-w-px relative rounded-[14px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] shrink-0 w-[48px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex h-full items-center justify-center relative w-[48px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[32px] not-italic relative shrink-0 text-[24px] text-neutral-950 text-nowrap tracking-[0.0703px] whitespace-pre">🍳</p>
      </div>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[16px] relative shrink-0 w-[63.625px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[63.625px]">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] text-nowrap top-px whitespace-pre">Last Friday</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="h-[68px] relative shrink-0 w-[63.625px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[68px] items-center relative w-[63.625px]">
        <Container18 />
        <Paragraph5 />
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="h-[22.5px] relative shrink-0 w-[135.711px]" data-name="Heading 4">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[22.5px] relative w-[135.711px]">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[22.5px] left-0 not-italic text-[#101828] text-[15px] text-nowrap top-[-0.5px] tracking-[-0.2344px] whitespace-pre">Breakfast Nutrition</p>
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-[8.33%] left-1/2 right-1/2 top-[79.17%]" data-name="Vector">
        <div className="absolute inset-[-33.33%_-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 2 4">
            <path d="M0.666667 0.666667V2.66667" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[41.67%_20.83%_20.83%_20.83%]" data-name="Vector">
        <div className="absolute inset-[-11.11%_-7.14%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 8">
            <path d={svgPaths.p1bc0fd80} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[8.33%_37.5%_37.5%_37.5%]" data-name="Vector">
        <div className="absolute inset-[-7.69%_-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 10">
            <path d={svgPaths.p13086a00} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col items-start relative size-[16px]">
        <Icon4 />
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute content-stretch flex h-[22.5px] items-start justify-between left-0 top-[2px] w-[228.375px]" data-name="Container">
      <Heading4 />
      <Container20 />
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="absolute h-[91px] left-0 top-[28.5px] w-[228.375px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[22.75px] left-0 not-italic text-[#4a5565] text-[14px] top-px tracking-[-0.1504px] w-[218px]">Olivia shared benefits of eating breakfast, and you two set up a goal of eating nutritious breakfast 4 times a week.</p>
    </div>
  );
}

function Icon5() {
  return (
    <div className="absolute left-[11px] size-[12px] top-[7px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_2004_416)" id="Icon">
          <path d={svgPaths.pac8c40} id="Vector" stroke="var(--stroke-0, #5B7FF3)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 1V3" id="Vector_2" stroke="var(--stroke-0, #5B7FF3)" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M11 2H9" id="Vector_3" stroke="var(--stroke-0, #5B7FF3)" strokeLinecap="round" strokeLinejoin="round" />
          <path d={svgPaths.p1346bf00} id="Vector_4" stroke="var(--stroke-0, #5B7FF3)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <defs>
          <clipPath id="clip0_2004_416">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Text1() {
  return (
    <div className="absolute h-[16px] left-[29px] top-[5px] w-[106.172px]" data-name="Text">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-0 not-italic text-[#5b7ff3] text-[12px] text-nowrap top-px whitespace-pre">New Goal Created</p>
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute bg-gradient-to-r from-[rgba(91,127,243,0.1)] h-[26px] left-0 rounded-[1.67772e+07px] to-[rgba(123,159,249,0.1)] top-[127.5px] w-[146.172px]" data-name="Container">
      <div aria-hidden="true" className="absolute border border-[rgba(91,127,243,0.2)] border-solid inset-0 pointer-events-none rounded-[1.67772e+07px]" />
      <Icon5 />
      <Text1 />
    </div>
  );
}

function Container23() {
  return (
    <div className="basis-0 grow h-[153.5px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[153.5px] relative w-full">
        <Container21 />
        <Paragraph6 />
        <Container22 />
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex gap-[16px] h-[153.5px] items-start relative shrink-0 w-full" data-name="Container">
      <Container19 />
      <Container23 />
    </div>
  );
}

function OliviaTab1() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col h-[187.5px] items-start left-0 pb-px pt-[17px] px-[17px] rounded-[16px] top-0 w-[342px]" data-name="OliviaTab">
      <div aria-hidden="true" className="absolute border border-gray-100 border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <Container24 />
    </div>
  );
}

function Button3() {
  return (
    <div className="h-[187.5px] relative shrink-0 w-full" data-name="Button">
      <OliviaTab1 />
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] h-[546.25px] items-start relative shrink-0 w-full" data-name="Container">
      <Button2 />
      <Button3 />
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[587.75px] items-start relative shrink-0 w-full" data-name="Container">
      <Container10 />
      <Container25 />
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-[36.65px] not-italic text-[#5b7ff3] text-[24px] text-center text-nowrap top-0 tracking-[0.0703px] translate-x-[-50%] whitespace-pre">24/7</p>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[36.48px] not-italic text-[#6a7282] text-[12px] text-center text-nowrap top-px translate-x-[-50%] whitespace-pre">Available</p>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[52px] items-start relative shrink-0 w-full" data-name="Container">
      <Container27 />
      <Paragraph7 />
    </div>
  );
}

function Container29() {
  return (
    <div className="[grid-area:1_/_1] bg-white relative rounded-[16px] shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border border-gray-100 border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start pb-px pt-[17px] px-[17px] relative size-full">
          <Container28 />
        </div>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-[35.96px] not-italic text-[#5b7ff3] text-[24px] text-center text-nowrap top-0 tracking-[0.0703px] translate-x-[-50%] whitespace-pre">{`<1s`}</p>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[36.32px] not-italic text-[#6a7282] text-[12px] text-center text-nowrap top-px translate-x-[-50%] whitespace-pre">Response</p>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[52px] items-start relative shrink-0 w-full" data-name="Container">
      <Container30 />
      <Paragraph8 />
    </div>
  );
}

function Container32() {
  return (
    <div className="[grid-area:1_/_2] bg-white relative rounded-[16px] shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border border-gray-100 border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start pb-px pt-[17px] px-[17px] relative size-full">
          <Container31 />
        </div>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-[36.16px] not-italic text-[#5b7ff3] text-[24px] text-center text-nowrap top-0 tracking-[0.0703px] translate-x-[-50%] whitespace-pre">100%</p>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[36.41px] not-italic text-[#6a7282] text-[12px] text-center text-nowrap top-px translate-x-[-50%] whitespace-pre">Private</p>
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] h-[52px] items-start relative shrink-0 w-full" data-name="Container">
      <Container33 />
      <Paragraph9 />
    </div>
  );
}

function Container35() {
  return (
    <div className="[grid-area:1_/_3] bg-white relative rounded-[16px] shrink-0" data-name="Container">
      <div aria-hidden="true" className="absolute border border-gray-100 border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col items-start pb-px pt-[17px] px-[17px] relative size-full">
          <Container34 />
        </div>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="gap-[12px] grid grid-cols-[repeat(3,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] h-[86px] relative shrink-0 w-full" data-name="Container">
      <Container29 />
      <Container32 />
      <Container35 />
    </div>
  );
}

function Text2() {
  return (
    <div className="absolute h-[24px] left-0 top-0 w-[16px]" data-name="Text">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] left-0 not-italic text-[#5b7ff3] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">✨</p>
    </div>
  );
}

function Heading5() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Heading 3">
      <Text2 />
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[24px] left-[24px] not-italic text-[#5b7ff3] text-[16px] text-nowrap top-[-0.5px] tracking-[-0.3125px] whitespace-pre">Olivia can help you with</p>
    </div>
  );
}

function Container37() {
  return <div className="absolute bg-[#5b7ff3] left-0 rounded-[1.67772e+07px] size-[6px] top-[8px]" data-name="Container" />;
}

function Paragraph10() {
  return (
    <div className="absolute h-[40px] left-[18px] top-0 w-[274px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] top-[0.5px] tracking-[-0.1504px] w-[234px]">Daily health check-ins and symptom tracking</p>
    </div>
  );
}

function Container38() {
  return (
    <div className="h-[40px] relative shrink-0 w-full" data-name="Container">
      <Container37 />
      <Paragraph10 />
    </div>
  );
}

function Container39() {
  return <div className="absolute bg-[#5b7ff3] left-0 rounded-[1.67772e+07px] size-[6px] top-[8px]" data-name="Container" />;
}

function Paragraph11() {
  return (
    <div className="absolute h-[20px] left-[18px] top-0 w-[238.328px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Meal planning and nutrition guidance</p>
    </div>
  );
}

function Container40() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <Container39 />
      <Paragraph11 />
    </div>
  );
}

function Container41() {
  return <div className="absolute bg-[#5b7ff3] left-0 rounded-[1.67772e+07px] size-[6px] top-[8px]" data-name="Container" />;
}

function Paragraph12() {
  return (
    <div className="absolute h-[20px] left-[18px] top-0 w-[252.203px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] text-nowrap top-[0.5px] tracking-[-0.1504px] whitespace-pre">Exercise and activity recommendations</p>
    </div>
  );
}

function Container42() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <Container41 />
      <Paragraph12 />
    </div>
  );
}

function Container43() {
  return <div className="absolute bg-[#5b7ff3] left-0 rounded-[1.67772e+07px] size-[6px] top-[8px]" data-name="Container" />;
}

function Paragraph13() {
  return (
    <div className="absolute h-[40px] left-[18px] top-0 w-[274px]" data-name="Paragraph">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#4a5565] text-[14px] top-[0.5px] tracking-[-0.1504px] w-[259px]">Sleep pattern analysis and improvement tips</p>
    </div>
  );
}

function Container44() {
  return (
    <div className="h-[40px] relative shrink-0 w-full" data-name="Container">
      <Container43 />
      <Paragraph13 />
    </div>
  );
}

function Container45() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] h-[156px] items-start relative shrink-0 w-full" data-name="Container">
      <Container38 />
      <Container40 />
      <Container42 />
      <Container44 />
    </div>
  );
}

function Container46() {
  return (
    <div className="bg-[#f5f7fa] h-[246px] relative rounded-[24px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border border-gray-100 border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] h-[246px] items-start pb-px pt-[25px] px-[25px] relative w-full">
          <Heading5 />
          <Container45 />
        </div>
      </div>
    </div>
  );
}

function OliviaTab2() {
  return (
    <div className="h-[1397px] relative shrink-0 w-full" data-name="OliviaTab">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] h-[1397px] items-start pb-0 pt-[32px] px-[24px] relative w-full">
          <Container />
          <Button />
          <Container26 />
          <Container36 />
          <Container46 />
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <div className="bg-[#f8f9fa] content-stretch flex flex-col h-[1477px] items-start overflow-clip relative shrink-0 w-full" data-name="HomePage">
      <OliviaTab2 />
    </div>
  );
}

function App() {
  return (
    <div className="absolute bg-[#f8f9fa] box-border content-stretch flex flex-col h-[1477px] items-start left-0 px-[388.5px] py-0 top-0 w-[1167px]" data-name="App">
      <HomePage />
    </div>
  );
}

function Icon6() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[24px]" data-name="Icon">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full overflow-clip relative rounded-[inherit] w-[24px]">
        <div className="absolute inset-[29.17%_8.33%_45.83%_66.67%]" data-name="Vector">
          <div className="absolute inset-[-16.67%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
              <path d="M1 1H7V7" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[29.17%_8.33%]" data-name="Vector">
          <div className="absolute inset-[-10%_-5%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 12">
              <path d="M21 1L12.5 9.5L7.5 4.5L1 11" id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[16px] relative shrink-0 w-[48.422px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[48.422px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-px whitespace-pre">My CGM</p>
      </div>
    </div>
  );
}

function TabButton() {
  return (
    <div className="h-[52px] relative shrink-0 w-[64.422px]" data-name="TabButton">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[52px] items-center px-0 py-[4px] relative w-[64.422px]">
        <Icon6 />
        <Text3 />
      </div>
    </div>
  );
}

function Icon7() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[24px]" data-name="Icon">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full overflow-clip relative rounded-[inherit] w-[24px]">
        <div className="absolute inset-[8.33%]" data-name="Vector">
          <div className="absolute inset-[-5%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
              <path d={svgPaths.p3df8f300} id="Vector" stroke="var(--stroke-0, #5B7FF3)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[16px] relative shrink-0 w-[31.352px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[31.352px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#5b7ff3] text-[12px] text-nowrap top-px whitespace-pre">Olivia</p>
      </div>
    </div>
  );
}

function TabButton1() {
  return (
    <div className="h-[52px] relative shrink-0 w-[60px]" data-name="TabButton">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[52px] items-center px-0 py-[4px] relative w-[60px]">
        <Icon7 />
        <Text4 />
      </div>
    </div>
  );
}

function Icon8() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[24px]" data-name="Icon">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full overflow-clip relative rounded-[inherit] w-[24px]">
        <div className="absolute inset-[62.5%_33.33%_12.5%_8.33%]" data-name="Vector">
          <div className="absolute inset-[-16.67%_-7.14%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 8">
              <path d={svgPaths.p11b86180} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[13.03%_20.85%_54.7%_66.67%]" data-name="Vector">
          <div className="absolute inset-[-12.92%_-33.38%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 10">
              <path d={svgPaths.p2d238840} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[63.04%_8.33%_12.5%_79.17%]" data-name="Vector">
          <div className="absolute inset-[-17.04%_-33.33%_-17.04%_-33.34%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5 8">
              <path d={svgPaths.p19976900} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[12.5%_45.83%_54.17%_20.83%]" data-name="Vector">
          <div className="absolute inset-[-12.5%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
              <path d={svgPaths.pb08b100} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Text5() {
  return (
    <div className="h-[16px] relative shrink-0 w-[64.406px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[64.406px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-px whitespace-pre">Community</p>
      </div>
    </div>
  );
}

function TabButton2() {
  return (
    <div className="h-[52px] relative shrink-0 w-[80.406px]" data-name="TabButton">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[52px] items-center px-0 py-[4px] relative w-[80.406px]">
        <Icon8 />
        <Text5 />
      </div>
    </div>
  );
}

function Icon9() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[24px]" data-name="Icon">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full overflow-clip relative rounded-[inherit] w-[24px]">
        <div className="absolute inset-[8.33%]" data-name="Vector">
          <div className="absolute inset-[-5%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
              <path d={svgPaths.pb60700} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-1/4" data-name="Vector">
          <div className="absolute inset-[-8.33%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
              <path d={svgPaths.p31e16900} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[41.67%]" data-name="Vector">
          <div className="absolute inset-[-25%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
              <path d={svgPaths.pafef4f0} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Text6() {
  return (
    <div className="h-[16px] relative shrink-0 w-[25.711px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[25.711px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-px whitespace-pre">Goal</p>
      </div>
    </div>
  );
}

function TabButton3() {
  return (
    <div className="h-[52px] relative shrink-0 w-[60px]" data-name="TabButton">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[52px] items-center px-0 py-[4px] relative w-[60px]">
        <Icon9 />
        <Text6 />
      </div>
    </div>
  );
}

function Icon10() {
  return (
    <div className="basis-0 grow min-h-px min-w-px relative shrink-0 w-[24px]" data-name="Icon">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-full overflow-clip relative rounded-[inherit] w-[24px]">
        <div className="absolute inset-[62.5%_20.83%_12.5%_20.83%]" data-name="Vector">
          <div className="absolute inset-[-16.67%_-7.14%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 8">
              <path d={svgPaths.p11b86180} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <div className="absolute inset-[12.5%_33.33%_54.17%_33.33%]" data-name="Vector">
          <div className="absolute inset-[-12.5%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
              <path d={svgPaths.pb08b100} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function Text7() {
  return (
    <div className="h-[16px] relative shrink-0 w-[36.305px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[16px] relative w-[36.305px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6a7282] text-[12px] text-nowrap top-px whitespace-pre">Profile</p>
      </div>
    </div>
  );
}

function TabButton4() {
  return (
    <div className="h-[52px] relative shrink-0 w-[60px]" data-name="TabButton">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex flex-col gap-[4px] h-[52px] items-center px-0 py-[4px] relative w-[60px]">
        <Icon10 />
        <Text7 />
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="h-[68px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex h-[68px] items-center justify-between pl-[19.313px] pr-[19.328px] py-0 relative w-full">
          <TabButton />
          <TabButton1 />
          <TabButton2 />
          <TabButton3 />
          <TabButton4 />
        </div>
      </div>
    </div>
  );
}

function HomePage1() {
  return (
    <div className="absolute bg-white box-border content-stretch flex flex-col h-[69px] items-start left-[388.5px] pb-0 pt-px px-0 top-[842px] w-[390px]" data-name="HomePage">
      <div aria-hidden="true" className="absolute border-[1px_0px_0px] border-gray-200 border-solid inset-0 pointer-events-none" />
      <Container47 />
    </div>
  );
}

export default function AiCallInterfaceDesignCopy() {
  return (
    <div className="bg-white relative size-full" data-name="AI Call Interface Design (Copy)">
      <App />
      <HomePage1 />
    </div>
  );
}