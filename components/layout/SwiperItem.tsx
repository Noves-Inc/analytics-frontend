import React from "react";
import { MetricsURLs } from "@/lib/urls";

import "@splidejs/splide/css";
import { MasterURL } from "@/lib/urls";
import useSWR from "swr";
import { MasterResponse } from "@/types/api/MasterResponse";
import { MetricsResponse } from "@/types/api/MetricsResponse";
import LandingChartItem from "../charts/LandingChartItem";

export default function SwiperItem({
  metric_id,
  landing,
}: {
  metric_id: string;
  landing: any;
}) {
  const { data: master, error: masterError } =
    useSWR<MasterResponse>(MasterURL);
  const {
    data: metricData,
    error: metricError,
    isLoading: metricLoading,
    isValidating: metricValidating,
  } = useSWR<MetricsResponse>(MetricsURLs[metric_id]);
  console.log(metricData, metric_id, MetricsURLs[metric_id]);

  return (
    <>
      {/*       {master && metricData && (
        <LandingChartItem
          data={Object.keys(metricData.data.chains).map((chain) => {
            return {
              name: chain,
              types: metricData.data.chains[chain]["monthly"].types,
              data: metricData.data.chains[chain]["monthly"].data,
            };
          })}
          metric_id={metricData.data.metric_id}
          selectedTimeInterval={"max"}
          showTimeIntervals={true}
          sources={metricData.data.source}
          avg={metricData.data.avg}
          monthly_agg={metricData.data.monthly_agg}
          showEthereumMainnet={false}
          selectedTimespan={"max"}
          selectedScale={"absolute"}
        />
      )} */}
    </>
  );
}
