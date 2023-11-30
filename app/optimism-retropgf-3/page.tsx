"use client";
import useSWR from "swr";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  Project,
  ProjectFundingSource,
  ProjectsResponse,
  List,
  ListAmountsByProjectIdResponse
} from "@/types/api/RetroPGF3";
import Icon from "@/components/layout/Icon";
import { useTheme } from "next-themes";
import ShowLoading from "@/components/layout/ShowLoading";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { last, uniq, debounce } from "lodash";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";
import { OsoTaggedProjects } from "./osoTaggedProjects";
import { formatNumber } from "@/lib/chartUtils";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/layout/Tooltip";
import Container from "@/components/layout/Container";
import { useUIContext } from "@/contexts/UIContext";
// import { TreeMapChart } from "@/components/charts/treemapChart";
import { useElementSize } from "usehooks-ts";

const OsoTaggedProjectsMap = OsoTaggedProjects.reduce((prev, curr) => {
  prev[curr["Project ID"]] = curr;
  return prev;
}, {});

// Collective Governance
// Developer Ecosystem
// End User Experience And Adoption
// Op Stack
const ImpactCategoriesMap = {
  COLLECTIVE_GOVERNANCE: {
    label: "COLL-GOV",
    bg: "bg-blue-500/40",
    border: "border-blue-600",
    textColor: "text-blue-100",
  },

  DEVELOPER_ECOSYSTEM: {
    label: "DEV-ECO",
    bg: "bg-green-600/40",
    border: "border-green-600",
    textColor: "text-green-100",
  },
  END_USER_EXPERIENCE_AND_ADOPTION: {
    label: "END-UX",
    bg: "bg-yellow-600/40",
    border: "border-yellow-600",
    textColor: "text-yellow-100",
  },
  OP_STACK: {
    label: "OP-STACK",
    bg: "bg-[#FF0420]/40",
    border: "border-[#FF0420]-600",
    textColor: "text-white",
  },
};

// const baseURL =
//   process.env.NEXT_PUBLIC_VERCEL_ENV === "development"
//     ? `http://${process.env.NEXT_PUBLIC_VERCEL_URL}`
//     : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;

const baseURL = {
  "development": `http://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
  "preview": "https://dev.growthepie.xyz",
  "production": `https://www.growthepie.xyz`
}

const environment = process.env.NEXT_PUBLIC_VERCEL_ENV || "development";

const multiplierOPToken = 1.35;

