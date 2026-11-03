/*
 * Pomo reading through a focus block, drawn from working.svg. One SVG whose
 * moving parts are groups, each animated on its own (the `pomo-work-*`
 * classes in globals.css): Pomo sways over the book, the eyes run along the
 * lines and blink, the stopwatch fills with the block and wobbles, the
 * sparks flash, and every few
 * seconds Pomo's hand reaches up and a page turns across the book, the eyes
 * and brows following it. Transform origins are in the art's own units.
 * The face is drawn before the book so the turning page passes in front of
 * it. Ids carry a prefix unique to each Pomo (see pomo-idle.tsx). The pupils
 * are cut by a clipPath, not a mask, so they can glide inside the eye.
 */

import { useId } from "react";

// Same aspect as the idle frame (960×1160), the shadow at the same height.
const VIEWBOX = "163 72 753 910";

const LEAVES_LEFT =
  "M377.93 450.51C394.5 465.13 473.96 475.37 530.99 440.27L601.18 432.47C733.38 463.98 760.76 440.34 757.92 424.58C752.03 372.17 629.94 374.95 629.94 374.95C629.94 374.95 670.4 296.47 629.94 285.26C589.48 274.05 530.99 341.32 530.99 341.32C493.94 305.25 419.56 289.16 404.74 322.31C389.92 355.45 424.24 382.26 443.25 391.53C404.09 398.02 361.36 435.88 377.93 450.51Z";
const LEAF_FRONT =
  "M634.33 490.48C575.35 492.91 519.29 433.93 519.29 433.93L580.71 404.69L654.8 416.87C654.8 416.87 693.31 488.04 634.33 490.48Z";
const COVER =
  "M353.76 716.5C354.76 732 360.93 831.83 360.26 875.5C432.61 884.01 473.24 891.11 545.76 905.5C563.84 913.54 574.01 914.76 592.26 908.5C641.52 890.4 665.79 888.36 715.76 875.5C750.01 812.15 775.58 767.38 817.26 707C817.26 707 839.26 683.5 800.76 691C762.26 698.5 615.86 771.31 601.26 780C586.67 788.69 578.09 788.22 562.26 780C546.43 771.79 372.76 707 372.76 707C372.76 707 352.76 701 353.76 716.5Z";
const HAND_LEFT =
  "M300.66 822C361.16 819 393.86 776.7 372.66 751.5C362.67 739.62 347.57 737.09 332.66 739.13C325.06 676.83 285.83 673.09 267.16 679C253.66 684.66 228.16 708.1 234.16 756.5C240.16 804.9 281 820.33 300.66 822Z";
const EYE_LEFT =
  "M445.41 684.28C470.9 687.43 494.88 663.23 498.97 630.21C499.95 622.33 499.7 614.66 498.42 607.5L426.26 577.35C416.14 587.15 408.77 601.8 406.67 618.78C402.58 651.79 419.93 681.12 445.41 684.28Z";
const EYE_RIGHT =
  "M663.56 684.28C638.08 687.43 614.1 663.23 610.01 630.21C609.03 622.33 609.28 614.66 610.56 607.5L682.71 577.35C692.84 587.15 700.2 601.8 702.31 618.78C706.4 651.79 689.05 681.12 663.56 684.28Z";

