"use client";
import { useEffect, useState, ReactNode, useMemo } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import useSWR from "swr";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipTrigger, TooltipContent } from "./Tooltip";
import { MasterURL } from "@/lib/urls";
import { NavigationItem } from "@/lib/navigation";

type SidebarProps = {
  item: NavigationItem;
  className?: string;
  onOpen?: () => void;
  onClose?: () => void;
  children?: ReactNode;
  sidebarOpen: boolean;
};

export default function SidebarMenuGroup({
  item,
  onOpen,
  onClose,
  sidebarOpen,
}: SidebarProps) {
  const { data: master } = useSWR<any>(MasterURL);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const pathname = usePathname();

  const urlParts = useMemo(() => {
    if (!pathname) {
      return ["", ""];
    }

    const parts = pathname.slice(1).split("/");
    switch (parts.length) {
      case 0:
        return ["", ""];
      case 1:
        return [parts[0], ""];
      case 2:
        return [parts[0], parts[1]];
      default:
        return parts;
    }
  }, [pathname]);

  useEffect(() => {
    setIsOpen(
      urlParts[0].toLowerCase() == item.name.toLowerCase() ? true : false,
    );
  }, [item.name, urlParts]);

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    onOpen && onOpen();
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose && onClose();
  };

  // disable Blockspace menu item in production
  if (item.name === "Blockspace" && process.env.VERCEL_ENV === "production")
    return (
      <div className="group flex flex-col">
        <Tooltip key={item.label} placement="right">
          <TooltipTrigger className="h-6 mb-8 cursor-default pl-0 md:pl-8 overflow-visible">
            <div className="flex items-center justify-items-center opacity-70">
              <div className="w-6 mx-0">
                <div className="w-6 mx-auto grayscale">
                  <Icon icon={item.icon} className="h-7 w-7 p-0.5 mx-auto" />
                </div>
              </div>
              <div className="">
                {sidebarOpen && (
                  <div className="text-base font-bold mx-3 w-80 flex space-x-3 items-center">
                    <span>{item.label}</span>
                    <div className="px-1 py-[2px] leading-[1] text-sm font-bold ml-1 rounded-[3px] bg-forest-900 text-forest-50 dark:bg-forest-50 dark:text-forest-900">
                      SOON
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TooltipTrigger>
          {!sidebarOpen && (
            <TooltipContent className="bg-forest-900 text-forest-50 dark:bg-forest-50 dark:text-forest-900 rounded-md p-2 text-xs ml-2 font-medium break-inside-auto shadow-md flex z-50">
              {item.label}{" "}
              <div className="text-[0.5rem] leading-[1] px-1 py-1 font-bold ml-1 rounded-[4px] bg-forest-50 dark:bg-forest-900 text-forest-900 dark:text-forest-50">
                SOON
              </div>
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    );

  if (["API Documentation", "Wiki", "Contributors", "Home"].includes(item.name))
    return (
      <div className="group flex flex-col">
        {/* open in new tab */}
        <Tooltip key={item.label} placement="right">
          <TooltipTrigger className="h-6 mb-8 cursor-default pl-0 md:pl-8 overflow-visible">
            <Link
              target={
                !["Home", "Contributors"].includes(item.name) ? "_blank" : ""
              }
              className="flex items-center justify-items-center mb-8"
              href={item.href ?? ""}
              rel={
                !["Home", "Contributors"].includes(item.name)
                  ? "noopener noreferrer"
                  : ""
              }
            >
              <div className="w-6 mx-0">
                <div className="w-6 mx-auto">
                  <Icon icon={item.icon} className="h-7 w-7 p-0.5 mx-auto" />
                </div>
              </div>
              <div className="">
                {sidebarOpen && (
                  <div className="text-base font-bold mx-3 w-80 flex">
                    {item.label}
                  </div>
                )}
              </div>
            </Link>
          </TooltipTrigger>
          {!sidebarOpen && (
            <TooltipContent className="bg-forest-900 text-forest-50 dark:bg-forest-50 dark:text-forest-900 rounded-md p-2 text-xs ml-2 font-medium break-inside-auto shadow-md flex z-50">
              {item.label}
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    );

  return (
    <div className="flex flex-col" suppressHydrationWarning>
      <div className="text-xs"></div>
      <Tooltip key={item.label} placement="right">
        <TooltipTrigger className="h-6 pl-0 md:pl-8 overflow-visible">
          <div
            className="group flex items-center justify-items-start mb-2 cursor-pointer"
            onClick={handleToggle}
          >
            <div className="w-6 mx-0">
              <div className="w-6 mx-auto">
                <Icon icon={item.icon} className="h-7 w-7 p-0.5 mx-auto" />
              </div>
            </div>
            {sidebarOpen ? (
              <div className={`flex-1 flex items-start justify-between`}>
                <div className="text-base font-bold mx-3 py-0.5">
                  {item.label}
                </div>
                <Icon
                  icon={
                    isOpen
                      ? "feather:arrow-down-circle"
                      : "feather:arrow-left-circle"
                  }
                  className="w-[13px] h-[13px] mr-[5px] md:mr-5 my-auto"
                />
              </div>
            ) : (
              <div className={`flex-1 flex items-center justify-end`}>
                <Icon
                  icon={
                    isOpen
                      ? "feather:arrow-down-circle"
                      : "feather:arrow-left-circle"
                  }
                  className="w-[13px] h-[13px] mr-2"
                />
              </div>
            )}
          </div>
        </TooltipTrigger>
        {!sidebarOpen && (
          <TooltipContent className="bg-forest-900 text-forest-50 dark:bg-forest-50 dark:text-forest-900 rounded-md p-2 text-xs ml-2 font-medium break-inside-auto shadow-md z-50">
            {item.label}
          </TooltipContent>
        )}
      </Tooltip>

      <div
        className={`flex flex-col overflow-hidden mb-8 w-full md:w-80 transition-height duration-200 ${
          isOpen ? "h-auto mt-4" : "h-0 mt-0"
        }`}
      >
        {item.options.map((option) => {
          return (
            <Tooltip key={option.label} placement="right">
              <TooltipTrigger className="px-0 md:px-5 overflow-visible">
                <Link
                  className={`group flex items-center justify-items-center rounded-full md:rounded-l-full relative ${
                    urlParts[1].trim().localeCompare(option.urlKey) === 0
                      ? "bg-[#CDD8D3] dark:bg-forest-1000 hover:bg-[#F0F5F3] dark:hover:bg-[#5A6462]"
                      : "hover:bg-[#F0F5F3] dark:hover:bg-[#5A6462]"
                  }`}
                  href={`/${item.name.toLowerCase()}/${option.urlKey}`}
                >
                  <div
                    className={`w-6 absolute left-[13px]  ${
                      urlParts[1].trim().localeCompare(option.urlKey) === 0
                        ? "text-inherit"
                        : "text-[#5A6462] group-hover:text-inherit"
                    }`}
                  >
                    {["Fundamentals", "Chains", "Blockspace"].includes(
                      item.name,
                    ) && (
                      <Icon
                        icon={option.icon}
                        className={
                          item.name === "Fundamentals"
                            ? "h-4 w-4 mx-auto"
                            : "h-[15px] w-[15px] mx-auto"
                        }
                      />
                    )}
                  </div>
                  <div
                    className={`text-base py-1 w-48 font-normal break-inside-auto text-left ml-12`}
                  >
                    {sidebarOpen ? option.label : <span>&nbsp;</span>}
                  </div>
                </Link>
              </TooltipTrigger>
              {!sidebarOpen && (
                <TooltipContent className="bg-forest-900 text-forest-50 dark:bg-forest-50 dark:text-forest-900 rounded-md p-2 text-xs font-medium break-inside-auto -ml-56 shadow-md z-50">
                  {option.label}
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
