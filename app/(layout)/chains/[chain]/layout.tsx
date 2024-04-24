import { Metadata } from "next";
import { MasterURL } from "@/lib/urls";
import { AllChainsByUrlKey } from "@/lib/chains";
import { MasterResponse } from "@/types/api/MasterResponse";
import { notFound } from "next/navigation";
import { track } from "@vercel/analytics/server";

type Props = {
  params: { chain: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!params.chain || !Object.keys(AllChainsByUrlKey).includes(params.chain)) {
    track("404 Error", {
      location: "404 Error",
      page: "/chains/" + params.chain,
    });
    return notFound();
  }

  const key = AllChainsByUrlKey[params.chain].key;
  const replaceKey = key.replace(/_/g, "-");

  // fetch data from API
  const res: MasterResponse = await fetch(MasterURL, {
    cache: "no-store",
  }).then((r) => r.json());

  if (res && key && res.chains[key]) {
    return {
      title: res.chains[key].name,
      description: res.chains[key].symbol,
      openGraph: {
        images: [
          {
            url: `api.growthepie.xyz/v1/og_images/chains/${replaceKey}.png`,
            width: 1200,
            height: 627,
            alt: "growthepie.xyz",
          },
        ],
      },
    };
  }

  return {
    title: "Chain not found",
    description: "Chain not found",
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
