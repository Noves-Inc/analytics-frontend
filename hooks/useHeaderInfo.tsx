import { useEffect, useState } from "react";

export const useHeaderInfo = () => {
  const [chainInfo, setChainInfo] = useState<{
    name: string;
    imagePath: string;
    novesImagePath: string;
  }>({
    name: "Noves",
    imagePath: "",
    novesImagePath: "/icons/noves-logo-full.svg",
  });

  useEffect(() => {
    const chain = process.env.NEXT_PUBLIC_CHAIN;

    if (chain) {
      const name = chain;
      const imagePath = `/icons/chain-logo-${chain}.svg`;

      setChainInfo((prev) => ({
        ...prev,
        name: name ?? prev.name,
        imagePath: imagePath ?? prev.imagePath,
      }));
    }
  }, []);

  return chainInfo;
};