export default function Page() {
  const {
    data: projectsResponse,
    isLoading: projectsLoading,
    isValidating: projectsValidating,
  } = useSWR<ProjectsResponse>(baseURL[environment] + "/api/optimism-retropgf-3/projects", {
    refreshInterval: 1 * 1000 * 60, // 1 minutes,
  });

  const {
    data: listAmountsByProjectId,
    isLoading: listAmountsByProjectIdLoading,
    isValidating: listAmountsByProjectIdValidating,
  } = useSWR<ListAmountsByProjectIdResponse>(baseURL[environment] + "/api/optimism-retropgf-3/listAmountsByProjectId", {
    refreshInterval: 1 * 1000 * 60, // 2 minutes,
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [data, setData] = useState<Project[]>([]);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "included_in_ballots",
      desc: true,
    },
  ]);

  const [totalFundingAmounts, setTotalFundingAmounts] = useState<{
    [currency: string]: number;
  }>({});

  const [displayNameFilter, setDisplayNameFilter] = useState<string>("");

  const { isSidebarOpen } = useUIContext();


  useEffect(() => {
    if (projectsResponse) {
      if (data.length === 0 && projects.length === 0)
        setData(projectsResponse.projects);
      setProjects(projectsResponse.projects);

      const tFA: { [currency: string]: number } = {};
      tFA["OP"] = 0;
      tFA["USD"] = 0;
      tFA["OPUSD"] = 0;
      tFA["TOTAL"] = 0;

      projectsResponse.projects.forEach((project) => {
        project.funding_sources.forEach((fundingSource) => {
          tFA[fundingSource.currency] = fundingSource.amount;

          if (fundingSource.currency === "OP") {
            tFA["OPUSD"] += multiplierOPToken * fundingSource.amount;
            tFA["TOTAL"] += multiplierOPToken * fundingSource.amount
          } else {
            tFA["TOTAL"] += fundingSource.amount;
          }
        });
      });

      setTotalFundingAmounts(tFA);
    }
  }, [data, projects.length, projectsResponse]);

  const debouncedFilter = debounce((filter, projects) => {
    if (filter === "") {
      setData(projects);
    } else {
      const filteredProjects = projects.filter((project) =>
        project.display_name.toLowerCase().includes(filter.toLowerCase()),
      );
      setData(filteredProjects);
    }
  }, 250);

  useEffect(() => {
    debouncedFilter(displayNameFilter, projects);

    return () => {
      debouncedFilter.cancel();
    };
  }, [debouncedFilter, displayNameFilter, projects]);

  const { theme } = useTheme();

  const lastUpdatedString = useMemo(() => {
    if (!projectsResponse) return null;

    const oldest = projectsResponse.projects.reduce((prev, curr) => {
      return prev.last_updated < curr.last_updated ? prev : curr;
    });

    const lastUpdated = oldest.last_updated;

    return moment(lastUpdated).fromNow();
  }, [projectsResponse]);


  const getProjectsCombinedFundingSourcesByCurrency = useCallback(
    (fundingSources: ProjectFundingSource[]) => {
      const combinedFundingSources: {
        [currency: string]: number;
      } = {};

      combinedFundingSources["TOTAL"] = 0;
      combinedFundingSources["OP"] = 0;
      combinedFundingSources["OPUSD"] = 0;
      combinedFundingSources["USD"] = 0;


      fundingSources.forEach((fundingSource) => {
        combinedFundingSources[fundingSource.currency] += fundingSource.amount;

        if (fundingSource.currency === "OP") {
          combinedFundingSources["OPUSD"] += multiplierOPToken * fundingSource.amount;
          combinedFundingSources["TOTAL"] += multiplierOPToken * fundingSource.amount;
        } else {
          combinedFundingSources["TOTAL"] += fundingSource.amount;
        }
      });

      return combinedFundingSources;
    },
    [],
  );

  const getAllProjectsCombinedFundingSourcesByCurrency = useCallback(
    (projects: Project[]) => {
      const allCombinedFundingSources: {
        [currency: string]: number;
      }[] = [];

      projects.forEach((project) => {
        allCombinedFundingSources.push(
          getProjectsCombinedFundingSourcesByCurrency(project.funding_sources),
        );
      });

      return allCombinedFundingSources;
    },
    [getProjectsCombinedFundingSourcesByCurrency],
  );

  const getProjectsTotalFundingRank = useCallback(
    (fundingSources: ProjectFundingSource[]) => {
      const total =
        getProjectsCombinedFundingSourcesByCurrency(fundingSources)["TOTAL"];

      const allCombinedFundingSources =
        getAllProjectsCombinedFundingSourcesByCurrency(projects);

      const sorted = allCombinedFundingSources
        .map((d) => d["TOTAL"])
        .sort((a, b) => b - a);

      const rank = sorted.indexOf(total) + 1;

      return rank;
    },
    [
      getAllProjectsCombinedFundingSourcesByCurrency,
      getProjectsCombinedFundingSourcesByCurrency,
      projects,
    ],
  );

  const getMaxTotalFundingAmount = useCallback(() => {
    const allCombinedFundingSources =
      getAllProjectsCombinedFundingSourcesByCurrency(projects);

    const maxTotalFundingAmount = Math.max(
      ...allCombinedFundingSources.map((d) => d["TOTAL"]),
    );

    return maxTotalFundingAmount;
  }, [getAllProjectsCombinedFundingSourcesByCurrency, projects]);


  const getProjectIdUniqueListAuthors = useCallback((projectId: string) => {
    if (!listAmountsByProjectId || !listAmountsByProjectId.listAmounts[projectId]) return [];

    return uniq(listAmountsByProjectId.listAmounts[projectId].map((list) => list.listAuthor.address));
  }, [listAmountsByProjectId]);

  const getProjectIdUniqueListContent = useCallback((projectId: string) => {
    if (!listAmountsByProjectId || !listAmountsByProjectId.listAmounts[projectId]) return [];

    return uniq(listAmountsByProjectId.listAmounts[projectId].map((list) => list.listContent));
  }, [listAmountsByProjectId]);

  const [minListOPAmount, maxListOPAmount] = useMemo<[number, number]>(() => {
    if (!listAmountsByProjectId) return [0, 0];

    const listOPAmounts = Object.values(listAmountsByProjectId.listAmounts).flatMap((listAmounts) => listAmounts.map((listAmount) => listAmount.listContent[0].OPAmount));

    return [Math.min(...listOPAmounts), Math.max(...listOPAmounts)];
  }, [listAmountsByProjectId]);

  const median = (nums: number[]): number => {
    const half = Math.floor(nums.length / 2);

    if (nums.length % 2) {
      return nums[half];
    }

    return (nums[half - 1] + nums[half]) / 2.0;
  };

  const getProjectIdMedianListOPAmount = useCallback((projectId: string) => {
    if (!listAmountsByProjectId || !listAmountsByProjectId.listAmounts[projectId]) return 0;

    const listOPAmounts = listAmountsByProjectId.listAmounts[projectId].sort((a, b) => a.listContent[0].OPAmount - b.listContent[0].OPAmount).map((listAmount) => listAmount.listContent[0].OPAmount);

    return median(listOPAmounts);
  }, [listAmountsByProjectId]);

  const getBoxPlotData: (projectId: string) => { min: number, q1: number, median: number, q3: number, max: number, globalMin: number, globalMax: number } = useCallback((projectId: string) => {
    if (!listAmountsByProjectId || !listAmountsByProjectId.listAmounts[projectId] || !(minListOPAmount + maxListOPAmount)) return { min: 0, q1: 0, median: 0, q3: 0, max: 0, globalMin: 0, globalMax: 0 };

    const numbers = listAmountsByProjectId.listAmounts[projectId].map((listAmount) => listAmount.listContent[0].OPAmount);
    numbers.sort((a, b) => a - b);



    const q1 = median(numbers.slice(0, Math.floor(numbers.length / 2)));
    const q2 = median(numbers);
    const q3 = median(numbers.slice(Math.ceil(numbers.length / 2)));

    const min = numbers[0];
    const max = numbers[numbers.length - 1];

    return { min, q1, median: q2, q3, max, globalMin: minListOPAmount, globalMax: maxListOPAmount };
  }, [listAmountsByProjectId, minListOPAmount, maxListOPAmount]);


  const getValuesInOrdersOfMagnitude = useCallback((value: number) => {
    const ordersOfMagnitude = [
      { label: "", value: 1 },
      { label: "10", value: 10 },
      { label: "1h", value: 100 },
      { label: "1k", value: 1000 },
      { label: "10k", value: 10000 },
      { label: "100k", value: 100000 },
      { label: "1M", value: 1000000 },
      { label: "10M", value: 10000000 },
      { label: "100M", value: 100000000 },
    ];

    // find nearest largest order of magnitude
    let nearestLargestOrderOfMagnitude =
      ordersOfMagnitude[ordersOfMagnitude.length - 1];

    for (let i = 0; i < ordersOfMagnitude.length; i++) {
      if (value < ordersOfMagnitude[i].value)
        nearestLargestOrderOfMagnitude = ordersOfMagnitude[i];

      if (value >= ordersOfMagnitude[i].value) break;
    }

    const result: {
      label: string;
      value: number;
      multiplier?: number;
    }[] = ordersOfMagnitude.slice(
      0,
      ordersOfMagnitude.indexOf(nearestLargestOrderOfMagnitude),
    );

    let remaining = value;

    for (let i = result.length - 1; i >= 0; i--) {
      const multiplier = Math.floor(remaining / result[i].value);

      remaining = remaining - result[i].value * multiplier;

      result[i].multiplier = multiplier;
    }

    return result;
  }, []);

  const IncludeInBallotsByList = useMemo(() => {
    const result: {
      [listName: string]: {
        list: List,
        author: string,
        totalBallotCount: number,
        totalProjectCount: number,
        avgBallotsPerProject: number,
      }
    } = {};

    projects.forEach((project) => {
      project.lists.forEach((list) => {
        if (!result[list.listName])
          result[list.listName] = {
            list: list,
            author: list.author.resolvedName.name ?? list.author.address,
            totalBallotCount: 0,
            totalProjectCount: 0,
            avgBallotsPerProject: 0,
          };

        result[list.listName].totalBallotCount += project.included_in_ballots;
        result[list.listName].totalProjectCount++;
        result[list.listName].avgBallotsPerProject = result[list.listName].totalBallotCount / result[list.listName].totalProjectCount;
      });
    });

    return result;
  }, [projects]);

  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        header: "",
        id: "profile",
        size: 60,
        cell: (info) => (
          <>
            <div className="flex justify-between items-center relative space-x-2 -ml-1">
              {/* <div className="w-4 h-4 flex items-center justify-center text-xs">
                {info.table
                  .getSortedRowModel()
                  .rows.findIndex((d) => d.id === info.row.id) + 1}
              </div> */}
              <div className="w-8 h-8 border border-forest-900/20 dark:border-forest-500/20 rounded-full overflow-hidden">
                {info.row.original.profile.profileImageUrl && (
                  <Image
                    src={info.row.original.profile.profileImageUrl}
                    alt={info.row.original.display_name}
                    width={32}
                    height={32}
                    className="rounded-full"
                    loading="lazy"
                  />
                )}
              </div>

              <div className="text-[0.6rem] text-forest-900/80 dark:text-forest-500/80 font-light w-0 overflow-visible">
                {info.table
                  .getSortedRowModel()
                  .rows.findIndex((d) => d.id === info.row.id) + 1}
              </div>
            </div>
          </>
        ),
        meta: {
          headerStyle: { textAlign: "left" },
        },
      },
      {
        header: "Project",
        accessorKey: "display_name",
        // size: 160,
        cell: (info) => (
          <div className="w-full flex items-center  space-x-2">
            <div className="w-4 h-4">
              {info.row.original.profile.websiteUrl && (
                <Link
                  href={info.row.original.profile.websiteUrl}
                  target="_blank"
                >
                  <Icon
                    icon="feather:external-link"
                    className="w-4 h-4 text-forest-900/80 dark:text-forest-500/80"
                  />
                </Link>
              )}
            </div>

            <div
              className="flex-1 overflow-hidden text-ellipsis font-bold whitespace-nowrap"
            // style={{ whiteSpace: "pre-wrap" }}
            >
              {info.row.original.display_name}
            </div>
          </div>
        ),
        meta: {
          headerStyle: { textAlign: "left" },
        },
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.display_name;
          const b = rowB.original.display_name;

          // If both are equal, return 0.
          if (a === b) return 0;

          // Otherwise, sort by whether a is greater than or less than b.
          return a.localeCompare(b) === 1 ? 1 : -1;
        },
      },
      {
        header: "",
        id: "links",
        size: 30,
        cell: (info) => (
          <div className="w-full flex justify-between items-center">

            <div className="border-2 rounded-md border-forest-900/20 dark:border-forest-500/20 p-1 hover:bg-forest-900/10 dark:hover:bg-forest-500/10">
              <Link href={`https://vote.optimism.io/retropgf/3/application/${info.row.original.id.split('|')[1]}`} rel="noopener noreferrer" target="_blank">
                <Icon icon="gtp:agora" className="w-3 h-3 text-forest-900/80 dark:text-forest-500/80" />
              </Link>
            </div>
          </div>
        ),
      },
      {
        header: "Applicant",
        accessorKey: "applicant",
        size: 150,
        cell: (info) => (
          <div className="w-full flex space-x-2 items-center overflow-hidden whitespace-nowrap text-ellipsis">
            <div className="w-6 h-6 flex items-center justify-center">
              {info.row.original.applicant_type === "PROJECT" ? (
                <Icon
                  icon={"clarity:users-solid"}
                  className="w-6 h-6 text-forest-900/80 dark:text-forest-500/80 fill-current"
                />
              ) : (
                <Icon
                  icon={"clarity:user-solid"}
                  className="w-6 h-4 text-forest-900/80 dark:text-forest-500/80 fill-current"
                />
              )}
            </div>
            <Link
              rel="noopener noreferrer"
              target="_blank"
              href={`https://optimistic.etherscan.io/address/${info.row.original.applicant.address.address}`}
              className={`rounded-full px-1 py-0 border border-forest-900/20 dark:border-forest-500/20 font-mono text-[10px] ${info.row.original.applicant.address.resolvedName.name
                ? "text-forest-900 dark:text-forest-500"
                : "text-forest-900/50 dark:text-forest-500/50"
                } hover:bg-forest-900/10 dark:hover:bg-forest-500/10`}
            >
              {info.row.original.applicant.address.resolvedName.name ? (
                <>{info.row.original.applicant.address.resolvedName.name}</>
              ) : (
                <>
                  {info.row.original.applicant.address.resolvedName.address.slice(
                    0,
                    5,
                  ) +
                    "..." +
                    info.row.original.applicant.address.resolvedName.address.slice(
                      -8,
                    )}
                </>
              )}
            </Link>
          </div>
        ),
        meta: {
          headerStyle: { textAlign: "left" },
        },
        sortingFn: (rowA, rowB) => {
          const nameA = rowA.original.applicant.address.resolvedName.name;
          const nameB = rowB.original.applicant.address.resolvedName.name;

          // if both are undefined, check if addressA is greater than addressB
          if (!nameA && !nameB) {
            const addressA = rowA.original.applicant.address.address;
            const addressB = rowB.original.applicant.address.address;

            if (addressA === addressB) return 0;

            // addresses are strings
            return addressA > addressB ? 1 : -1;
          }

          if (!nameA) return 1;

          if (!nameB) return -1;

          // If both are equal, return 0.
          if (nameA === nameB) return 0;

          // Otherwise, sort by whether a is greater than or less than b.
          return nameA > nameB ? 1 : -1;
        },
      },
      {
        header: "In Ballots",
        accessorKey: "included_in_ballots",
        size: 70,
        cell: (info) => (
          <div className="w-full overflow-hidden whitespace-nowrap text-ellipsis flex justify-end items-center">
            <div className="flex items-center space-x-2">
              <div className="text-[0.9rem] font-medium leading-[1.2] font-inter">
                {info.row.original.included_in_ballots}
              </div>
              <div className="w-4 h-4">
                <Icon
                  icon={"feather:check-square"}
                  className={`w-4 h-4  fill-current ${info.row.original.included_in_ballots >= 17 ? "text-green-500 dark:text-green-500" : "text-forest-900/80 dark:text-forest-500/80"}`}
                />
              </div>
            </div>
          </div>
        ),
        meta: {
          headerAlign: { marginLeft: "auto", flexDirection: "row-reverse" },
        },
      },
      {
        header: "In Lists",
        accessorKey: "lists",
        size: 70,
        cell: (info) => (
          <>
            <div className="w-full whitespace-nowrap text-ellipsis relative">
              <div className="absolute right-0 -bottom-[11px] flex space-x-1 text-[0.55rem] text-forest-900/30 dark:text-forest-500/30 font-light leading-[1]">
                <div className="flex justify-center items-center rounded-sm text-forest-900/30 dark:text-forest-500/30" >{getProjectIdUniqueListAuthors(info.row.original.id).length}</div>
                <div>
                  {getProjectIdUniqueListAuthors(info.row.original.id).length > 1 ? "authors" : "author"}
                </div>
              </div>
              <div className="font-normal w-full flex justify-end font-inter">
                <div className="flex space-x-1">
                  <div>{info.row.original.lists.length}</div>
                  <div className="w-4 h-4 text-forest-900/80 dark:text-forest-500/80">
                    <Icon
                      icon={"feather:list"}
                      className={`w-4 h-4`}
                    // style={{
                    //   color: (info.row.original.lists.length >= 3 && getProjectIdUniqueListAuthors(info.row.original.id).length === 1) ?
                    //     `hsla(${(getProjectIdUniqueListAuthors(info.row.original.id).length / info.row.original.lists.length) * 80}, 71%, 45%, 100%)` :
                    //     `hsla(${(getProjectIdUniqueListAuthors(info.row.original.id).length / info.row.original.lists.length) * 120}, 71%, 45%, 100%)`
                    // }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ),
        meta: {
          headerAlign: { marginLeft: "auto", flexDirection: "row-reverse" },
        },
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.lists.length;
          const b = rowB.original.lists.length;

          // If both are equal, return 0.
          if (a === b) return 0;

          // Otherwise, sort by whether a is greater than or less than b.
          return a > b ? 1 : -1;
        },
      },
      {
        header: "List Amounts",
        accessorKey: "lists",
        size: 100,
        cell: (info) => (
          <>
            <div className="w-full whitespace-nowrap text-ellipsis relative overflow-visible">
              {listAmountsByProjectId && listAmountsByProjectId.listAmounts[info.row.original.id].length > 0 && !Number.isNaN(getBoxPlotData(info.row.original.id).min) && !Number.isNaN(getBoxPlotData(info.row.original.id).max) && (
                <div className="flex text-[0.55rem] text-forest-900/60 dark:text-forest-500/60 font-inter font-light leading-[1]">
                  <div className="absolute left-0 -top-1.5">
                    {formatNumber(getBoxPlotData(info.row.original.id).min, true)}
                  </div>
                  <div className="absolute right-0 left-0 -top-1.5 text-center">—</div>
                  <div className="absolute right-0 -top-1.5">
                    {formatNumber(getBoxPlotData(info.row.original.id).max, true)}
                  </div>
                </div>)}
              {listAmountsByProjectId && listAmountsByProjectId.listAmounts[info.row.original.id].length > 0 && (<Tooltip placement="left" allowInteract>
                <TooltipTrigger className="w-full">
                  <div className="text-[0.7rem] font-normal w-full flex space-x-9.5 items-center font-inter mt-1">
                    {!Number.isNaN(getBoxPlotData(info.row.original.id).q1) && !Number.isNaN(getBoxPlotData(info.row.original.id).q3) ?
                      (<>
                        <div className=" text-forest-900 dark:text-forest-500 font-light leading-[1] text-right">
                          {formatNumber(getBoxPlotData(info.row.original.id).q1, true)}
                        </div>
                        <div className="flex-1 text-forest-900/50 dark:text-forest-500/50">-</div>
                        <div className="text-forest-900 dark:text-forest-500 font-light leading-[1] text-right">
                          {formatNumber(getBoxPlotData(info.row.original.id).q3, true)}{" "}<span className="text-[0.6rem]">OP</span>
                        </div>
                      </>) : (<div className="flex-1 text-forest-900/80 dark:text-forest-500 font-light leading-[1] text-right">
                        {formatNumber(getBoxPlotData(info.row.original.id).median, true)}{" "}<span className="text-[0.6rem]">OP</span>
                      </div>)}
                  </div>
                  <div className="relative bottom-[8px] left-0 right-0 text-xs font-normal text-right h-[2px]">
                    <BoxPlot {...{ ...getBoxPlotData(info.row.original.id) }} />
                  </div>


                </TooltipTrigger>
                <TooltipContent className="z-50 flex items-center justify-center">
                  <div className="flex flex-col space-y-0.5 px-0.5 py-0.5 pt-1 text-[0.65rem] font-medium bg-forest-100 dark:bg-[#4B5553] text-forest-900 dark:text-forest-100 rounded-2xl shadow-lg z-50">
                    <div className="px-3 text-sm">{info.row.original.display_name}</div>
                    <div className="px-3 flex justify-between">{["min", "q1", "median", "q3", "max"].map((key) => (
                      !Number.isNaN(getBoxPlotData(info.row.original.id)[key]) &&
                      <div key={key} className="flex items-center space-x-1">
                        <div className="text-[0.6rem] font-semibold capitalize">{key.slice(0, 3)}</div>
                        <div className="text-[0.6rem] font-light font-inter">{formatNumber(getBoxPlotData(info.row.original.id)[key], true)}</div>
                      </div>
                    ))}</div>
                    {listAmountsByProjectId?.listAmounts[info.row.original.id].sort(
                      (a, b) => a.listContent[0].OPAmount - b.listContent[0].OPAmount
                    ).map((list, i) => (
                      list.listContent.map((listContentItem, j) => (
                        <div key={j} className="flex px-3 py-0.5 justify-between items-center border border-forest-900/20 dark:border-forest-500/20 rounded-full">
                          <div key={j} className="flex flex-col text-[0.6rem] leading-snug">
                            <div className="w-48 font-medium whitespace-nowrap overflow-hidden overflow-ellipsis">{list.listName}</div>
                            <div className="font-light text-forest-900/80 dark:text-forest-500/80">
                              {list.listAuthor.resolvedName.name ? (
                                <>{list.listAuthor.resolvedName.name}</>
                              ) : (
                                <>
                                  {list.listAuthor.address.slice(
                                    0,
                                    5,
                                  ) +
                                    "..." +
                                    list.listAuthor.address.slice(
                                      -8,
                                    )}
                                </>
                              )}
                            </div>

                          </div>
                          <div className="w-16 font-inter font-[600] text-xs text-right">
                            {formatNumber(listContentItem.OPAmount, true)}{" "}<span className="text-[10px] font-light text-forest-900/80 dark:text-forest-500/80">OP</span>
                          </div>
                        </div>
                      ))

                    ))}

                  </div>

                </TooltipContent>
              </Tooltip>)}
            </div>
          </>
        ),
        sortingFn: (rowA, rowB) => {
          const a = getProjectIdMedianListOPAmount(rowA.original.id);
          const b = getProjectIdMedianListOPAmount(rowB.original.id);

          if (Number.isNaN(a) && Number.isNaN(b)) return 0;

          if (Number.isNaN(a)) return -1;

          if (Number.isNaN(b)) return 1;


          // If both are equal, return 0.
          if (a === b) return 0;

          // Otherwise, sort by whether a is greater than or less than b.
          return a > b ? 1 : -1;
        },
      },

      {
        header: () => (
          <div>
            <div className="flex">
              Funding Reported
              <div className="relative">
                <Tooltip placement="left" allowInteract>
                  <TooltipTrigger>
                    <Icon icon="feather:info" className="w-4 h-4 absolute left-3 top-0" />
                  </TooltipTrigger>
                  <TooltipContent className="z-50 flex items-center justify-center">
                    <div className="-mr-3.5 px-3 py-1.5 w-64 text-sm font-medium bg-forest-100 dark:bg-[#4B5553] text-forest-900 dark:text-forest-100 rounded-xl shadow-lg z-50 flex items-center">
                      <div className="flex flex-col text-xs space-y-1">
                        <div className="font-light">
                          Total{" "}
                          <span className="font-semibold">Funding Reported</span>{" "}
                          is calculated based on the project&apos;s reported USD and OP amounts.
                        </div>
                        <div className="flex flex-col">
                          <div className="font-light">For OP tokens we calculated with $1.35</div>
                          <div className="text-[0.65rem] leading-snug text-forest-900/80 dark:text-forest-500/80">(OP price when RPGF applications were closed).</div>
                        </div>
                        <div className="font-light text-[0.7rem] leading-tight pt-2"><span className="font-medium">Note:</span> The application requirements for RPGF3 specified disclosure of funding sources from the OP Collective only; VC and other sources were often not included.</div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        ),
        accessorKey: "funding_sources",
        size: 150,
        cell: (info) => {
          return (
            <div className="w-full whitespace-nowrap text-ellipsis relative">
              <div className="absolute -left-0 -top-2.5 text-[0.6rem] text-forest-900/30 dark:text-forest-500/30 font-light leading-[1]">
                #
                {getProjectsTotalFundingRank(info.row.original.funding_sources)}
              </div>
              <div className="text-[11px] font-normal w-full flex justify-between font-inter mt-1">
                <div className="flex space-x-1">
                  {["TOTAL"]
                    .map((currency) => [
                      currency,
                      getProjectsCombinedFundingSourcesByCurrency(
                        info.row.original.funding_sources,
                      )[currency],
                    ])
                    .map(([currency, value]) => (
                      <div key={currency}>
                        <span className="opacity-60 text-[0.55rem]">$</span>
                        {`${formatNumber(
                          parseInt(value as string),
                          false,
                        ).toLocaleString()}`}
                      </div>
                    ))
                    .reduce((prev, curr) => {
                      return prev.length === 0
                        ? [curr]
                        : [prev, <div key={curr[0]}>&</div>, curr];
                    }, [])}
                  <div className="w-4"></div>
                </div>
              </div>
              <div className="relative -bottom-[2px] left-0 right-0 text-xs font-normal text-right h-[2px]">
                <div
                  className="absolute"
                  style={{
                    height: "2px",
                    width: `100%`,

                  }}
                >
                  <div
                    className=" bg-forest-900 dark:bg-forest-500"
                    style={{
                      height: "2px",

                      width: `${(getProjectsCombinedFundingSourcesByCurrency(
                        info.row.original.funding_sources,
                      )["TOTAL"] /
                        getMaxTotalFundingAmount()) *
                        100.0
                        }%`,
                      // right with bases on bottom and right
                    }}
                  ></div>
                </div>
                <div
                  className="absolute bg-forest-900/30 dark:bg-forest-500/30"
                  style={{
                    height: "2px",
                    width: `100%`,
                  }}
                />
              </div>
            </div>
          );
        },
        meta: {
          headerAlign: { textAlign: "left" },
        },
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const a = getProjectsCombinedFundingSourcesByCurrency(
            rowA.original.funding_sources,
          )["TOTAL"];

          const b = getProjectsCombinedFundingSourcesByCurrency(
            rowB.original.funding_sources,
          )["TOTAL"];

          // If both are equal, return 0.
          if (a === b) return 0;

          // Otherwise, sort by whether a is greater than or less than b.
          return a > b ? 1 : -1;
        },
      },
      {
        header: "Funding Split",
        id: "funding_split",
        accessorKey: "funding_sources",
        size: 150,
        cell: (info) => {
          return (
            <div className="w-full overflow-x whitespace-nowrap text-ellipsis relative">
              <div className="text-[11px] font-normal w-full flex justify-between font-inter mt-1">
                <div className="w-full flex justify-between">
                  {["USD", "OP"]
                    .map((currency) => [
                      currency,
                      getProjectsCombinedFundingSourcesByCurrency(
                        info.row.original.funding_sources,
                      )[currency],
                    ])
                    // .filter(([currency, value]) => value !== 0)
                    .map(([currency, value]) => (
                      <div
                        key={currency}
                        className="flex space-x-1 text-[0.6rem]"
                      >
                        {(value as number) > 0 ? (
                          <>
                            <div
                              className={
                                currency === "OP"
                                  ? "text-[#FE5468] leading-[1.6] font-[500]"
                                  : "text-[#7fdcd6] leading-[1.6] font-[400]"
                              }
                            >
                              {currency === "USD" && (<span className="opacity-60 text-[0.55rem]">$</span>)}
                              {parseInt(value as string).toLocaleString()}
                              {currency === "OP" && (<>{" "}<span className="opacity-60 text-[0.55rem]">OP</span></>)}

                            </div>
                          </>
                        ) : (
                          <div className="text-forest-900/30 dark:text-forest-500/30">
                            0
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
              <div className="absolute -bottom-1 left-0 right-0 text-xs font-normal text-right">
                <div
                  className="relative z-10"
                  style={{
                    height: "2px",
                    width: `${(getProjectsCombinedFundingSourcesByCurrency(
                      info.row.original.funding_sources,
                    )["TOTAL"] /
                      getProjectsCombinedFundingSourcesByCurrency(
                        info.row.original.funding_sources,
                      )["TOTAL"]) *
                      100.0
                      }%`,
                  }}
                >
                  <div
                    className="absolute bg-[#7fdcd6]"
                    style={{
                      height: "2px",
                      width: `${(getProjectsCombinedFundingSourcesByCurrency(
                        info.row.original.funding_sources,
                      )["USD"] /
                        getProjectsCombinedFundingSourcesByCurrency(
                          info.row.original.funding_sources,
                        )["TOTAL"]) *
                        100.0
                        }%`,
                    }}
                  ></div>
                  <div
                    className="absolute bg-[#FE5468]"
                    style={{
                      height: "2px",
                      left:
                        getProjectsCombinedFundingSourcesByCurrency(
                          info.row.original.funding_sources,
                        )["USD"] !== 0
                          ? `${(getProjectsCombinedFundingSourcesByCurrency(
                            info.row.original.funding_sources,
                          )["USD"] /
                            getProjectsCombinedFundingSourcesByCurrency(
                              info.row.original.funding_sources,
                            )["TOTAL"]) *
                          100.0
                          }%`
                          : 0,
                      width: `${(getProjectsCombinedFundingSourcesByCurrency(
                        info.row.original.funding_sources,
                      )["OPUSD"] /
                        getProjectsCombinedFundingSourcesByCurrency(
                          info.row.original.funding_sources,
                        )["TOTAL"]) *
                        100.0
                        }%`,
                    }}
                  ></div>
                </div>
                <div
                  className="absolute inset-0 z-0 bg-forest-900/30 dark:bg-forest-500/30"
                  style={{
                    height: "2px",
                    width: `100%`,
                  }}
                />
              </div>
            </div>
          );
        },
        meta: {
          headerAlign: { textAlign: "left" },
        },
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const a = getProjectsCombinedFundingSourcesByCurrency(
            rowA.original.funding_sources,
          )["TOTAL"];

          const b = getProjectsCombinedFundingSourcesByCurrency(
            rowB.original.funding_sources,
          )["TOTAL"];

          // If both are equal, return 0.
          if (a === b) return 0;

          // Otherwise, sort by whether a is greater than or less than b.
          return a > b ? 1 : -1;
        },
      },
      {
        header: () => (
          <div className="flex w-full justify-end">
            <div className="relative">
              <Tooltip placement="left" allowInteract>
                <TooltipTrigger className="absolute right-3 top-0">
                  <Icon icon="feather:info" className="w-4 h-4 " />
                </TooltipTrigger>
                <TooltipContent className="pr-0 z-50 flex items-center justify-center">
                  <div className="px-3 py-1.5 w-64 text-sm font-medium bg-forest-100 dark:bg-[#4B5553] text-forest-900 dark:text-forest-100 rounded-xl shadow-lg z-50 flex items-center">
                    <div className="flex flex-col text-xs space-y-1">
                      <div className="font-light">
                        <span className="font-semibold">VC Funding</span>{" "}
                        amounts are sourced from publicly available data and the community.
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">Sources:</span>
                        <Link rel="noopener noreferrer" target="_blank" href="https://twitter.com/zachxbt/status/1729290605711245573?t=QuUaMlTM1HHBDs_T4YAiNg&s=19" className="underline font-light">
                          @ZachXBT
                        </Link>
                        <Link rel="noopener noreferrer" target="_blank" href="https://defillama.com/raises" className="underline font-light">
                          DefiLlama
                        </Link>
                      </div>
                      <div className="text-[0.7rem] font-light leading-snug pt-2">
                        If you have any feedback or suggestions, please don&apos;t hesistate to contact us on
                        {" "}
                        <Link
                          href="https://twitter.com/growthepie_eth"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >X/Twitter</Link>
                        {' or '}
                        <Link
                          href="https://discord.gg/fxjJFe7QyN"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >Discord</Link>.
                      </div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            VC Funding
          </div>
        ),
        accessorKey: "value_raised",
        size: 100,
        // id: "reported",
        cell: (info) => (
          <div className="w-full overflow-x whitespace-nowrap text-ellipsis relative flex justify-end font-inter text-sm">
            {info.row.original.value_raised !== null ? <div className="flex items-end">
              <div className="flex items-center space-x-2">

                {info.row.original.value_raised > 0 ?
                  (<>
                    <div className="text-[0.9rem] font-medium leading-[1.2] font-inter flex items-end">
                      <div className="opacity-60 text-[0.65rem]">$</div>
                      {formatNumber(info.row.original.value_raised, true).replace(".0", "")}
                    </div>
                    <div className="w-5 h-5">
                      <Icon
                        icon={"fluent:money-16-regular"}
                        className={`w-5 h-5 fill-current text-forest-900/80 dark:text-forest-500/80`}
                      />
                    </div>
                  </>) : (<div className="text-[0.7rem] font-medium leading-[1.2] font-inter flex items-end">No VC Funding</div>)
                }


              </div>
            </div> : <div className="text-forest-900/30 dark:text-forest-500/30 text-[0.6rem]">Unknown / DYOR</div>}
          </div>
        ),
        meta: {
          headerAlign: { marginLeft: "auto", flexDirection: "row-reverse" },
        },
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.value_raised;
          const b = rowB.original.value_raised;

          if (a === null && b === null) return 0;

          if (a === null) return -1;

          if (b === null) return 1;

          // If both are equal, return 0.
          if (a === b) return 0;

          // Otherwise, sort by whether a is greater than or less than b.
          return a > b ? 1 : -1;
        },
      },
      {
        header: () => (
          <Tooltip placement="left" allowInteract>
            <TooltipTrigger>
              <Icon icon={"game-icons:two-coins"} className="w-6 h-6" />
            </TooltipTrigger>
            <TooltipContent className="pr-0 z-50 flex items-center justify-center">
              <div className="px-3 py-1.5 w-64 text-sm font-medium bg-forest-100 dark:bg-[#4B5553] text-forest-900 dark:text-forest-100 rounded-xl shadow-lg z-50 flex items-center">
                <div className="flex flex-col text-xs space-y-1">
                  <div className="">
                    <span className="font-bold">Has Token</span>{" "}
                    <span className="font-light">
                      indicates whether the project has a token and is sourced from publicly available data and the community.
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <span className="font-semibold">Sources:</span>
                    <Link rel="noopener noreferrer" target="_blank" href="https://twitter.com/zachxbt/status/1729290605711245573?t=QuUaMlTM1HHBDs_T4YAiNg&s=19" className="underline font-light">
                      @ZachXBT
                    </Link>
                    <Link rel="noopener noreferrer" target="_blank" href="https://defillama.com/raises" className="underline font-light">
                      DefiLlama
                    </Link>
                  </div>
                  <div className="text-[0.7rem] font-light leading-snug pt-2">
                    If you have any feedback or suggestions, please don&apos;t hesistate to contact us on
                    {" "}
                    <Link
                      href="https://twitter.com/growthepie_eth"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >X/Twitter</Link>
                    {' or '}
                    <Link
                      href="https://discord.gg/fxjJFe7QyN"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >Discord</Link>.
                  </div>
                  {/* <span className="font-light">is calculated based on the reported USD and OP amount.<br /><br />For OP tokens we calculated with $1.35 (OP price when RPGF applications were closed).<br /><br /><span className="font-bold">Note:</span> Projects only had to report funding they received from the collective, many didn&apos;t include VC funding and other funding sources.</span> */}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ),
        accessorKey: "has_token",
        size: 40,
        cell: (info) => (
          <div className="w-full flex justify-between items-center">

            <div className="w-6 h-6">
              {info.row.original.has_token &&
                <Tooltip placement="left">
                  <TooltipTrigger>
                    <Icon
                      icon={"game-icons:two-coins"}
                      className={`w-6 h-6 dark:text-yellow-400/80 text-yellow-500/80 fill-current`}
                    />
                  </TooltipTrigger>
                  <TooltipContent className="pr-0 z-50 flex items-center justify-center">
                    <div className="px-3 py-1.5 text-sm font-medium bg-forest-100 dark:bg-[#4B5553] text-forest-900 dark:text-forest-100 rounded-xl shadow-lg z-50 flex items-center">
                      <div className="text-xs space-x-1">
                        <span className="font-light">This project has a <span className="font-bold">token</span>.</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              }
            </div>
          </div>
        ),
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.has_token;
          const b = rowB.original.has_token;

          // If both are equal, return 0.
          if (a === b) return 0;

          // Otherwise, sort by whether a is greater than or less than b.
          return a ? 1 : -1;
        },

      },

      {
        header: "Categories",
        accessorKey: "impact_category",
        // size: 500,
        cell: (info) => (
          <div className="w-full overflow-hidden whitespace-nowrap text-ellipsis pr-8">
            <div className="flex gap-x-0.5">
              {Object.keys(ImpactCategoriesMap).map((d) => (
                <div key={d} className="w-[35px]">
                  {info.row.original.impact_category.includes(d) ? (
                    <div
                      key={d}
                      className={`border-0 ${ImpactCategoriesMap[d].bg} ${ImpactCategoriesMap[d].textColor} px-1.5 py-0.5 rounded-sm flex items-center justify-center flex-col`}
                    >
                      {ImpactCategoriesMap[d].label.split("-").map((d) => (
                        <div
                          key={d}
                          className="leading-normal text-[0.5rem] font-semibold"
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      key={d}
                      className={`bg-gray-600/5 px-1.5 py-0.5 rounded-sm flex items-center justify-center flex-col`}
                    >
                      {ImpactCategoriesMap[d].label.split("-").map((d) => (
                        <div
                          key={d}
                          className="leading-normal text-[0.5rem] font-semibold opacity-0"
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ),
        meta: {
          headerStyle: { textAlign: "left" },
        },
        sortingFn: (rowA, rowB) => {
          const categoriesA: string = rowA.original.impact_category
            .sort((a: string, b: string) => {
              return a.localeCompare(b) === 1 ? 1 : -1;
            })
            .join("");
          const categoriesB: string = rowB.original.impact_category
            .sort((a: string, b: string) => {
              return a.localeCompare(b) === 1 ? 1 : -1;
            })
            .join("");

          // Otherwise, sort by whether a is greater than or less than b.
          return categoriesA > categoriesB ? 1 : -1;

          // If both are equal, return 0.
          //   if (categoriesA.join("") === categoriesB.join("")) return 0;

          //   if (categoriesA.length === categoriesB.length) {
          //     let i = 1;
          //     while (i < categoriesA.length) {
          //       if (
          //         categoriesA.slice(0, categoriesA.length - i).join("") ===
          //         categoriesB.slice(0, categoriesB.length - i).join("")
          //       )
          //         return 1;
          //       i++;
          //     }
          //   } else if (categoriesA.length > categoriesB.length) {
          //     let i = 1;
          //     while (i < categoriesA.length) {
          //       if (
          //         categoriesA.slice(0, categoriesA.length - i).join("") ===
          //         categoriesB.join("")
          //       )
          //         return 1;
          //       i++;
          //     }
          //   } else if (categoriesB.length > categoriesA.length) {
          //     let i = 1;
          //     while (i < categoriesB.length) {
          //       if (
          //         categoriesB.slice(0, categoriesB.length - i).join("") ===
          //         categoriesA.join("")
          //       )
          //         return -1;
          //       i++;
          //     }
          //   }
          // },
        },
      },
      // {
      //   header: "Last Updated",
      //   accessorKey: "last_updated",
      //   // size: 15,
      //   cell: (info) => (
      //     <div className="w-full overflow-hidden whitespace-nowrap text-ellipsis text-right">
      //       {moment(info.row.original.last_updated).fromNow(true)}
      //     </div>
      //   ),
      //   meta: {
      //     headerAlign: {
      //       marginLeft: "auto",
      //       flexDirection: "row-reverse",
      //     },
      //   },
      //   sortingFn: (rowA, rowB) => {
      //     const a = moment(rowA.original.last_updated).unix();
      //     const b = moment(rowB.original.last_updated).unix();

      //     // If both are equal, return 0.
      //     if (a === b) return 0;

      //     // Otherwise, sort by whether a is greater than or less than b.
      //     return a > b ? 1 : -1;
      //   },
      // },
    ],

    [getMaxTotalFundingAmount, getProjectsCombinedFundingSourcesByCurrency, getProjectsTotalFundingRank, getProjectIdUniqueListAuthors, getBoxPlotData, listAmountsByProjectId],
  );

  // const projectsUniqueValues = useMemo(() => {
  //   if (!projects) return null;
  //   const uniqueValues = {
  //     usd_funding: uniq(
  //       projects.map(
  //         (d) =>
  //           getProjectsCombinedFundingSourcesByCurrency(d.funding_sources)[
  //           "USD"
  //           ],
  //       ),
  //     ).length,
  //     op_funding: uniq(
  //       projects.map(
  //         (d) =>
  //           getProjectsCombinedFundingSourcesByCurrency(d.funding_sources)[
  //           "OP"
  //           ],
  //       ),
  //     ).length,
  //   };

  //   return uniqueValues;
  // }, [getProjectsCombinedFundingSourcesByCurrency, projects]);

  // const dataUniqueValues = useMemo(() => {
  //   if (!data) return null;
  //   const uniqueValues = {
  //     usd_funding: uniq(
  //       data.map(
  //         (d) =>
  //           getProjectsCombinedFundingSourcesByCurrency(d.funding_sources)[
  //           "USD"
  //           ],
  //       ),
  //     ).length,
  //     op_funding: uniq(
  //       data.map(
  //         (d) =>
  //           getProjectsCombinedFundingSourcesByCurrency(d.funding_sources)[
  //           "OP"
  //           ],
  //       ),
  //     ).length,
  //   };

  //   return uniqueValues;
  // }, [data, getProjectsCombinedFundingSourcesByCurrency]);

  const table = useReactTable<Project>({
    data,
    columns,
    state: {
      sorting,
    },
    enableMultiSort: true,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: useMemo(() => getSortedRowModel(), []),
  });

  const { rows } = table.getRowModel();

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
    overscan: 10,
  });

  const Style = useMemo(
    () => (
      <style>
        {`
        table {
            border-collapse:separate;
            border-spacing:0 5px;
            margin-top:-5px;
        }
        
        td {
            border-color: ${theme === "light" ? "rgba(0,0,0,0.16)" : "rgba(255,255,255,0.16)"
          };
            border-width:1px;
            border-style:solid none;
            padding:5px 10px;
        }
        
        td:first-child {
            border-left-style:solid;
            border-top-left-radius:999px;
            border-bottom-left-radius:999px;
        }
        
        td:last-child {
            border-right-style:solid;
            border-bottom-right-radius:999px;
            border-top-right-radius:999px;
        }
      `}
      </style>
    ),
    [theme],
  );

  const maxIncludedInBallots = useMemo(() => {
    if (!projects) return 0;
    return Math.max(...projects.map((d) => d.included_in_ballots));
  }, [projects]);

  const stringToHexColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++)
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return `#${"00000".substring(0, 6 - c.length)}${c}`;
  }

  const tableMinWidthClass = "min-w-[1250px]";

  const [contentRef, { width: contentWidth }] = useElementSize();
  const [tableRef, { width: tableWidth }] = useElementSize();

  const [isTableWidthWider, setIsTableWidthWider] = useState(false);

  useLayoutEffect(() => {
    setIsTableWidthWider(tableWidth > contentWidth);
  }, [contentWidth, tableWidth]);

  return (
    <>
      {/* <Container className={`mt-[0px] !pr-0 ${isSidebarOpen ? "min-[1550px]:!pr-[50px]" : "min-[1350px]:!pr-[50px]"}`} ref={containerRef}> */}
      <Container>
        <div className={`w-full flex justify-between items-center mt-[10px] mb-[10px]`} ref={contentRef}>
          <div className="w-1/2">
            <div className="relative">
              <input
                className="block rounded-full pl-6 pr-3 py-1.5 w-full z-20 text-xs text-forest-900  bg-forest-100 dark:bg-forest-1000 dark:text-forest-500 border border-forest-500 dark:border-forest-700 focus:outline-none hover:border-forest-900 dark:hover:border-forest-400 transition-colors duration-300"
                placeholder="Project Filter"
                value={displayNameFilter}
                onChange={(e) => {
                  setDisplayNameFilter(e.target.value);
                  // setDisplayNameFilter(e.target.value);
                  // router.push("/contracts/" + e.target.value);
                  // debouncedSearch();
                }}

              />
              <Icon
                icon="feather:search"
                className="w-4 h-4 absolute left-1.5 top-1.5"
              />
              {displayNameFilter.length > 0 && (
                <div
                  className="absolute right-2.5 top-1.5 underline cursor-pointer text-forest-900 dark:text-forest-500 text-xs font-light leading-[1.2]"
                  onClick={() => {
                    setDisplayNameFilter("");
                  }}>
                  clear
                </div>
              )}
            </div>
          </div>
          <div className="text-xs font-normal text-forest-200 dark:text-forest-400">
            Last updated {lastUpdatedString}
          </div>
        </div>
      </Container>
      <Container className={`w-full mt-[0px] h-100 ${isTableWidthWider ? "!px-0" : "!px-[20px] md:!px-[50px]"}`}>
        <div className={`w-full ${isTableWidthWider ? "!px-[20px] md:!px-[50px] overflow-x-scroll" : "overflow-x-hidden"} z-100 scrollbar-thin scrollbar-thumb-forest-900 scrollbar-track-forest-500/5 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scroller`}>
          <div className={tableMinWidthClass}>
            <div className="flex flex-col items-center justify-center w-full h-full relative">
              <ShowLoading
                dataLoading={[projectsLoading]}
                dataValidating={[projectsValidating]}
                fullScreen
              />

              {Style}

              <div className={`${tableMinWidthClass} pr-4`} >
                <table className="table-fixed w-full" ref={tableRef}>
                  {/* <thead className="sticky top-0 z-50"> */}
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header, i) => {
                          return (
                            <th
                              key={header.id}
                              colSpan={header.colSpan}
                              style={{
                                width: header.getSize(),
                                paddingLeft: i === 0 ? "20px" : "20px",
                                paddingRight:
                                  i === headerGroup.headers.length ? "20px" : "10px",
                              }}
                              className="whitespace-nowrap relative"
                            >
                              {header.isPlaceholder ? null : (
                                <div className="w-full relative">
                                  <div
                                    className={
                                      header.column.getCanSort()
                                        ? `-mb-1 cursor-pointer select-none flex items-start text-forest-900 dark:text-forest-500 text-xs font-bold w-fit ${i === 0 ? "pl-[10px]" : ""
                                        }`
                                        : ""
                                    }
                                    style={{
                                      ...(header.column.columnDef.meta as any)
                                        ?.headerAlign,
                                    }}
                                    onClick={(e) => {
                                      const handler =
                                        header.column.getToggleSortingHandler();
                                      handler && handler(e);
                                    }}
                                  >
                                    {flexRender(
                                      header.column.columnDef.header,
                                      header.getContext(),
                                    )}
                                    {{
                                      asc: (
                                        <Icon
                                          icon="feather:arrow-up"
                                          className="w-3 h-3"
                                        />
                                      ),
                                      desc: (
                                        <Icon
                                          icon="feather:arrow-down"
                                          className="w-3 h-3"
                                        />
                                      ),
                                    }[header.column.getIsSorted() as string] ?? null}
                                    {/*projectsUniqueValues?.hasOwnProperty(header.id) &&
                                    dataUniqueValues?.hasOwnProperty(header.id) && (
                                      <div className="text-[11px] font-normal w-full text-right pr-3 font-inter">
                                        {dataUniqueValues[header.id] ===
                                          projectsUniqueValues[header.id] ? (
                                          projectsUniqueValues[
                                            header.id
                                          ].toLocaleString()
                                        ) : (
                                          <>
                                            {dataUniqueValues[
                                              header.id
                                            ].toLocaleString()}
                                            <span className="text-forest-900/30 dark:text-forest-500/30">
                                              {"/"}
                                              {projectsUniqueValues[
                                                header.id
                                              ].toLocaleString()}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    )*/}
                                  </div>
                                  {/*projectsUniqueValues?.hasOwnProperty(header.id) &&
                                  dataUniqueValues?.hasOwnProperty(header.id) && (
                                    <div
                                      className={`absolute -bottom-1.5 ${i === 0
                                        ? "left-[30px] right-3"
                                        : "left-0 right-3"
                                        } text-xs font-normal text-right`}
                                    >
                                      <div
                                        className="bg-forest-900 dark:bg-forest-500"
                                        style={{
                                          height: "1px",
                                          width: `${(dataUniqueValues[header.id] /
                                            projectsUniqueValues[header.id]) *
                                            100.0
                                            }%`,
                                        }}
                                      />
                                      <div
                                        className="bg-forest-900/30 dark:bg-forest-500/30"
                                        style={{
                                          height: "1px",
                                          width: `100%`,
                                        }}
                                      />
                                    </div>
                                      )*/}
                                </div>
                              )}
                            </th>
                          );
                        })}
                      </tr>
                    ))}
                  </thead>
                </table>
              </div>
              <div
                className={`transition-[mask-size] duration-300 ease-in-out
                ${
                  // if scroll is at top or bottom, don't show the fade
                  parentRef.current &&
                    (parentRef.current.scrollTop < 30 ||
                      parentRef.current.scrollTop >
                      parentRef.current.scrollHeight -
                      parentRef.current.clientHeight -
                      30)
                    ? "fade-edge-div-vertical-hidden"
                    : "fade-edge-div-vertical"
                  }}`}
              >
                <div
                  ref={parentRef}
                  className="min-h-[300px] h-[calc(100vh-330px)] md:h-[calc(100vh-380px)] overflow-auto pr-2 scrollbar-thin scrollbar-thumb-forest-900 scrollbar-track-forest-500/5 scrollbar-thumb-rounded-full scrollbar-track-rounded-full scroller"
                >
                  <div
                    style={{ height: `${virtualizer.getTotalSize()}px` }}
                    className="w-full"
                  >
                    {/* <div className="absolute top-10 left-0 right-0 h-5 z-10 bg-white dark:bg-forest-1000" /> */}
                    <table className="table-fixed w-full">
                      {/* <thead className="sticky top-0 z-50"> */}
                      <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                          <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header, i) => {
                              return (
                                <th
                                  key={header.id}
                                  colSpan={header.colSpan}
                                  style={{
                                    height: "0px",
                                    overflow: "hidden",
                                    width: header.getSize(),
                                    paddingLeft: i === 0 ? "20px" : "20px",
                                    paddingRight:
                                      i === headerGroup.headers.length
                                        ? "20px"
                                        : "10px",
                                    ...(header.column.columnDef.meta as any)
                                      ?.headerStyle,
                                  }}
                                  className={`${
                                    // i === 0
                                    //   ? "sticky top-0 z-20"
                                    //   : "sticky top-0 left-0 z-30"
                                    ""
                                    } bg-white dark:bg-forest-1000 whitespace-nowrap`}
                                >
                                  {header.isPlaceholder ? null : (
                                    <div
                                      {...{
                                        className: header.column.getCanSort()
                                          ? `-mb-2 cursor-pointer select-none flex items-start text-forest-900 dark:text-forest-500 text-xs font-bold h-0 ${i === 0 ? "pl-[10px]" : ""
                                          }`
                                          : "",
                                        onClick:
                                          header.column.getToggleSortingHandler(),
                                      }}
                                    >
                                      {/* {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              {{
                                asc: (
                                  <Icon
                                    icon="feather:arrow-up"
                                    className="w-3 h-3"
                                  />
                                ),
                                desc: (
                                  <Icon
                                    icon="feather:arrow-down"
                                    className="w-3 h-3"
                                  />
                                ),
                              }[header.column.getIsSorted() as string] ?? null} */}
                                    </div>
                                  )}
                                </th>
                              );
                            })}
                          </tr>
                        ))}
                      </thead>
                      <tbody className="text-xs pb-4">
                        {virtualizer.getVirtualItems().map((virtualRow, index) => {
                          const row = rows[virtualRow.index] as Row<Project>;
                          return (
                            <tr
                              key={row.id}
                              style={{
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start - index * virtualRow.size
                                  }px)`,
                              }}
                            >
                              {row.getVisibleCells().map((cell, i) => {
                                return (
                                  <td
                                    key={cell.id}
                                    style={{ paddingLeft: i === 0 ? "10px" : "20px" }}
                                    className={i === 0 ? "sticky left-0 z-10" : ""}
                                  >
                                    {flexRender(
                                      cell.column.columnDef.cell,
                                      cell.getContext(),
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}

// The props type
type BoxPlotProps = {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  scale?: number; // To scale the plot within the table cell
  globalMin: number; // To scale the plot within the table cell
  globalMax: number; // To scale the plot within the table cell
};

const BoxPlot: React.FC<BoxPlotProps> = ({ min, q1, median, q3, max, scale = 100, globalMin, globalMax }) => {

  // Function to calculate log-scaled position
  const getScalePos = (value: number, globalMin: number, globalMax: number, scale: number, mode: "log" | "linear" | "sqrt" = "sqrt") => {
    if (mode === "linear") {
      const position = (value / globalMax) * scale;
      return position;
    }

    if (mode === "sqrt") {
      const position = (Math.sqrt(value) / Math.sqrt(globalMax)) * scale;
      return position;
    }

    const logMin = Math.log(globalMin <= 0 ? 1 : globalMin);
    const logMax = Math.log(globalMax);
    const logValue = Math.log(value <= 0 ? 1 : value);
    const logRange = logMax - logMin;
    const logPosition = logValue - logMin;
    const position = (logPosition / logRange) * scale;
    return position;
  };

  // Calculate positions using log scale
  const minPos = getScalePos(min, globalMin, globalMax, scale);
  const q1Pos = getScalePos(q1, globalMin, globalMax, scale);
  const medianPos = getScalePos(median, globalMin, globalMax, scale);
  const q3Pos = getScalePos(q3, globalMin, globalMax, scale);
  const maxPos = getScalePos(max, globalMin, globalMax, scale);

  const width = q3Pos - q1Pos; // Width of the box (Q1 to Q3)

  return (
    <div className="relative flex items-center h-6" style={{ width: `${scale}%` }}>
      {/* spacer */}
      <div style={{ width: `${minPos}px` }}></div>
      {/* Line for min */}
      {/* <div className="h-[2px] bg-forest-900/30 dark:bg-forest-500/30" style={{ width: '1px' }}></div> */}

      {/* Line for min to Q1 */}
      <div className="h-[2px] -mt-[2px]  bg-forest-900/50 dark:bg-forest-500/50" style={{ width: `${q1Pos - minPos}%` }}></div>

      {/* Box for Q1 to Q3 */}
      <div className="relative h-[3px] rounded-xs bg-forest-900/80 dark:bg-forest-500/80" style={{ width: `${medianPos - q1Pos}%` }} />
      {/* Line for median */}
      {/* <div className="absolute h-[2px] bg-forest-900 dark:bg-forest-500" style={{ left: `${medianPos}px`, width: '1px' }}></div> */}
      <div className="h-[4px] -mb-[1px] bg-forest-900 dark:bg-forest-500" style={{ left: `0%`, width: '1px' }}></div>
      {/* </div> */}
      {/* <div className="h-[5px] bg-forest-900 dark:bg-forest-500" style={{ left: `${medianPos}px`, width: '1px' }}></div> */}
      <div className="relative h-[3px] rounded-xs bg-forest-900/80 dark:bg-forest-500/80" style={{ width: `${q3Pos - medianPos}%` }} />


      {/* Line for Q3 to max */}
      <div className="h-[2px] -mt-[2px]  bg-forest-900/50 dark:bg-forest-500/50" style={{ width: `${maxPos - q3Pos}%` }}></div>

      {/* Line for max */}
      {/* <div className="h-[2px] bg-forest-900/30 dark:bg-forest-500/30" style={{ left: `${maxPos}px`, width: '1px' }}></div> */}
      {/* background */}
      <div className="absolute -mt-[2px] w-full h-[2px] bg-forest-900/20 dark:bg-forest-500/20 rounded-xs -z-10" />
    </div>
  );
};

// {
//   "id": "Project|0xc754e70f8d64d1923e4fb7591e0cad3790d4e164b3b11a8db1c1356714037792",
//   "included_in_ballots": 6,
//   "display_name": "L2BEAT 💗",
//   "applicant": {
//       "address": {
//           "address": "0x1B686eE8E31c5959D9F5BBd8122a58682788eeaD",
//           "isContract": false,
//           "resolvedName": {
//               "name": "delegate.l2beat.eth",
//               "address": "0x1B686eE8E31c5959D9F5BBd8122a58682788eeaD"
//           }
//       },
//       "amountOwned": {
//           "amount": {
//               "amount": "0",
//               "currency": "OP",
//               "decimals": 18
//           },
//           "bpsOfTotal": 0,
//           "bpsOfQuorum": 0,
//           "bpsOfDelegatedSupply": 0
//       }
//   },
//   "applicant_type": "PROJECT",
//   "bio": "L2BEAT is a public goods company dedicated to providing on-chain transparency. ",
//   "certified_not_barred_from_participating": true,
//   "certified_not_designated_or_sanctioned_or_blocked": true,
//   "certified_not_sponsored_by_political_figure_or_government_entit": true,
//   "contribution_description": "Since RPGF2 we have focused on:\n \nEnd User Experience and Adoption\n- Added a “risk rosette” - quickly compare risk vectors of different L2s\n- Introduced “stages”, progress on the road to full decentralization\n- Separated L2 TVL into assets bridged canonically, externally and minted natively on L2\n- Continuous addition of new L2s, incl. all new OP Stack chains\n- Published a report on “Upgradeability of Ethereum L2s”\n\nCollective governance\n- Hosted Governance Breakfast at several conferences, fostering governance discussion\n- Hosted weekly Optimism Office Hours \n- Hosting whole-day governance workshops during L2DAYS at Devconnect Istanbul\n\nDeveloper ecosystem\n- Constant development of contract monitoring of L2 systems\n- Build Your Own Rollup\n- co-hosted L2Warsaw & L2DAYS Istanbul\n- Earl.js",
//   "contribution_links": [
//       {
//           "url": "https://l2beat.com/",
//           "type": "OTHER",
//           "description": "L2BEAT website"
//       },
//       {
//           "url": "https://github.com/l2beat/",
//           "type": "GITHUB_REPO",
//           "description": "Main Github repository"
//       },
//       {
//           "url": "https://github.com/l2beat/l2beat/pull/1268",
//           "type": "GITHUB_REPO",
//           "description": "Risk Rossette"
//       },
//       {
//           "url": "https://github.com/l2beat/l2beat/pull/1584",
//           "type": "GITHUB_REPO",
//           "description": "Stages"
//       },
//       {
//           "url": "https://github.com/l2beat/l2beat/pull/1938",
//           "type": "GITHUB_REPO",
//           "description": "TVL separation"
//       },
//       {
//           "url": "https://l2beat.com/multisig-report",
//           "type": "OTHER",
//           "description": "\"Upgradeability of Ethereum L2s\" report"
//       },
//       {
//           "url": "https://byor.l2beat.com/",
//           "type": "OTHER",
//           "description": "Build Your Own Rollup"
//       },
//       {
//           "url": "https://github.com/l2beat/earl",
//           "type": "GITHUB_REPO",
//           "description": "Earl JS"
//       },
//       {
//           "url": "https://l2beat.notion.site/Delegate-your-votes-to-L2BEAT-8ffc452bed9a431cb158d1e4e19839e3",
//           "type": "OTHER",
//           "description": "L2BEAT Governance page"
//       },
//       {
//           "url": "https://warsaw.l2beat.com/",
//           "type": "OTHER",
//           "description": "L2Warsaw conference"
//       },
//       {
//           "url": "https://l2days.xyz/",
//           "type": "OTHER",
//           "description": "L2DAYS Istanbul conference"
//       }
//   ],
//   "funding_sources": [
//       {
//           "type": "RETROPGF_2",
//           "amount": 256294.36,
//           "currency": "OP",
//           "description": ""
//       },
//       {
//           "type": "OTHER",
//           "amount": 500000,
//           "currency": "USD",
//           "description": "Ethereum Foundation 2023 grant (second tranche)"
//       },
//       {
//           "type": "GOVERNANCE_FUND",
//           "amount": 63667,
//           "currency": "OP",
//           "description": "Optimism governance rewards and compensation since March 2023"
//       },
//       {
//           "type": "OTHER",
//           "amount": 85000,
//           "currency": "USD",
//           "description": "Gitcoin since March 2023"
//       },
//       {
//           "type": "OTHER",
//           "amount": 52000,
//           "currency": "USD",
//           "description": "Sponsorship that covered L2 Warsaw conference costs"
//       },
//       {
//           "type": "OTHER",
//           "amount": 60000,
//           "currency": "USD",
//           "description": "Grant from Polygon Labs for the \"Uprgradability of Ethereum L2S\" report"
//       },
//       {
//           "type": "OTHER",
//           "amount": 5000,
//           "currency": "USD",
//           "description": "Direct donations"
//       },
//       {
//           "type": "OTHER",
//           "amount": 110000,
//           "currency": "USD",
//           "description": "Development of public goods software funded by third-parties"
//       }
//   ],
//   "impact_category": [
//       "COLLECTIVE_GOVERNANCE",
//       "DEVELOPER_ECOSYSTEM",
//       "END_USER_EXPERIENCE_AND_ADOPTION"
//   ],
//   "impact_description": "From the direct feedback we receive, both on Discord & Telegram as well as in person during conferences, we know that our work is helping shape the way Ethereum and L2 ecosystems evolve.\n- The risk assessment and stages frameworks serve as a north star for projects in terms of what they should prioritize in their roadmaps.\n- Our contract monitoring ensures that no changes to the security parameters of any L2 go unnoticed.\n- The introduction of TVL breakdown spurred discussion on how we should treat L2 assets depending on their origin.\n- Our work on L2 upgradeability is now the backbone of security council designs in various protocols.\n- Due to our active participation in governance, we’re now experimenting with different forms of involvement and outreach to the community.",
//   "impact_metrics": [
//       {
//           "url": "https://l2beat.com",
//           "number": "79",
//           "description": "Project researched"
//       },
//       {
//           "url": "https://l2beat.com",
//           "number": "7",
//           "description": "OP Stack projects researched to date"
//       },
//       {
//           "url": "https://discord.com/channels/885067338158837800/1074693294656856136/1074699641980977254",
//           "number": "248",
//           "description": "Days publicly monitoring L2 systems"
//       },
//       {
//           "url": "https://github.com/l2beat/l2beat/tree/master/packages/backend/discovery",
//           "number": "1131",
//           "description": "Number of monitored smart contracts"
//       },
//       {
//           "url": "https://l2beat.com/",
//           "number": "3",
//           "description": "Conferences organized"
//       },
//       {
//           "url": "https://l2beat.com/",
//           "number": "4",
//           "description": "Governance meetups organized"
//       },
//       {
//           "url": "https://calendar.google.com/calendar/embed?src=c_074582b1bd5a655c8cd2d6b3ab9bd44771ce7082c26f942d5339ee1d9e7c8c04%40group.calendar.google.com&ctz=Europe%2FWarsaw",
//           "number": "11",
//           "description": "Optimism Office Hours hosted"
//       }
//   ],
//   "lists": [
//       {
//           "id": "List|0x02116ab0eccd61f1d2b2e8d37fff78dea2c927c54343837e496a6cedeb224b2e",
//           "likes": [
//               "0xcf79C7EaEC5BDC1A9e32D099C5D6BdF67E4cF6e8"
//           ],
//           "author": {
//               "address": "0x5a5D9aB7b1bD978F80909503EBb828879daCa9C3",
//               "isContract": false,
//               "resolvedName": {
//                   "name": "cerv1.eth",
//                   "address": "0x5a5D9aB7b1bD978F80909503EBb828879daCa9C3"
//               }
//           },
//           "listName": "Developer Ecosystem Projects on Open Source Observer",
//           "categories": [
//               "DEVELOPER_ECOSYSTEM"
//           ],
//           "listDescription": "Developer Ecosystem Projects on Open Source Observer",
//           "impactEvaluationLink": "https://github.com/opensource-observer/insights/blob/main/notebooks/2023-11-07_RPGF3xOSO.ipynb",
//           "impactEvaluationDescription": "This list awards 50K OP tokens to any RPGF3 project in the 'Developer Ecosystem' category that is represented on https://opensource.observer. Only projects with unique, public GitHub repos included in their application have been indexed by OSO. It awards an extra 25K tokens to projects that included a contract address or NPM package url in their application, or that were in a prior RPGF round. Note: lists generated by the OSO team do not include OSO in them in order to comply with voting rules, so please consider adding our project to your ballot separately."
//       },
//       {
//           "id": "List|0x9fb7b59084243ab3bf31d526acd082fbe9bf6d53cb0fce5b07d6ea63d8957b6b",
//           "likes": [
//               "0xcf79C7EaEC5BDC1A9e32D099C5D6BdF67E4cF6e8"
//           ],
//           "author": {
//               "address": "0x5a5D9aB7b1bD978F80909503EBb828879daCa9C3",
//               "isContract": false,
//               "resolvedName": {
//                   "name": "cerv1.eth",
//                   "address": "0x5a5D9aB7b1bD978F80909503EBb828879daCa9C3"
//               }
//           },
//           "listName": "Bear Market Builders",
//           "categories": [
//               "OP_STACK"
//           ],
//           "listDescription": "Projects that have been building OSS continuously for more than two years.",
//           "impactEvaluationLink": "https://github.com/opensource-observer/insights/blob/main/notebooks/2023-11-13_RPGF3_BearMarketBuilders.ipynb",
//           "impactEvaluationDescription": "This list awards 50K OP tokens to any *active* RPGF3 project in any impact category that is represented on https://opensource.observer that started before Nov 2021. Only projects with unique, public GitHub repos included in their application have been indexed by OSO. It also awards a token bonus to projects based on the number of full-time active developers they have on GitHub in the last 6 months: 20K tokens for 1-2 devs, 30K for 3-5, 40K for 6-9, 50K for 10+. Note: lists generated by the OSO team do not include OSO in them in order to comply with voting rules, so please consider adding our project to your ballot separately. Always DYOR!"
//       },
//       {
//           "id": "List|0xe415e926feab9736a8a2572bdd69ded645d133199c06c75d82b11c419c5f50ba",
//           "likes": [],
//           "author": {
//               "address": "0x5a5D9aB7b1bD978F80909503EBb828879daCa9C3",
//               "isContract": false,
//               "resolvedName": {
//                   "name": "cerv1.eth",
//                   "address": "0x5a5D9aB7b1bD978F80909503EBb828879daCa9C3"
//               }
//           },
//           "listName": "End User Experience & Adoption Projects on Open Source Observer",
//           "categories": [
//               "END_USER_EXPERIENCE_AND_ADOPTION"
//           ],
//           "listDescription": "OSS projects with direct impact on user growth across the Superchain.",
//           "impactEvaluationLink": "https://github.com/opensource-observer/insights/blob/main/notebooks/2023-11-13_RPGF3_EndUserExperience.ipynb",
//           "impactEvaluationDescription": "This list awards 50K OP tokens to any *active* RPGF3 project in the 'End User Experience & Adoption' category that is represented on https://opensource.observer. Only projects with unique, public GitHub repos included in their application have been indexed by OSO. It also awards a token bonus to projects based on the number of monthly active users they have on OP Mainnet: 10K tokens for 10-100 MAUs, 20K for 100-1000, 30K for 1000-10,000, and so on. If a contract address was not included as a link in a project's RPGF3 application, then it most likely won't be included here. Finally, projects targeting end users on Base, Farcaster, and Zora networks also receive a 10K OP bonus. Note: lists generated by the OSO team do not include OSO in them in order to comply with voting rules, so please consider adding our project to your ballot separately. Always DYOR!"
//       },
//       {
//           "id": "List|0x8848b2be08d0503becabd7f0b1af589c252a061407301bc9549971bad15a743b",
//           "likes": [],
//           "author": {
//               "address": "0x5a5D9aB7b1bD978F80909503EBb828879daCa9C3",
//               "isContract": false,
//               "resolvedName": {
//                   "name": "cerv1.eth",
//                   "address": "0x5a5D9aB7b1bD978F80909503EBb828879daCa9C3"
//               }
//           },
//           "listName": "Directed Graph of OSS Contributors",
//           "categories": [
//               "DEVELOPER_ECOSYSTEM"
//           ],
//           "listDescription": "This list applies the page rank algorithm to the graph of OSS contributors on Open Source Observer.",
//           "impactEvaluationLink": "https://github.com/opensource-observer/insights/blob/main/notebooks/2023-11-14_RPGF3_ContributorPageRank.ipynb",
//           "impactEvaluationDescription": "This is an experimental list format that uses the page rank algorithm to allocate 20M OP tokens to OSS projects that are represented on https://opensource.observer. First, it identifies users with at least 10 contributions (commits, PRs, issues) to a given OSS project. Then, it creates a directed graph of contributors and runs page rank over the graph. Finally, it allocates tokens pro rata to the top 120 projects based on page rank, rounded to the nearest 10K OP. The algorithm considers all contributions to all non-forked repos listed by RPGF3 projects (as well as contributions to core Optimism repos). The algorithm excludes Protocol Guild to prevent double-counting of contributors to the Ethereum org space; if you use this list for voting, you should consider adding Protocol Guild back to your ballot.Note: lists generated by the OSO team do not include OSO in them in order to comply with voting rules, so please consider adding our project to your ballot separately. Always DYOR!"
//       }
//   ],
//   "understood_fund_claim_period": true,
//   "understood_kyc_requirements": true,
//   "website_url": "https://l2beat.com/",
//   "profile": {
//       "id": "OptimistProfile|0xa699bfc98744dd0d49347bc458e68d933685b26d69c24f85b45afc2c0148a7c7",
//       "bio": "L2BEAT is a public goods company dedicated to providing on-chain transparency. We serve as an impartial and independent steward for Ethereum community.",
//       "uid": "0xa699bfc98744dd0d49347bc458e68d933685b26d69c24f85b45afc2c0148a7c7",
//       "name": "L2BEAT 💗",
//       "websiteUrl": "https://l2beat.com/",
//       "bannerImageUrl": "https://content.optimism.io/profile/v0/banner-image/10/0x1B686eE8E31c5959D9F5BBd8122a58682788eeaD.png",
//       "profileImageUrl": "https://content.optimism.io/profile/v0/profile-image/10/0x1B686eE8E31c5959D9F5BBd8122a58682788eeaD.png"
//   },
//   "payout_address": {
//       "address": "0xeA78912803bE5E356EaC2b8e127D4BA87230A48e"
//   },
//   "last_updated": "2023-11-16T21:05:22.314Z"
// }
