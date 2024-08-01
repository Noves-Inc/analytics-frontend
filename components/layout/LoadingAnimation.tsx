"use client";
import {
  useEffect,
  useState,
  useMemo,
  useCallback,
  ReactNode,
  ReactSVGElement,
} from "react";
import { useSpring, animated } from "@react-spring/web";

export default function LoadingAnimation() {
  /*
  <svg
      width="161"
      height="175"
      viewBox="0 0 161 175"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
    <path d="M51.5588 54.6538C51.2319 50.0931 52.474 45.9055 55.1389 41.8447C56.9232 39.1452 59.4535 36.2304 62.2452 33.0195C69.4477 24.7249 78.3691 14.4576 80.5533 0.852539C85.3024 11.2813 82.9989 21.4217 77.7423 30.7468C75.3773 34.9383 72.7586 37.9493 70.2591 40.8218C67.3173 44.202 64.5448 47.3898 62.5529 52.0774C61.4569 54.6269 60.834 57.0687 60.5417 59.4567L51.5588 54.6538Z" fill="#CDD8D3" />
    <path d="M66.9719 62.9051C68.0679 58.8828 69.9637 55.1219 72.4824 51.4726C74.5666 48.4271 76.5201 46.1698 78.2736 44.1433C84.1725 37.3177 87.8333 33.08 86.7604 10.2036C87.4488 11.6726 88.1294 13.0877 88.7908 14.4528L88.7947 14.4605C94.5474 26.4044 98.5851 34.7797 91.8018 46.2813C88.4486 51.9649 86.0029 54.7912 83.8418 57.2908C81.4076 60.1018 79.3311 62.5052 76.7201 68.0964L66.9719 62.9051Z" fill="#CDD8D3" />
    <path d="M92.2324 59.3017C89.5868 62.4357 85.2684 66.7579 85.0723 67.0425L109.51 53.3797C108.998 48.8267 105.641 43.4624 101.515 35.8369C102.35 45.8888 98.4274 51.9608 92.2324 59.3017Z" fill="#CDD8D3"/>
    <path d="M109.33 57.9219C108.672 60.8367 105.073 66.9009 102.427 70.0503C94.0671 79.9946 89.7141 84.2361 82.5616 99.1986C82.1578 97.5797 81.7348 96.0531 81.331 94.5956C79.3353 87.397 78.1086 81.402 80.5004 76.2338L109.33 57.9219Z" fill="#CDD8D3" />
    <path d="M77.0475 91.6334C75.0018 85.6461 73.5328 80.6394 74.6018 74.306L66.0573 68.7378C65.5843 78.0552 69.5643 88.9339 80.5546 102.939C79.9701 99.4704 78.2165 95.0558 77.0475 91.6334Z" fill="#CDD8D3" />
    <path d="M60.3617 65.0263C60.5079 68.0565 62.3806 76.0665 64.0572 80.3042C59.2735 74.2015 54.0437 64.8379 52.5479 59.9312L60.3617 65.0263Z" fill="#CDD8D3" />
    <path d="M161 110.566C161 96.7029 135.22 85.0436 100.381 81.7788C97.0584 85.5089 93.7359 90.1387 90.5596 96.9644L85.7759 106.051C84.8645 107.728 83.1841 108.827 81.3191 108.974C79.4233 109.12 77.5967 108.289 76.4662 106.77L73.3975 102.648C67.0064 94.4879 62.3304 88.0238 58.6426 81.9749C24.8299 85.4935 0 96.9682 0 110.566C0 126.959 36.0777 140.268 80.5192 140.268C82.665 140.268 84.7953 140.237 86.9026 140.175L93.4245 121.713L93.4783 121.583C94.9165 117.987 98.3773 115.634 102.227 115.58H102.254L159.831 115.734C160.423 114.284 161 112.077 161 110.566Z" fill="#CDD8D3" />
    <path d="M104.602 140.668H149.713L147.74 145.671H102.868L92.8777 174.169V143.906L99.8648 124.137C100.261 123.137 101.23 122.471 102.318 122.456L157 122.471L154.977 127.401H109.328L107.929 131.562H153.416L151.255 136.507H106.183L104.602 140.668Z" fill="#CDD8D3" />
    <path d="M2.76953 123.669C7.96469 138.358 20.6776 155.613 23.381 158.135C32.7177 166.93 62.8004 174.171 86.492 174.171V149.41C45.4229 149.41 13.3598 136.109 2.76953 123.669Z" fill="#CDD8D3" />
  </svg>
  */

  const PieSVG = (
    <svg
      width="161"
      height="175"
      viewBox="0 0 161 175"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/*       <path
        d="M51.5588 54.6538C51.2319 50.0931 52.474 45.9055 55.1389 41.8447C56.9232 39.1452 59.4535 36.2304 62.2452 33.0195C69.4477 24.7249 78.3691 14.4576 80.5533 0.852539C85.3024 11.2813 82.9989 21.4217 77.7423 30.7468C75.3773 34.9383 72.7586 37.9493 70.2591 40.8218C67.3173 44.202 64.5448 47.3898 62.5529 52.0774C61.4569 54.6269 60.834 57.0687 60.5417 59.4567L51.5588 54.6538Z"
        fill="#CDD8D3"
      />
      <path
        d="M66.9719 62.9051C68.0679 58.8828 69.9637 55.1219 72.4824 51.4726C74.5666 48.4271 76.5201 46.1698 78.2736 44.1433C84.1725 37.3177 87.8333 33.08 86.7604 10.2036C87.4488 11.6726 88.1294 13.0877 88.7908 14.4528L88.7947 14.4605C94.5474 26.4044 98.5851 34.7797 91.8018 46.2813C88.4486 51.9649 86.0029 54.7912 83.8418 57.2908C81.4076 60.1018 79.3311 62.5052 76.7201 68.0964L66.9719 62.9051Z"
        fill="#CDD8D3"
      />
      <path
        d="M92.2324 59.3017C89.5868 62.4357 85.2684 66.7579 85.0723 67.0425L109.51 53.3797C108.998 48.8267 105.641 43.4624 101.515 35.8369C102.35 45.8888 98.4274 51.9608 92.2324 59.3017Z"
        fill="#CDD8D3"
      />
      <path
        d="M109.33 57.9219C108.672 60.8367 105.073 66.9009 102.427 70.0503C94.0671 79.9946 89.7141 84.2361 82.5616 99.1986C82.1578 97.5797 81.7348 96.0531 81.331 94.5956C79.3353 87.397 78.1086 81.402 80.5004 76.2338L109.33 57.9219Z"
        fill="#CDD8D3"
      />
      <path
        d="M77.0475 91.6334C75.0018 85.6461 73.5328 80.6394 74.6018 74.306L66.0573 68.7378C65.5843 78.0552 69.5643 88.9339 80.5546 102.939C79.9701 99.4704 78.2165 95.0558 77.0475 91.6334Z"
        fill="#CDD8D3"
      />
      <path
        d="M60.3617 65.0263C60.5079 68.0565 62.3806 76.0665 64.0572 80.3042C59.2735 74.2015 54.0437 64.8379 52.5479 59.9312L60.3617 65.0263Z"
        fill="#CDD8D3"
      />
      <path
        d="M161 110.566C161 96.7029 135.22 85.0436 100.381 81.7788C97.0584 85.5089 93.7359 90.1387 90.5596 96.9644L85.7759 106.051C84.8645 107.728 83.1841 108.827 81.3191 108.974C79.4233 109.12 77.5967 108.289 76.4662 106.77L73.3975 102.648C67.0064 94.4879 62.3304 88.0238 58.6426 81.9749C24.8299 85.4935 0 96.9682 0 110.566C0 126.959 36.0777 140.268 80.5192 140.268C82.665 140.268 84.7953 140.237 86.9026 140.175L93.4245 121.713L93.4783 121.583C94.9165 117.987 98.3773 115.634 102.227 115.58H102.254L159.831 115.734C160.423 114.284 161 112.077 161 110.566Z"
        fill="#CDD8D3"
      />
      <path
        d="M104.602 140.668H149.713L147.74 145.671H102.868L92.8777 174.169V143.906L99.8648 124.137C100.261 123.137 101.23 122.471 102.318 122.456L157 122.471L154.977 127.401H109.328L107.929 131.562H153.416L151.255 136.507H106.183L104.602 140.668Z"
        fill="#CDD8D3"
      />
      <path
        d="M2.76953 123.669C7.96469 138.358 20.6776 155.613 23.381 158.135C32.7177 166.93 62.8004 174.171 86.492 174.171V149.41C45.4229 149.41 13.3598 136.109 2.76953 123.669Z"
        fill="#CDD8D3"
      /> */}
      <path
        d="M0 73.72v23.84h37.41V82.35C25.79 76.72 12.91 73.72 0 73.72Z"
        fill="#CDD8D3"
      />
      {/*       <path d="M181.72.24h20.12l33.49 46.26c5.41 7.36 11.56 17.87 11.56 17.87V.24h21.03v97.32h-20.28L215.2 53.1c-6.46-8.71-12.47-19.07-12.47-19.07v63.53H181.7V.24ZM285.95 60.01c0-21.78 17.72-39.05 40.1-39.05s40.25 17.27 40.25 39.05-17.72 39.05-40.25 39.05-40.1-17.27-40.1-39.05Zm59.78 0c0-11.71-8.41-20.43-19.68-20.43s-19.67 8.71-19.67 20.43 8.41 20.43 19.67 20.43 19.68-8.56 19.68-20.43ZM373.51 22.47h20.12l13.97 38.6c2.85 7.81 5.26 15.62 5.56 16.67.15-1.05 2.7-9.16 5.41-16.52l13.97-38.75h19.97l-29.59 75.24H403.1l-29.59-75.24ZM459.72 60.01c0-21.63 16.82-39.05 38.9-39.05 20.43 0 36.5 17.42 36.5 38.75 0 3.6-.45 7.21-.45 7.21h-54.52c2.4 10.36 10.96 15.32 20.88 15.32 7.21 0 14.72-2.1 20.28-5.86l7.51 14.42c-8.41 5.56-18.17 8.26-27.94 8.26-21.93 0-41.15-14.27-41.15-39.05Zm56.47-6.46c-1.5-9.46-9.01-15.77-18.17-15.77s-16.22 6.31-18.17 15.77h36.35ZM547.43 88.85l7.21-15.47c5.11 3.91 12.17 7.96 23.43 7.96 4.65 0 12.31-1.8 12.31-6.31s-6.46-5.56-12.92-7.36c-14.87-3.91-27.03-8.86-27.03-23.28 0-15.32 15.02-23.43 29.14-23.43 12.31 0 20.12 3 27.94 7.51l-6.76 15.02c-7.36-3.6-14.27-5.26-20.88-5.26-4.65 0-9.01 2.1-9.01 5.26 0 4.21 6.31 5.56 13.22 7.06 12.77 3 26.73 8.56 26.73 23.88 0 18.47-18.77 24.63-32.74 24.63-16.07 0-26.43-6.31-30.64-10.21Z" /> */}
      <path
        d="M134.15 73.66v23.9h-14.66c-15.7 0-31.18-3.74-45.15-10.92l-29.19-15A98.9 98.9 0 0 0 0 60.72V36.83h5.78c15.7 0 31.17 3.74 45.13 10.91l29.21 15a98.808 98.808 0 0 0 45.13 10.91h8.89Z"
        fill="#CDD8D3"
      />

      <path
        d="M134.15 36.83v23.89h-5.8c-15.7 0-31.17-3.74-45.14-10.92l-29.2-15A98.828 98.828 0 0 0 8.87 23.88H0V0h14.65c15.7 0 31.17 3.74 45.13 10.91L89 25.92a98.777 98.777 0 0 0 45.13 10.91h.01Z"
        fill="#CDD8D3"
      />
      <path
        d="M134.15 23.82V0H96.74v15.2c11.62 5.62 24.49 8.62 37.4 8.62h.01Z"
        fill="#CDD8D3"
      />
    </svg>
  );

  const fillColor = "#CDD8D3";

  const [pathsProps, setPathsProps] = useState<
    {
      d: string;
      fill: string;
    }[]
  >(
    PieSVG.props.children
      .map((child: ReactSVGElement) => {
        return child.props;
      })
      .reverse(),
  );

  // useEffect(() => {
  //   const definitions = PieSVG.props.children.map((child: ReactSVGElement) => {
  //     return child.props;
  //   });

  //   setPathsProps(definitions);
  // }, [PieSVG.props.children]);

  return (
    <>
      <style>
        {`
      .animate-smoke {
        fill-opacity: 0;
        animation-timing-function: ease-in-out;
        animation-fill-mode: forwards;
        animation-name: FadeInOut;
        animation-duration: 1.5s;
        animation-iteration-count: infinite;
      }
      
      .animate-smoke:nth-child(1) {
        animation-delay: 0.700s;
      }
      .animate-smoke:nth-child(2) {
        animation-delay: 0.500s;
      }
      .animate-smoke:nth-child(3) {
        animation-delay: 0.300s;
      }
      
      .animate-smoke:nth-child(4) {
        animation-delay: 0.100s;
      }


      @keyframes FadeInOut {
        0% {
          fill-opacity: 0;
        }
        80% {
          fill-opacity: 1;
        }
        100% {
          fill-opacity: 0;
        }
      }

      @keyframes FadeIn {
        0% {
          fill-opacity: 0;
        }
        
        100% {
          fill-opacity: 1;
        }
      }
      `}
      </style>
      <svg
        width="161"
        height="175"
        viewBox="0 0 161 175"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {pathsProps.map((pathProps, i) => {
          return (
            <path
              key={i}
              d={pathProps.d}
              fill={fillColor}
              className="animate-smoke"
            />
          );
        })}
      </svg>
    </>
  );
}
