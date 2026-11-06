/*
 * Pomo asleep through a break, drawn from resting.svg. One SVG whose moving
 * parts are groups, animated by the `pomo-rest-*` classes in globals.css:
 * under the blanket the body breathes slowly, swelling up from where it
 * lies, and the two z's come and go in turn, small then big, drifting up as
 * they fade. The blanket and hands sit in front, still, and hide the body's
 * lower edge as it breathes. Ids carry a prefix unique to each Pomo (see
 * pomo-idle.tsx).
 */

import { useId } from "react";

// Same aspect as the idle frame (960×1160), the shadow at the same height.
// The blanket, the shadow and the big z reach past its sides.
const VIEWBOX = "166 44 753 910";

const BLANKET =
  "M141.5 747.5C172.5 687.5 225.5 700 225.5 700C225.5 700 221 730 224 750C227 770 248 796 248 796C248 796 287.5 797 327.5 821C367.5 845 377.5 858.5 416 858.5C454.5 858.5 470.09 841.59 513.5 840C562.88 838.19 582 878.5 652 853.5C722 828.5 757.5 834.5 757.5 834.5C776.5 845.35 799 845.5 794 877C789 908.5 757.5 918.5 675.5 925C593.5 931.5 516.5 919 401 925C285.5 931 177.5 897.5 155 863.5C132.5 829.5 110.5 807.5 141.5 747.5Z";
const LEAF_FRONT =
  "M551.97 565.01C498.32 589.64 424.08 556.34 424.08 556.34L469.8 505.98L542.98 489.14C542.98 489.14 605.61 540.37 551.97 565.01Z";
const LEAVES_BACK =
  "M299.58 625.32C320.46 632.56 397.86 611.88 437.3 557.77L499.29 523.92C633.55 502.91 649.91 470.64 641.31 457.14C615.96 410.88 504.07 459.79 504.07 459.79C504.07 459.79 511.72 371.82 470.04 376.8C428.35 381.78 399.76 466.22 399.76 466.22C351.79 446.9 276.87 460.24 275.73 496.53C274.6 532.82 316.53 544.61 337.63 545.96C303.86 566.83 278.69 618.08 299.58 625.32Z";

/** One z: three rounded strokes, top, diagonal and bottom. */
const Z_SMALL = [
  { x: 692.39, y: 380.34, width: 93.78, rotate: -15.28 },
  { x: 706.31, y: 456.33, width: 118.47, rotate: -60.28 },
  { x: 708.68, y: 439.99, width: 93.78, rotate: -15.28 },
];
const Z_BIG = [
  { x: 806.23, y: 293.6, width: 129.21, rotate: -15.28 },
  { x: 825.41, y: 398.3, width: 163.24, rotate: -60.28 },
  { x: 828.67, y: 375.79, width: 129.21, rotate: -15.28 },
];

function Z({
  strokes,
  height,
  className,
}: {
  strokes: typeof Z_SMALL;
  height: number;
  className: string;
}) {
  return (
    <g className={`pomo-rest-z ${className}`} fill="#A77DD6">
      {strokes.map((stroke) => (
        <rect
          key={stroke.y}
          x={stroke.x}
          y={stroke.y}
          width={stroke.width}
          height={height}
          rx={height / 2}
          transform={`rotate(${stroke.rotate} ${stroke.x} ${stroke.y})`}
        />
      ))}
    </g>
  );
}

