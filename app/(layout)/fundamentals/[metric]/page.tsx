"use client";
import { useMemo, useState, useEffect } from "react";
import Error from "next/error";
import { MetricsResponse } from "@/types/api/MetricsResponse";
import ComparisonChart from "@/components/layout/ComparisonChart";
import { useSessionStorage } from "usehooks-ts";
import useSWR from "swr";
import MetricsTable from "@/components/layout/MetricsTable";
import { MetricsURLs } from "@/lib/urls";
import {
  AllChains,
  Get_DefaultChainSelectionKeys,
  Get_SupportedChainKeys,
} from "@/lib/chains";
import { intersection } from "lodash";
import ShowLoading from "@/components/layout/ShowLoading";
import { MasterURL } from "@/lib/urls";
import { MasterResponse } from "@/types/api/MasterResponse";

const Fundamentals = ({ params }: { params: any }) => {
  const {
    data: master,
    error: masterError,
    isLoading: masterLoading,
    isValidating: masterValidating,
  } = useSWR<MasterResponse>(MasterURL);

  const {
    data: metricData,
    error: metricError,
    isLoading: metricLoading,
    isValidating: metricValidating,
  } = useSWR<MetricsResponse>(MetricsURLs[params.metric]);

  return (
    <>
      <ShowLoading
        dataLoading={[masterLoading, metricLoading]}
        dataValidating={[masterValidating, metricValidating]}
      />
      {master && metricData ? (
        <FundamentalsContent
          params={{
            ...params,
            master,
            metricData,
            errorCode: metricError?.statusCode || masterError?.statusCode,
          }}
        />
      ) : (
        <div className="w-full min-h-[1024px] md:min-h-[1081px] lg:min-h-[637px] xl:min-h-[736px]" />
      )}
    </>
  );
};

const FundamentalsContent = ({ params }: { params: any }) => {
  const CHAIN = process.env.NEXT_PUBLIC_CHAIN;
  const master = params.master;
  const metricData = params.metricData;
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const comparisonChains =
    process.env.NEXT_PUBLIC_COMPARISON_CHAINS?.split(", ");

  const chainKeys = useMemo(() => {
    if (!metricData)
      return AllChains.filter((chain) =>
        Get_SupportedChainKeys(master).includes(chain.key),
      ).map((chain) => chain.key);

    return AllChains.filter(
      (chain) =>
        Object.keys(metricData.data.chains).includes(chain.key) &&
        Get_SupportedChainKeys(master).includes(chain.key),
    ).map((chain) => chain.key);
  }, [master, metricData]);

  const [selectedChains, setSelectedChains] = useSessionStorage(
    "fundamentalsChains",
    [...Get_DefaultChainSelectionKeys(master), CHAIN ? CHAIN : "ethereum"],
  );

  const [selectedScale, setSelectedScale] = useSessionStorage(
    "fundamentalsScale",
    "absolute",
  );

  const [selectedTimespan, setSelectedTimespan] = useSessionStorage(
    "fundamentalsTimespan",
    "365d",
  );

  const [selectedTimeInterval, setSelectedTimeInterval] = useSessionStorage(
    "fundamentalsTimeInterval",
    "daily",
  );

  const [showEthereumMainnet, setShowEthereumMainnet] = useSessionStorage(
    "fundamentalsShowEthereumMainnet",
    false,
  );

  useEffect(() => {
    let currentURL = window.location.href;
    if (currentURL.includes("?is_og=true")) {
      setSelectedScale("stacked");
    }
  }, []);

  const timeIntervalKey = useMemo(() => {
    if (
      metricData?.data.avg === true &&
      ["365d", "max"].includes(selectedTimespan)
    ) {
      return "daily_7d_rolling";
    }

    if (selectedTimeInterval === "monthly") {
      return "monthly";
    }

    return "daily";
  }, [metricData, selectedTimeInterval, selectedTimespan]);

  if (errorCode) {
    return <Error statusCode={errorCode} />;
  }

  return (
    <>
      <div
        className={`flex ${
          comparisonChains?.length
            ? "flex-col-reverse"
            : "flex-col w-full px-12 py-2"
        } space-x-0 xl:space-x-2`}
      >
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
          selectedTimeInterval={selectedTimeInterval}
          setSelectedTimeInterval={setSelectedTimeInterval}
          showTimeIntervals={true}
          sources={metricData.data.source}
          avg={metricData.data.avg}
          monthly_agg={metricData.data.monthly_agg}
          showEthereumMainnet={showEthereumMainnet}
          setShowEthereumMainnet={setShowEthereumMainnet}
          selectedTimespan={selectedTimespan}
          setSelectedTimespan={setSelectedTimespan}
          selectedScale={
            params.metric === "transaction-costs" ? "absolute" : selectedScale
          }
          setSelectedScale={setSelectedScale}
          is_embed={!comparisonChains || !comparisonChains.length}
        >
          <MetricsTable
            data={metricData.data.chains}
            master={master}
            selectedChains={selectedChains}
            setSelectedChains={setSelectedChains}
            chainKeys={chainKeys}
            metric_id={metricData.data.metric_id}
            showEthereumMainnet={showEthereumMainnet}
            setShowEthereumMainnet={setShowEthereumMainnet}
            timeIntervalKey={timeIntervalKey}
          />
        </ComparisonChart>
      </div>
    </>
  );
};

export default Fundamentals;
