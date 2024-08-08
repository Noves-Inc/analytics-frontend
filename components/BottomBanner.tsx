"use client";
import Link from "next/link";

import Image from "next/image";

export default function BottomBanner() {
  return (
    <div className="relative bottom-0 bg-forest-50  dark:bg-[#1F2726]">
      <div className="p-[20px] md:p-[50px] flex gap-x-[10px] items-start justify-between">
        <div className="flex flex-col gap-y-[10px] w-full md:w-auto">
          {/*desktop text*/}
          <div className="hidden md:block text-[10px] w-full leading-[1.5]">
            <div className="flex items-center">
              <Image
                src="/icons/noves-logo-full.svg"
                alt="Noves"
                quality={100}
                width={100}
                height={100}
              />
            </div>
          </div>
          {/*mobile text*/}
          <div className="block md:hidden text-[10px] w-full leading-[1.5]">
            <div className="flex items-center">
              <Image
                src="/icons/noves-logo-full.svg"
                alt="Noves"
                quality={100}
                width={100}
                height={100}
              />
            </div>
          </div>
          <div className="w-[230.87px] md:w-[362px] flex text-xs leading-[1.5]">
            <Link href="/privacy-policy" className="md:underline mr-4">
              Privacy Policy
            </Link>
            <div className="hidden md:flex">
              © {new Date().getFullYear()}
              <a
                href="https://www.growthepie.xyz/"
                target="_blank"
                className="ml-1"
              >
                growthepie
              </a>
            </div>
          </div>
          <div className="md:hidden pt-[30px] text-xs text-center w-full">
            © {new Date().getFullYear()}
            <a
              href="https://www.growthepie.xyz/"
              target="_blank"
              className="ml-1"
            >
              growthepie
            </a>
          </div>
        </div>
        <div className="hidden md:flex justify-end"></div>
      </div>
    </div>
  );
}