export function PomoRest() {
  const ids = `pomo-rest-${useId().replace(/[^\w-]/g, "")}-`;
  const url = (name: string) => `url(#${ids}${name})`;
  return (
    <svg
      viewBox={VIEWBOX}
      fill="none"
      className="absolute inset-0 h-full w-full overflow-visible"
    >
      <defs>
        <linearGradient
          id={`${ids}body`}
          x1="438.77"
          y1="459.94"
          x2="570.51"
          y2="908.98"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FD553A" />
          <stop offset="1" stopColor="#FD753A" />
        </linearGradient>
        <linearGradient
          id={`${ids}leaf`}
          x1="410.57"
          y1="399.83"
          x2="488.95"
          y2="590.93"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#75B43B" />
          <stop offset="1" stopColor="#69CA5C" />
        </linearGradient>
        <clipPath id={`${ids}leaves`}>
          <path d={LEAF_FRONT} />
          <path d={LEAVES_BACK} />
        </clipPath>
        <clipPath id={`${ids}blanket`}>
          <path d={BLANKET} />
        </clipPath>
      </defs>

      {/* shadow, and the foot that pokes out behind */}
      <ellipse
        cx="540"
        cy="886.5"
        rx="419"
        ry="52.5"
        fill="#FD553A"
        fillOpacity="0.2"
      />
      <path
        d="M754.23 854.94C791.99 874.24 819.03 877.73 832.19 849.33C845.34 820.94 829.01 785.42 795.72 770C762.42 754.58 724.77 765.09 711.62 793.48C698.47 821.88 717.8 844.25 754.23 854.94Z"
        fill="#D2412A"
      />

      {/* body, leaf crown and face, breathing as one */}
      <g className="pomo-rest-breath">
        <path
          d="M794.9 632.87C836.29 773.94 770.5 869.5 587 900C438.77 909 273.9 938.93 232.51 797.86C191.13 656.79 289.7 518.06 445 472.5C600.3 426.94 753.52 491.8 794.9 632.87Z"
          fill={url("body")}
        />
        <path d={LEAF_FRONT} fill={url("leaf")} />
        <path d={LEAVES_BACK} fill={url("leaf")} />
        <g clipPath={url("leaves")} fill="#74A94C">
          <path d="M427.52 536.49C406.63 582.15 325.88 617.52 286.16 623.44L337.44 659.84L517.73 625.41L604.43 550.34C524.29 578.46 448.19 549.62 427.52 536.49Z" />
          <path d="M401.15 464.29C398.63 463.41 396.11 462.54 393.59 461.67C393.25 462.86 392.95 464.07 392.7 465.28C388.78 486.82 394.52 509.91 410.01 524.13C410.9 524.88 411.82 525.57 412.77 526.21C411.9 525.47 411.07 524.67 410.29 523.84C396.77 508.29 394.43 485.4 400.04 467.24C400.38 466.24 400.75 465.25 401.15 464.29Z" />
          <path
            d="M269.12 485.55C269.12 485.55 282.23 535.49 354.48 536.94L305.92 563.71L260.02 510.88L269.12 485.55Z"
            fillRule="evenodd"
          />
          <path d="M520.82 501.91C575.04 501.8 627.47 472.92 652.6 458.4L657.46 475.38L647.09 511.77C633.73 522.87 603.86 541.51 591.29 527.28C578.71 513.05 539.26 502.78 520.82 501.91Z" />
        </g>
        <g stroke="#532122" strokeWidth="17" strokeLinecap="round">
          <path d="M518.3 723.81C515.18 743.27 493.31 754.26 475.81 740.03" />
          <path d="M435.25 718.43C427.4 746.7 384.84 764.65 353.04 745.94" />
          <path d="M620.29 661C612.45 689.27 569.88 707.23 538.09 688.51" />
        </g>
        <g fill="#FF8F91" fillOpacity="0.5">
          <ellipse
            cx="340.03"
            cy="777.05"
            rx="33.45"
            ry="19.08"
            transform="rotate(5.22 340.03 777.05)"
          />
          <ellipse
            cx="660.14"
            cy="696.03"
            rx="37.87"
            ry="22.77"
            transform="rotate(-33.65 660.14 696.03)"
          />
        </g>
      </g>

      {/* blanket with its folds, and the hands resting on it */}
      <path d={BLANKET} fill="#FEECD6" />
      <g clipPath={url("blanket")} fill="#FCD6B5">
        <path d="M134.5 813C129.95 796 132.5 763.67 134.5 744.5L110 790L114.5 869L202 935L466 983.5L727.5 971.5L818.5 902C818.5 902 806.06 880.98 794.5 883.5C787.97 884.92 786.67 890.46 781 894C767.28 902.57 757.24 902.77 741.5 906.5C718.52 911.94 705.05 912.28 681.5 914C648.2 916.43 629.38 914.65 596 914C558.29 913.27 537.21 910.75 499.5 910C464.95 909.32 445.56 910 411 910C368.82 910 344.73 916.13 303 910C250.09 902.23 211 897.5 173.5 865.5C136 833.5 139.06 830 134.5 813Z" />
        <path d="M362.5 854.5C359.59 848.42 359.5 837.5 359.5 837.5L396 794.5L491.5 825.5C491.5 825.5 492.36 839.98 486.5 845.5C483.89 847.96 481.63 848.25 478.5 850C473.24 852.95 470.04 854.19 465 857.5C459.41 861.16 457.34 864.75 451.5 868C442.64 872.93 436.54 873.58 426.5 875C411.2 877.16 401.31 878.33 387 872.5C376.01 868.02 367.62 865.21 362.5 854.5Z" />
        <path d="M554 864.5C541 843 562.5 836 562.5 836L557.5 797L707 786.5L711 839.5C711 839.5 709 852.5 685 864.5C661 876.5 640 882 618 883C596 884 567 886 554 864.5Z" />
      </g>
      <g fill="#FE5538">
        <path d="M703.5 808C711.26 831.61 716.7 851.44 648 874C611.27 886.06 561.26 880.61 553.5 857C545.75 833.39 574.78 798.91 611.51 786.84C648.24 774.78 695.75 784.39 703.5 808Z" />
        <path d="M362 837.5C361.6 868.7 404.5 872.5 426 870.5C443 868.92 448.7 863.3 459.5 856.5C470.3 849.7 479.67 844.5 483.5 844C489 786 440 783 412.5 788.5C395.83 791.83 362.4 806.3 362 837.5Z" />
      </g>
      <g fill="#FCD6B5">
        <path d="M208.1 799.95C206.69 801.28 206.63 803.49 207.95 804.9C209.28 806.31 211.49 806.37 212.9 805.05L210.5 802.5L208.1 799.95ZM242.5 792.5L243.09 789.05C238.49 788.27 232.06 788.88 225.81 790.63C219.52 792.39 212.9 795.43 208.1 799.95L210.5 802.5L212.9 805.05C216.6 801.57 222.06 798.95 227.69 797.37C233.36 795.79 238.68 795.4 241.91 795.95L242.5 792.5Z" />
        <path d="M248 796L243 789L242 796H248Z" />
      </g>

      {/* the z's */}
      <Z strokes={Z_SMALL} height={33.3} className="pomo-rest-z-small" />
      <Z strokes={Z_BIG} height={45.88} className="pomo-rest-z-big" />
    </svg>
  );
}
