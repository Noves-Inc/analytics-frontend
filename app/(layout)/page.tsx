"use client";
import Container from "@/components/layout/Container";
import Heading from "@/components/layout/Heading";
import Icon from "@/components/layout/ServerIcon";
import Subheading from "@/components/layout/Subheading";
import { Metadata } from "next";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <>
      <Container className="flex flex-col flex-1 grow w-full mt-[30px] md:mt-[30px] mb-[15px] md:mb-[15px] gap-y-[15px] justify-center">
        <div className="flex items-center gap-x-[8px] py-[10px] md:py-0">
          <Icon
            icon="gtp:fundamentals"
            className="w-[30px] h-[30px] md:w-9 md:h-9 text-brandColor"
          />
          <Heading
            id="layer-2-traction-title"
            className="text-[20px] md:text-[30px] leading-[1.2] font-semibold"
          >
            Key Metrics
          </Heading>
        </div>
        <Subheading className="text-xs sm:text-sm md:text-[20px] font-semibold leading-[1.2]">
          Your Gateway to Curated Analytics and Knowledge
        </Subheading>
      </Container>
      <Container className="flex flex-wrap flex-1 w-full gap-y-8 justify-evenly mt-24 mb-36">
        <div
          className="flex flex-col p-4 items-center rounded-sm dark:bg-[#1F2726] bg-forest-50 cursor-pointer border border-transparent hover:border-brandColor"
          onClick={() => {
            router.push("/fundamentals/daily-active-addresses");
          }}
        >
          <p className="text-xl">Active Addresses</p>
          <p className="text-sm">
            The number of distinct addresses that interacted with a chain.
          </p>
        </div>
        <div
          className="flex flex-col p-4 items-center rounded-sm dark:bg-[#1F2726] bg-forest-50 cursor-pointer border border-transparent hover:border-brandColor"
          onClick={() => {
            router.push("/fundamentals/transaction-count");
          }}
        >
          <p className="text-xl">Transaction Count</p>
          <p className="text-sm">The number of daily transactions.</p>
        </div>
        <div
          className="flex flex-col p-4 items-center rounded-sm dark:bg-[#1F2726] bg-forest-50 cursor-pointer border border-transparent hover:border-brandColor"
          onClick={() => {
            router.push("/fundamentals/throughput");
          }}
        >
          <p className="text-xl">Throughput</p>
          <p className="text-sm">Measured in gas per second.</p>
        </div>
        <div
          className="flex flex-col p-4 items-center rounded-sm dark:bg-[#1F2726] bg-forest-50 cursor-pointer border border-transparent hover:border-brandColor"
          onClick={() => {
            router.push("/fundamentals/fees-paid-by-users");
          }}
        >
          <p className="text-xl">Fees paid by users</p>
          <p className="text-sm">
            The sum of fees that were paid by users of the chain in gas fees.
          </p>
        </div>
        <div
          className="flex flex-col p-4 items-center rounded-sm dark:bg-[#1F2726] bg-forest-50 cursor-pointer border border-transparent hover:border-brandColor"
          onClick={() => {
            router.push("/fundamentals/transaction-costs");
          }}
        >
          <p className="text-xl">Transaction Costs</p>
          <p className="text-sm">
            The median amount that is paid per transaction.
          </p>
        </div>
      </Container>
    </>
  );
}
