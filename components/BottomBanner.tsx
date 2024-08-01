"use client";
import Link from "next/link";

import { track } from "@vercel/analytics";
import Icon from "@/components/layout/Icon";

export default function BottomBanner() {
  return (
    <div className="relative bottom-0 bg-forest-50  dark:bg-[#1F2726]">
      <div className="p-[20px] md:p-[50px] flex gap-x-[10px] items-start justify-between">
        <div className="flex flex-col gap-y-[10px] w-full md:w-auto">
          {/*desktop text*/}
          <div className="hidden md:block text-[10px] w-full leading-[1.5]">
            <div>FOOTER TEXT TBC</div>
          </div>
          {/*mobile text*/}
          <div className="block md:hidden text-[10px] w-full leading-[1.5]">
            <div>FOOTER TEXT TBC</div>
          </div>
          <div className="w-[230.87px] md:w-[362px] flex justify-between text-xs leading-[1.5]">
            <div className="hidden md:flex">
              © {new Date().getFullYear()} growthepie 🥧📏
            </div>
          </div>
          <div className="md:hidden pt-[30px] text-xs text-center w-full">
            © {new Date().getFullYear()} growthepie 🥧📏
          </div>
        </div>
        <div className="hidden md:flex justify-end"></div>
      </div>
    </div>
  );
}
