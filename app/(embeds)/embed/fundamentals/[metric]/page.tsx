"use client";
import { use, useEffect, useLayoutEffect, useMemo, useState } from "react";
import Error from "next/error";
import { MetricsResponse } from "@/types/api/MetricsResponse";
import { useLocalStorage, useSessionStorage } from "usehooks-ts";
import useSWR from "swr";
import { MetricsURLs } from "@/lib/urls";
import { AllChains, AllChainsByKeys } from "@/lib/chains";
import { navigationItems } from "@/lib/navigation";
import { format } from "date-fns";
import ComparisonChart from "@/components/layout/ComparisonChart";
import MetricsTable from "@/components/layout/MetricsTable";
import { intersection } from "lodash";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const Chain = ({ params }: { params: any }) => {
  const searchParams = useSearchParams();
  const queryTheme = searchParams ? searchParams.get("theme") : null;
  const { theme, setTheme } = useTheme();
  useLayoutEffect(() => {
    setTimeout(() => {
      if (queryTheme == "light") {
        setTheme("light");
      } else {
        setTheme("dark");
      }
    }, 1000);
  }, []);

  const [showUsd, setShowUsd] = useState(true);
  const [errorCode, setErrorCode] = useState<number | null>(null);

  const {
    data: metricData,
    error: metricError,
    isLoading: metricLoading,
    isValidating: metricValidating,
  } = useSWR<MetricsResponse>(MetricsURLs[params.metric]);

  const chains = useMemo(() => {
    if (!metricData) return AllChains;

    return AllChains.filter(
      (chain) =>
        Object.keys(metricData.data.chains).includes(chain.key) &&
        chain.key != "ethereum" &&
        chain.ecosystem.includes("all-chains"),
    );
  }, [metricData]);

  const pageData = navigationItems[1]?.options.find(
    (item) => item.urlKey === params.metric,
  )?.page ?? {
    title: "",
    description: "",
    icon: "",
  };

  const selectedChains = AllChains.filter(
    (chain) =>
      (chain.ecosystem.includes("all-chains") &&
        ["arbitrum", "optimism", "base", "linea", "zksync_era"].includes(
          chain.key,
        )) ||
      chain.key === "ethereum",
  ).map((chain) => chain.key);

  const [selectedScale, setSelectedScale] = useState(
    params.metric != "txcosts" ? "log" : "absolute",
  );

  const [selectedTimespan, setSelectedTimespan] = useState("365d");

  const [selectedTimeInterval, setSelectedTimeInterval] = useState("daily");

  const [showEthereumMainnet, setShowEthereumMainnet] = useState(false);

  const timeIntervalKey = useMemo(() => {
    if (!metricData) return null;

    return metricData.data.avg === true &&
      ["365d", "max"].includes(selectedTimespan) &&
      selectedTimeInterval === "daily"
      ? "daily_7d_rolling"
      : selectedTimeInterval;
  }, [metricData, selectedTimeInterval, selectedTimespan]);

  if (errorCode) {
    return <Error statusCode={errorCode} />;
  }

  return (
    // <Link href={`https://www.growthepie.xyz/fundamentals/${params.metric}`} referrerPolicy="origin" target="_blank" rel="noopener noreferrer" aria-label="growthepie.xyz">
    <>
      {metricData && (
        <ComparisonChart
          data={Object.keys(metricData.data.chains)
            .filter((chain) => selectedChains.includes(chain))
            .map((chain) => {
              return {
                name: chain,
                // type: 'spline',
                types: metricData.data.chains[chain][timeIntervalKey].types,
                data: metricData.data.chains[chain][timeIntervalKey].data,
              };
            })}
          metric_id={metricData.data.metric_id}
          timeIntervals={intersection(
            Object.keys(metricData.data.chains.arbitrum),
            ["daily", "weekly", "monthly"],
          )}
          // onTimeIntervalChange={(timeInterval) =>
          //   setSelectedTimeInterval(timeInterval)
          // }
          selectedTimeInterval={selectedTimeInterval}
          setSelectedTimeInterval={setSelectedTimeInterval}
          showTimeIntervals={true}
          sources={metricData.data.source}
          avg={metricData.data.avg}
          showEthereumMainnet={showEthereumMainnet}
          setShowEthereumMainnet={setShowEthereumMainnet}
          selectedTimespan={selectedTimespan}
          setSelectedTimespan={setSelectedTimespan}
          selectedScale={selectedScale}
          setSelectedScale={setSelectedScale}
          is_embed={true}
        >
          <MetricsTable
            data={metricData.data.chains}
            selectedChains={selectedChains}
            setSelectedChains={() => {}}
            chains={chains}
            metric_id={metricData.data.metric_id}
            showEthereumMainnet={showEthereumMainnet}
            setShowEthereumMainnet={setShowEthereumMainnet}
          />
        </ComparisonChart>
      )}
      {/* </Link > */}
    </>
  );
};

export default Chain;