/** `share` is how much of the focus block has passed, 0 to 1. */
export function PomoWork({ share }: { share: number }) {
  const ids = `pomo-work-${useId().replace(/[^\w-]/g, "")}-`;
  const url = (name: string) => `url(#${ids}${name})`;
  return (
    <svg
      viewBox={VIEWBOX}
      fill="none"
      className="pomo-work absolute inset-0 h-full w-full overflow-visible"
    >
      <defs>
        <linearGradient
          id={`${ids}body`}
          x1="451.26"
          y1="415"
          x2="451.26"
          y2="955"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FD553A" />
          <stop offset="1" stopColor="#FD753A" />
        </linearGradient>
        <linearGradient
          id={`${ids}leaf`}
          x1="566.19"
          y1="284"
          x2="566.19"
          y2="490.55"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#75B43B" />
          <stop offset="1" stopColor="#69CA5C" />
        </linearGradient>
        <clipPath id={`${ids}leaves`}>
          <path d={LEAF_FRONT} />
          <path d={LEAVES_LEFT} />
        </clipPath>
        <clipPath id={`${ids}cover`}>
          <path d={COVER} />
        </clipPath>
        <clipPath id={`${ids}hand`}>
          <path d={HAND_LEFT} />
        </clipPath>
        <clipPath id={`${ids}eye-left`}>
          <path d={EYE_LEFT} />
        </clipPath>
        <clipPath id={`${ids}eye-right`}>
          <path d={EYE_RIGHT} />
        </clipPath>
      </defs>

      {/* shadow */}
      <ellipse
        cx="527.76"
        cy="914.91"
        rx="263.5"
        ry="40.5"
        fill="#FD553A"
        fillOpacity="0.2"
      />

      <g className="pomo-work-read">
        {/* body and leaf crown */}
        <path
          d="M818.26 598.5C817.19 749.01 588.71 866.49 530.74 878.5C472.76 890.5 211.69 748.03 233.26 580.5C252.66 429.92 352.84 344.42 530.74 352.54C720.93 344.27 819.38 441.62 818.26 598.5Z"
          fill={url("body")}
        />
        <path d={LEAF_FRONT} fill={url("leaf")} />
        <path d={LEAVES_LEFT} fill={url("leaf")} />
        <g clipPath={url("leaves")} fill="#74A94C">
          <path d="M530.02 416.87C493.36 451.19 405.23 453.27 366.23 443.68L399.87 496.81L579.74 533.37L688.44 496.81C603.62 492.43 544.15 436.86 530.02 416.87Z" />
          <path d="M533.02 340.06C531.02 338.3 529.02 336.54 527.02 334.77C526.25 335.75 525.51 336.75 524.82 337.77C513.02 356.22 509.57 379.75 518.51 398.8C519.04 399.82 519.63 400.81 520.27 401.76C519.74 400.75 519.28 399.7 518.87 398.63C512.26 379.11 518.78 357.05 530.87 342.37C531.56 341.58 532.28 340.8 533.02 340.06Z" />
          <path
            d="M402.79 309.63C402.79 309.63 395.97 360.82 462.26 389.58L407.18 395.91L384.76 329.62L402.79 309.63Z"
            fillRule="evenodd"
          />
          <path d="M629.46 420.28C679.66 440.76 739.13 433.93 767.89 430.03L765.94 447.58L742.54 477.32C725.97 482.52 691.26 488.43 685.03 470.49C678.79 452.55 646.19 428.08 629.46 420.28Z" />
        </g>

        {/* upper arm behind the book, and cheeks */}
        <path
          d="M787.76 713C821.76 729.8 825.93 771 823.76 789.5L765.26 793L754.76 735.5C751.6 721 753.76 696.2 787.76 713Z"
          fill="#D2412A"
        />
        <ellipse
          cx="372.06"
          cy="683.77"
          rx="31.2"
          ry="19.01"
          transform="rotate(5.22 372.06 683.77)"
          fill="#FF8F91"
          fillOpacity="0.5"
        />
        <ellipse
          cx="719.22"
          cy="685.99"
          rx="31.2"
          ry="19.01"
          transform="rotate(-3.2 719.22 685.99)"
          fill="#FF8F91"
          fillOpacity="0.5"
        />

        {/* eyes, which read along the lines and blink */}
        {/*
          The pupils fill the eye, so they cannot move inside it without
          being cut: each eye glances as a whole, pupil and white together.
        */}
        <g className="pomo-work-blink">
          <g className="pomo-work-look">
            <path d={EYE_LEFT} fill="white" />
            <path
              clipPath={url("eye-left")}
              d="M457.52 685.14C478.1 687.69 497.46 668.15 500.77 641.5C502.22 629.73 500.31 618.54 495.94 609.5L451.26 592.1C438.51 598.77 428.53 613.81 426.24 632.26C422.94 658.92 436.95 682.59 457.52 685.14Z"
              fill="#532122"
            />
          </g>
          <g className="pomo-work-look">
            <path d={EYE_RIGHT} fill="white" />
            <path
              clipPath={url("eye-right")}
              d="M651.45 685.14C630.88 687.69 611.52 668.15 608.21 641.5C606.76 629.73 608.67 618.54 613.03 609.5L657.71 592.1C670.47 598.77 680.45 613.81 682.74 632.26C686.04 658.92 672.03 682.59 651.45 685.14Z"
              fill="#532122"
            />
          </g>
        </g>

        {/* brows, which lift as the page turns, and mouth */}
        <g className="pomo-work-brows" fill="#532122">
          <rect
            x="422.5"
            y="568"
            width="97"
            height="15"
            rx="7.5"
            transform="rotate(24.58 422.5 568)"
          />
          <rect
            width="97"
            height="15"
            rx="7.5"
            transform="matrix(-0.909 0.416 0.416 0.909 686.48 568)"
          />
        </g>
        <path
          d="M580.4 658.21C570.54 675.27 546.2 677.74 534.92 658.21"
          strokeWidth="17"
          strokeLinecap="round"
          stroke="#532122"
        />

        {/* the book: page edges, the page that turns, cover and spine */}
        <path
          d="M391.76 690.5C377.76 693.7 372.93 710.83 372.26 719L421.26 784.5L560.76 835.5L756.76 757L818.26 693.5C818.26 686.3 800.26 677.5 791.26 674C712.06 674.8 616.1 738 581.26 769C544.76 723.5 409.26 686.5 391.76 690.5Z"
          fill="#FDF6ED"
        />
        {/*
          Lies along the right edge, pivoting on the spine at 581,769. It is
          drawn under the cover, which hides all of it but the part that
          rises above the book.
        */}
        <path
          className="pomo-work-page"
          d="M581 769C661 753 741 755 813 769L806 880C741 868 661 872 581 890Z"
          fill="#FDF6ED"
          stroke="#E8D7C3"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d={COVER} fill="#614B57" />
        <g clipPath={url("cover")} fill="#56424D">
          <rect
            x="600.05"
            y="773"
            width="4.45"
            height="156"
            transform="rotate(4.33 600.05 773)"
          />
          <rect
            x="557.05"
            y="770"
            width="5.55"
            height="156"
            transform="rotate(4.33 557.05 770)"
          />
        </g>

        {/* feet and hands; the left hand turns the pages */}
        <path
          d="M697.47 816.54C667 846.04 654.96 870.51 677.59 892.13C700.21 913.75 739.09 909.77 764.45 883.24C789.8 856.72 792.01 817.69 769.39 796.07C746.77 774.45 719.35 785.51 697.47 816.54Z"
          fill="#D2412A"
        />
        <path
          d="M386.47 820.81C413.72 853.31 423.15 878.9 398.4 898.05C373.66 917.21 335.39 909.21 312.93 880.2C290.47 851.18 292.32 812.13 317.06 792.98C341.81 773.83 367.93 787.68 386.47 820.81Z"
          fill="#D2412A"
        />
        <path
          d="M749.76 841.5C737.43 813.5 728.26 755.7 790.26 748.5C867.76 739.5 797.26 890.5 749.76 841.5Z"
          fill="#EA472E"
        />
        <g className="pomo-work-grab">
          <path d={HAND_LEFT} fill="#EA472E" />
          <path
            clipPath={url("hand")}
            d="M284.76 764.5C293.16 750.1 320.26 741.5 332.76 739L338.26 735.5L336.26 734C307.86 735.6 289.6 753.83 284.76 764.5Z"
            fill="#CC2F17"
          />
        </g>
      </g>

      {/* sparks */}
      <g className="pomo-work-sparks" fill="#FC573D">
        <path d="M813.68 259.11C817.38 253.68 815.59 246.23 809.82 243.08L794.75 234.83C789.02 231.7 781.84 234.15 779.21 240.13L752.23 301.72C749.92 307 752.03 313.18 757.09 315.95L761.24 318.22C766.26 320.97 772.56 319.46 775.78 314.73L813.68 259.11Z" />
        <path d="M837.64 335.3C843.03 334.28 846.36 328.84 844.82 323.58L841.74 313.06C840.21 307.84 834.53 305.05 829.46 307.03L784 324.79C779.52 326.54 777.12 331.42 778.47 336.04L779.01 337.89C780.35 342.47 784.95 345.28 789.64 344.4L837.64 335.3Z" />
      </g>

      {/* stopwatch, its face filling clockwise as the block runs */}
      <g className="pomo-work-clock">
        <rect x="506" y="47" width="67" height="25" rx="12.5" fill="#F5543B" />
        <circle cx="539.5" cy="167.5" r="87.5" fill="#FDEEE7" />
        {/* A dash on a circle half the face's radius, as wide as the face. */}
        <circle
          className="pomo-work-fill"
          cx="539.5"
          cy="167.5"
          r="40"
          stroke="#FC6E2E"
          strokeWidth="80"
          pathLength={100}
          strokeDasharray={`${Math.min(1, Math.max(0, share)) * 100} 100`}
          transform="rotate(-90 539.5 167.5)"
        />
        <circle
          cx="539.5"
          cy="167.5"
          r="87.5"
          stroke="#FD9282"
          strokeWidth="22"
        />
      </g>
    </svg>
  );
}
