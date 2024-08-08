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
  const PieSVG = (
    <svg
      width="161"
      height="175"
      viewBox="0 0 161 175"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 73.72v23.84h37.41V82.35C25.79 76.72 12.91 73.72 0 73.72Z"
        fill="#CDD8D3"
      />
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
