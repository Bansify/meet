import React from 'react';

/** The Mail-style startup screen: icon tile, product name, then a thin progress line. */
const SplashScreen: React.FC<{ status?: string; isDark?: boolean }> = ({
  status = 'Checking your Bansify account…',
  isDark = false,
}) => (
  <div
    className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 select-none ${
      isDark ? 'bg-[#212121] text-zinc-100' : 'bg-white text-zinc-900'
    }`}
  >
    <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[22px] bg-[#0494f4] shadow-lg shadow-[#0494f4]/25">
      <img src="/icon-192.png" alt="Bansify Meet" className="h-full w-full object-cover" />
    </span>
    <p className="text-[19px] font-black tracking-tight">
      <span className="text-[#0494f4]">Bansify</span>{' '}
      <span className={isDark ? 'text-white' : 'text-zinc-900'}>Meet</span>
    </p>
    <div className="h-[3px] w-40 overflow-hidden rounded-full bg-neutral-200 dark:bg-[#333333]">
      <div className="h-full w-1/3 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-[#0494f4]" />
    </div>
    <p className="text-[12px] text-zinc-500">{status}</p>
  </div>
);

export default SplashScreen;
