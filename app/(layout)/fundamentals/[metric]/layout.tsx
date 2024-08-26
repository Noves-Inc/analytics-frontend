import { Metadata } from "next";
import { navigationItems } from "@/lib/navigation";
import { MetricsURLs } from "@/lib/urls";
import { CompleteDataFeed, WithContext } from "schema-dts";
import Container from "@/components/layout/Container";
import Heading from "@/components/layout/Heading";
import Subheading from "@/components/layout/Subheading";
import QuestionAnswer from "@/components/layout/QuestionAnswer";
import { notFound } from "next/navigation";
import { track } from "@vercel/analytics/server";
import Icon from "@/components/layout/Icon";

type Props = {
  params: { metric: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (
    !params.metric ||
    navigationItems
      .find((item) => item.label === "Fundamentals")
      ?.options.find((item) => item.urlKey === params.metric) === undefined
  ) {
    track("404 Error", {
      location: "404 Error",
      page: "/fundamentals/" + params.metric,
    });
    return notFound();
  }

  const option = navigationItems
    .find((item) => item.label === "Fundamentals")
    ?.options.find((item) => item.urlKey === params.metric);

  if (option) {
    const currentDate = new Date();
    // Set the time to 2 am
    currentDate.setHours(2, 0, 0, 0);
    // Convert the date to a string in the format YYYYMMDD (e.g., 20240424)
    const dateString = currentDate.toISOString().slice(0, 10).replace(/-/g, "");
    return {
      title: option.page?.title,
      description: option.page?.why,
      openGraph: {
        images: [
          {
            url: `https://api.growthepie.xyz/v1/og_images/fundamentals/${params.metric}.png?date=${dateString}`,
            width: 1200,
            height: 627,
            alt: "growthepie.xyz",
          },
        ],
      },
    };
  }

  return {
    title: "Metric not found",
    description: "Metric not found",
  };
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { metric: string };
}) {
  const pageData = navigationItems[1]?.options.find(
    (item) => item.urlKey === params.metric,
  )?.page ?? {
    title: "",
    description: "",
    icon: "",
  };

  return (
    <>
      <Container
        className="flex flex-col w-full pt-[65px] md:pt-[30px]"
        isPageRoot
      >
        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-y-[10px] md:gap-x-[15px] pb-[15px]">
            <div className="flex items-center">
              <Icon
                icon="gtp:fundamentals"
                className="w-[32px] h-[32px] mr-2 text-brandColor"
              />
              <div className="flex flex-col md:flex-row items-center gap-x-[15px]">
                <Heading className="text-[36px] leading-[120%]" as="h1">
                  {pageData.title}
                </Heading>
              </div>
            </div>
          </div>
        </div>
        <Subheading
          className="text-[14px] pb-[15px]"
          iconContainerClassName="items-center mb-[15px] md:mb-[32px] relative"
        >
          {typeof pageData.description === "string" &&
          pageData.description.includes("L2Beat.com.") ? (
            <div>
              <p>
                {pageData.description.replace("L2Beat.com.", "")}

                <a
                  className="hover:underline"
                  target="_blank"
                  href="https://l2beat.com/scaling/tvl"
                >
                  L2Beat.com
                </a>
              </p>
            </div>
          ) : (
            pageData.description
          )}

          {pageData.tags && (
            <div className="flex items-center mt-[5px]">
              {pageData.tags.map((tag, i) => (
                <div key={i}>{tag}</div>
              ))}
            </div>
          )}
        </Subheading>
      </Container>
      {children}
      <Container className="flex flex-col space-y-[15px] mt-[30px]">
        <QuestionAnswer
          className="rounded-3xl bg-forest-50 dark:bg-forest-900 px-[63px] py-[23px] flex flex-col"
          question={`What does ${pageData.title} tell you?`}
          answer={pageData.why}
          note={
            pageData.note && (
              <div className="text-xs">
                <span className="font-semibold text-forest-200 dark:text-forest-400">
                  Note:{" "}
                </span>
                {pageData.note}
              </div>
            )
          }
          startOpen
        />
      </Container>
    </>
  );
}
