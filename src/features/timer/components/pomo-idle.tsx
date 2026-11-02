/*
 * Pomo waiting for the timer, drawn from idle.svg. The art is split into
 * stacked layers that share one viewBox, so each moving part animates on its
 * own: the body hops, the left arm waves, the leaves bounce, the eyes blink
 * and glance, the sparks pop. See the `pomo-idle-*` classes in globals.css.
 * Ids carry a prefix so they cannot clash with anything else on the page.
 * Every layer keeps the source's root fill="none": without it the open mouth
 * stroke gets a black fill. The pupils are cut by a clipPath, not a mask: a
 * mask is rasterised inside a fixed box, and a pupil gliding past that box
 * left dark bars at the edge of the eye.
 */

const VIEWBOX = "170 100 728 880";
const LAYER = "absolute inset-0 h-full w-full overflow-visible";

export function PomoIdle() {
  return (
    <div className="pomo-idle absolute inset-0">
      <svg viewBox={VIEWBOX} fill="none" className={LAYER}>
        {/* shadow */}
        <ellipse
          className="pomo-idle-shadow"
          cx="547.5"
          cy="914.91"
          rx="263.5"
          ry="40.5"
          fill="#FD553A"
          fillOpacity="0.2"
        />
      </svg>
      <div className="pomo-idle-hop absolute inset-0">
        <svg viewBox={VIEWBOX} fill="none" className={LAYER}>
          {/* feet and right arm */}
          <defs>
            <filter
              id="pomo-idle-filter0_g_1_2"
              x="560.61"
              y="751.04"
              width="127.43"
              height="161.81"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.999 0.999"
                numOctaves="3"
                seed="2651"
                result="displacementX"
              />
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.999 0.999"
                numOctaves="3"
                seed="2652"
                result="displacementY"
              />
              <feColorMatrix
                in="displacementX"
                type="matrix"
                values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1"
                result="displacementXRed"
              />
              <feColorMatrix
                in="displacementY"
                type="matrix"
                values="0 0 0 0 0  0 0 0 1 0  0 0 0 0 0  0 0 0 0 1"
              />
              <feComposite
                in="displacementXRed"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
              />
              <feDisplacementMap
                in="shape"
                scale="8"
                xChannelSelector="R"
                yChannelSelector="G"
                width="100%"
                height="100%"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              />
              <feComponentTransfer result="sourceDisplacedAlpha">
                <feFuncA type="gamma" exponent="0.2" />
              </feComponentTransfer>
              <feColorMatrix
                in="shape"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              />
              <feComponentTransfer result="inputSourceAlpha">
                <feFuncA type="gamma" exponent="0.2" />
              </feComponentTransfer>
              <feComposite
                in="sourceDisplacedAlpha"
                operator="arithmetic"
                k1="1"
                k2="0"
                k3="0"
                k4="0"
                result="displacementAlphasMultiplied"
              />
              <feComposite
                in="displacementAlphasMultiplied"
                operator="arithmetic"
                k1="0"
                k2="0"
                k3="-0.5"
                k4="0.5"
                result="centeringAdjustment"
              />
              <feComposite
                in="displacementX"
                in2="displacementAlphasMultiplied"
                operator="arithmetic"
                k1="1"
                k2="0"
                k3="0"
                k4="0"
              />
              <feComposite
                in="centeringAdjustment"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1"
                result="displacementXFinal"
              />
              <feComposite
                in="displacementY"
                in2="displacementAlphasMultiplied"
                operator="arithmetic"
                k1="1"
                k2="0"
                k3="0"
                k4="0"
              />
              <feComposite
                in="centeringAdjustment"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0  0 0 0 1 0  0 0 0 0 0  0 0 0 0 1"
                result="displacementYFinal"
              />
              <feComposite
                in="displacementXFinal"
                in2="displacementYFinal"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
              />
              <feComposite
                in2="displacementAlphasMultiplied"
                operator="in"
                result="displacementMap"
              />
              <feFlood floodColor="rgb(127, 127, 127)" floodOpacity="1" />
              <feComposite in2="displacementAlphasMultiplied" operator="out" />
              <feComposite
                in2="displacementMap"
                operator="over"
                result="displacementMapWithBg"
              />
              <feDisplacementMap
                in="shape"
                scale="8"
                xChannelSelector="R"
                yChannelSelector="G"
                width="100%"
                height="100%"
                result="displacedImage"
              />
              <feColorMatrix
                in="shape"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 127 0"
                result="imageOpaque"
              />
              <feDisplacementMap
                in="imageOpaque"
                in2="displacementMapWithBg"
                scale="8"
                xChannelSelector="R"
                yChannelSelector="G"
                width="100%"
                height="100%"
                result="displacedImageOpaque"
              />
              <feColorMatrix
                in="displacedImage"
                type="matrix"
                values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 127 0"
                result="displacedImageRed"
              />
              <feColorMatrix
                in="shape"
                type="matrix"
                values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 127 0"
              />
              <feComposite
                in="displacedImageRed"
                operator="atop"
                result="transparencyRedMap"
              />
              <feColorMatrix
                in="transparencyRedMap"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0"
                result="transparencyAlphaMap"
              />
              <feComposite
                in="displacedImageOpaque"
                in2="imageOpaque"
                operator="over"
              />
              <feComposite
                in2="transparencyAlphaMap"
                operator="in"
                result="effect1_texture_1_2"
              />
            </filter>
            <linearGradient
              id="pomo-idle-paint0_linear_1_2"
              x1="618.78"
              y1="759.53"
              x2="618.78"
              y2="913.44"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FD553A" />
              <stop offset="1" stopColor="#FD753A" />
            </linearGradient>
            <linearGradient
              id="pomo-idle-paint1_linear_1_2"
              x1="618.78"
              y1="759.53"
              x2="618.78"
              y2="913.44"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FD553A" />
              <stop offset="1" stopColor="#FD753A" />
            </linearGradient>
            <filter
              id="pomo-idle-filter1_g_1_2"
              x="478.88"
              y="653.99"
              width="283.34"
              height="258.57"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.999 0.999"
                numOctaves="3"
                seed="178"
              />
              <feDisplacementMap
                in="shape"
                scale="80"
                xChannelSelector="R"
                yChannelSelector="G"
                result="displacedImage"
                width="100%"
                height="100%"
              />
              <feMerge result="effect1_texture_1_2">
                <feMergeNode in="displacedImage" />
              </feMerge>
            </filter>
            <filter
              id="pomo-idle-filter2_g_1_2"
              x="699.43"
              y="639.32"
              width="155.95"
              height="212.29"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.999 0.999"
                numOctaves="3"
                seed="2651"
                result="displacementX"
              />
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.999 0.999"
                numOctaves="3"
                seed="2652"
                result="displacementY"
              />
              <feColorMatrix
                in="displacementX"
                type="matrix"
                values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1"
                result="displacementXRed"
              />
              <feColorMatrix
                in="displacementY"
                type="matrix"
                values="0 0 0 0 0  0 0 0 1 0  0 0 0 0 0  0 0 0 0 1"
              />
              <feComposite
                in="displacementXRed"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
              />
              <feDisplacementMap
                in="shape"
                scale="8"
                xChannelSelector="R"
                yChannelSelector="G"
                width="100%"
                height="100%"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              />
              <feComponentTransfer result="sourceDisplacedAlpha">
                <feFuncA type="gamma" exponent="0.2" />
              </feComponentTransfer>
              <feColorMatrix
                in="shape"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              />
              <feComponentTransfer result="inputSourceAlpha">
                <feFuncA type="gamma" exponent="0.2" />
              </feComponentTransfer>
              <feComposite
                in="sourceDisplacedAlpha"
                operator="arithmetic"
                k1="1"
                k2="0"
                k3="0"
                k4="0"
                result="displacementAlphasMultiplied"
              />
              <feComposite
                in="displacementAlphasMultiplied"
                operator="arithmetic"
                k1="0"
                k2="0"
                k3="-0.5"
                k4="0.5"
                result="centeringAdjustment"
              />
              <feComposite
                in="displacementX"
                in2="displacementAlphasMultiplied"
                operator="arithmetic"
                k1="1"
                k2="0"
                k3="0"
                k4="0"
              />
              <feComposite
                in="centeringAdjustment"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1"
                result="displacementXFinal"
              />
              <feComposite
                in="displacementY"
                in2="displacementAlphasMultiplied"
                operator="arithmetic"
                k1="1"
                k2="0"
                k3="0"
                k4="0"
              />
              <feComposite
                in="centeringAdjustment"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0  0 0 0 1 0  0 0 0 0 0  0 0 0 0 1"
                result="displacementYFinal"
              />
              <feComposite
                in="displacementXFinal"
                in2="displacementYFinal"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
              />
              <feComposite
                in2="displacementAlphasMultiplied"
                operator="in"
                result="displacementMap"
              />
              <feFlood floodColor="rgb(127, 127, 127)" floodOpacity="1" />
              <feComposite in2="displacementAlphasMultiplied" operator="out" />
              <feComposite
                in2="displacementMap"
                operator="over"
                result="displacementMapWithBg"
              />
              <feDisplacementMap
                in="shape"
                scale="8"
                xChannelSelector="R"
                yChannelSelector="G"
                width="100%"
                height="100%"
                result="displacedImage"
              />
              <feColorMatrix
                in="shape"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 127 0"
                result="imageOpaque"
              />
              <feDisplacementMap
                in="imageOpaque"
                in2="displacementMapWithBg"
                scale="8"
                xChannelSelector="R"
                yChannelSelector="G"
                width="100%"
                height="100%"
                result="displacedImageOpaque"
              />
              <feColorMatrix
                in="displacedImage"
                type="matrix"
                values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 127 0"
                result="displacedImageRed"
              />
              <feColorMatrix
                in="shape"
                type="matrix"
                values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 127 0"
              />
              <feComposite
                in="displacedImageRed"
                operator="atop"
                result="transparencyRedMap"
              />
              <feColorMatrix
                in="transparencyRedMap"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0"
                result="transparencyAlphaMap"
              />
              <feComposite
                in="displacedImageOpaque"
                in2="imageOpaque"
                operator="over"
              />
              <feComposite
                in2="transparencyAlphaMap"
                operator="in"
                result="effect1_texture_1_2"
              />
            </filter>
            <linearGradient
              id="pomo-idle-paint2_linear_1_2"
              x1="764.71"
              y1="652.97"
              x2="764.71"
              y2="857.8"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FD553A" />
              <stop offset="1" stopColor="#FD753A" />
            </linearGradient>
            <linearGradient
              id="pomo-idle-paint3_linear_1_2"
              x1="764.71"
              y1="652.97"
              x2="764.71"
              y2="857.8"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FD553A" />
              <stop offset="1" stopColor="#FD753A" />
            </linearGradient>
            <filter
              id="pomo-idle-filter3_g_1_2"
              x="600.99"
              y="517.46"
              width="335.63"
              height="327.22"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.999 0.999"
                numOctaves="3"
                seed="178"
              />
              <feDisplacementMap
                in="shape"
                scale="80"
                xChannelSelector="R"
                yChannelSelector="G"
                result="displacedImage"
                width="100%"
                height="100%"
              />
              <feMerge result="effect1_texture_1_2">
                <feMergeNode in="displacedImage" />
              </feMerge>
            </filter>
            <filter
              id="pomo-idle-filter4_g_1_2"
              x="410.43"
              y="754.9"
              width="124.81"
              height="161.91"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.999 0.999"
                numOctaves="3"
                seed="2651"
                result="displacementX"
              />
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.999 0.999"
                numOctaves="3"
                seed="2652"
                result="displacementY"
              />
              <feColorMatrix
                in="displacementX"
                type="matrix"
                values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1"
                result="displacementXRed"
              />
              <feColorMatrix
                in="displacementY"
                type="matrix"
                values="0 0 0 0 0  0 0 0 1 0  0 0 0 0 0  0 0 0 0 1"
              />
              <feComposite
                in="displacementXRed"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
              />
              <feDisplacementMap
                in="shape"
                scale="8"
                xChannelSelector="R"
                yChannelSelector="G"
                width="100%"
                height="100%"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              />
              <feComponentTransfer result="sourceDisplacedAlpha">
                <feFuncA type="gamma" exponent="0.2" />
              </feComponentTransfer>
              <feColorMatrix
                in="shape"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              />
              <feComponentTransfer result="inputSourceAlpha">
                <feFuncA type="gamma" exponent="0.2" />
              </feComponentTransfer>
              <feComposite
                in="sourceDisplacedAlpha"
                operator="arithmetic"
                k1="1"
                k2="0"
                k3="0"
                k4="0"
                result="displacementAlphasMultiplied"
              />
              <feComposite
                in="displacementAlphasMultiplied"
                operator="arithmetic"
                k1="0"
                k2="0"
                k3="-0.5"
                k4="0.5"
                result="centeringAdjustment"
              />
              <feComposite
                in="displacementX"
                in2="displacementAlphasMultiplied"
                operator="arithmetic"
                k1="1"
                k2="0"
                k3="0"
                k4="0"
              />
              <feComposite
                in="centeringAdjustment"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1"
                result="displacementXFinal"
              />
              <feComposite
                in="displacementY"
                in2="displacementAlphasMultiplied"
                operator="arithmetic"
                k1="1"
                k2="0"
                k3="0"
                k4="0"
              />
              <feComposite
                in="centeringAdjustment"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0  0 0 0 1 0  0 0 0 0 0  0 0 0 0 1"
                result="displacementYFinal"
              />
              <feComposite
                in="displacementXFinal"
                in2="displacementYFinal"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
              />
              <feComposite
                in2="displacementAlphasMultiplied"
                operator="in"
                result="displacementMap"
              />
              <feFlood floodColor="rgb(127, 127, 127)" floodOpacity="1" />
              <feComposite in2="displacementAlphasMultiplied" operator="out" />
              <feComposite
                in2="displacementMap"
                operator="over"
                result="displacementMapWithBg"
              />
              <feDisplacementMap
                in="shape"
                scale="8"
                xChannelSelector="R"
                yChannelSelector="G"
                width="100%"
                height="100%"
                result="displacedImage"
              />
              <feColorMatrix
                in="shape"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 127 0"
                result="imageOpaque"
              />
              <feDisplacementMap
                in="imageOpaque"
                in2="displacementMapWithBg"
                scale="8"
                xChannelSelector="R"
                yChannelSelector="G"
                width="100%"
                height="100%"
                result="displacedImageOpaque"
              />
              <feColorMatrix
                in="displacedImage"
                type="matrix"
                values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 127 0"
                result="displacedImageRed"
              />
              <feColorMatrix
                in="shape"
                type="matrix"
                values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 127 0"
              />
              <feComposite
                in="displacedImageRed"
                operator="atop"
                result="transparencyRedMap"
              />
              <feColorMatrix
                in="transparencyRedMap"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0"
                result="transparencyAlphaMap"
              />
              <feComposite
                in="displacedImageOpaque"
                in2="imageOpaque"
                operator="over"
              />
              <feComposite
                in2="transparencyAlphaMap"
                operator="in"
                result="effect1_texture_1_2"
              />
            </filter>
            <linearGradient
              id="pomo-idle-paint4_linear_1_2"
              x1="472.55"
              y1="759.13"
              x2="472.55"
              y2="913.03"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FD553A" />
              <stop offset="1" stopColor="#FD753A" />
            </linearGradient>
            <linearGradient
              id="pomo-idle-paint5_linear_1_2"
              x1="472.55"
              y1="759.13"
              x2="472.55"
              y2="913.03"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FD553A" />
              <stop offset="1" stopColor="#FD753A" />
            </linearGradient>
            <filter
              id="pomo-idle-filter5_g_1_2"
              x="336.36"
              y="664.27"
              width="272.28"
              height="245.54"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.999 0.999"
                numOctaves="3"
                seed="178"
              />
              <feDisplacementMap
                in="shape"
                scale="80"
                xChannelSelector="R"
                yChannelSelector="G"
                result="displacedImage"
                width="100%"
                height="100%"
              />
              <feMerge result="effect1_texture_1_2">
                <feMergeNode in="displacedImage" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#pomo-idle-filter0_g_1_2)">
            <rect
              x="560.45"
              y="759.53"
              width="116.66"
              height="153.91"
              rx="58.33"
              transform="rotate(-4.25 560.45 759.53)"
              fill="url(#pomo-idle-paint0_linear_1_2)"
            />
          </g>
          <mask
            id="pomo-idle-mask0_1_2"
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x="564"
            y="755"
            width="121"
            height="154"
          >
            <rect
              x="560.45"
              y="759.53"
              width="116.66"
              height="153.91"
              rx="58.33"
              transform="rotate(-4.25 560.45 759.53)"
              fill="url(#pomo-idle-paint1_linear_1_2)"
            />
          </mask>
          <g mask="url(#pomo-idle-mask0_1_2)">
            <g filter="url(#pomo-idle-filter1_g_1_2)">
              <rect
                x="518.88"
                y="708.19"
                width="191.66"
                height="164.82"
                transform="rotate(-4.25 518.88 708.19)"
                fill="#FF4E31"
              />
            </g>
          </g>
          <g filter="url(#pomo-idle-filter2_g_1_2)">
            <rect
              x="694.98"
              y="652.97"
              width="139.45"
              height="204.83"
              rx="69.73"
              transform="rotate(-7.46 694.98 652.97)"
              fill="url(#pomo-idle-paint2_linear_1_2)"
            />
          </g>
          <mask
            id="pomo-idle-mask1_1_2"
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x="703"
            y="643"
            width="149"
            height="205"
          >
            <rect
              x="694.98"
              y="652.97"
              width="139.45"
              height="204.83"
              rx="69.73"
              transform="rotate(-7.46 694.98 652.97)"
              fill="url(#pomo-idle-paint3_linear_1_2)"
            />
          </mask>
          <g mask="url(#pomo-idle-mask1_1_2)">
            <g filter="url(#pomo-idle-filter3_g_1_2)">
              <rect
                x="640.99"
                y="587.18"
                width="229.1"
                height="219.35"
                transform="rotate(-7.46 640.99 587.18)"
                fill="#FF4E31"
              />
            </g>
          </g>
          <g filter="url(#pomo-idle-filter4_g_1_2)">
            <rect
              x="414.21"
              y="759.13"
              width="116.66"
              height="153.91"
              rx="58.33"
              transform="rotate(-0.22 414.21 759.13)"
              fill="url(#pomo-idle-paint4_linear_1_2)"
            />
          </g>
          <mask
            id="pomo-idle-mask2_1_2"
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x="414"
            y="758"
            width="118"
            height="155"
          >
            <rect
              x="414.21"
              y="759.13"
              width="116.66"
              height="153.91"
              rx="58.33"
              transform="rotate(-0.22 414.21 759.13)"
              fill="url(#pomo-idle-paint5_linear_1_2)"
            />
          </mask>
          <g mask="url(#pomo-idle-mask2_1_2)">
            <g filter="url(#pomo-idle-filter5_g_1_2)">
              <rect
                x="376.36"
                y="704.99"
                width="191.66"
                height="164.82"
                transform="rotate(-0.22 376.36 704.99)"
                fill="#FF4E31"
              />
            </g>
          </g>
        </svg>
        <svg
          viewBox={VIEWBOX}
          fill="none"
          className={`${LAYER} pomo-idle-wave`}
        >
          {/* left arm, the one that waves */}
          <defs>
            <filter
              id="pomo-idle-filter6_g_1_2"
              x="217.52"
              y="565.9"
              width="168.75"
              height="209.31"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.999 0.999"
                numOctaves="3"
                seed="2651"
                result="displacementX"
              />
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.999 0.999"
                numOctaves="3"
                seed="2652"
                result="displacementY"
              />
              <feColorMatrix
                in="displacementX"
                type="matrix"
                values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1"
                result="displacementXRed"
              />
              <feColorMatrix
                in="displacementY"
                type="matrix"
                values="0 0 0 0 0  0 0 0 1 0  0 0 0 0 0  0 0 0 0 1"
              />
              <feComposite
                in="displacementXRed"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
              />
              <feDisplacementMap
                in="shape"
                scale="8"
                xChannelSelector="R"
                yChannelSelector="G"
                width="100%"
                height="100%"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              />
              <feComponentTransfer result="sourceDisplacedAlpha">
                <feFuncA type="gamma" exponent="0.2" />
              </feComponentTransfer>
              <feColorMatrix
                in="shape"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              />
              <feComponentTransfer result="inputSourceAlpha">
                <feFuncA type="gamma" exponent="0.2" />
              </feComponentTransfer>
              <feComposite
                in="sourceDisplacedAlpha"
                operator="arithmetic"
                k1="1"
                k2="0"
                k3="0"
                k4="0"
                result="displacementAlphasMultiplied"
              />
              <feComposite
                in="displacementAlphasMultiplied"
                operator="arithmetic"
                k1="0"
                k2="0"
                k3="-0.5"
                k4="0.5"
                result="centeringAdjustment"
              />
              <feComposite
                in="displacementX"
                in2="displacementAlphasMultiplied"
                operator="arithmetic"
                k1="1"
                k2="0"
                k3="0"
                k4="0"
              />
              <feComposite
                in="centeringAdjustment"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1"
                result="displacementXFinal"
              />
              <feComposite
                in="displacementY"
                in2="displacementAlphasMultiplied"
                operator="arithmetic"
                k1="1"
                k2="0"
                k3="0"
                k4="0"
              />
              <feComposite
                in="centeringAdjustment"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
              />
              <feColorMatrix
                type="matrix"
                values="0 0 0 0 0  0 0 0 1 0  0 0 0 0 0  0 0 0 0 1"
                result="displacementYFinal"
              />
              <feComposite
                in="displacementXFinal"
                in2="displacementYFinal"
                operator="arithmetic"
                k1="0"
                k2="1"
                k3="1"
                k4="0"
              />
              <feComposite
                in2="displacementAlphasMultiplied"
                operator="in"
                result="displacementMap"
              />
              <feFlood floodColor="rgb(127, 127, 127)" floodOpacity="1" />
              <feComposite in2="displacementAlphasMultiplied" operator="out" />
              <feComposite
                in2="displacementMap"
                operator="over"
                result="displacementMapWithBg"
              />
              <feDisplacementMap
                in="shape"
                scale="8"
                xChannelSelector="R"
                yChannelSelector="G"
                width="100%"
                height="100%"
                result="displacedImage"
              />
              <feColorMatrix
                in="shape"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 127 0"
                result="imageOpaque"
              />
              <feDisplacementMap
                in="imageOpaque"
                in2="displacementMapWithBg"
                scale="8"
                xChannelSelector="R"
                yChannelSelector="G"
                width="100%"
                height="100%"
                result="displacedImageOpaque"
              />
              <feColorMatrix
                in="displacedImage"
                type="matrix"
                values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 127 0"
                result="displacedImageRed"
              />
              <feColorMatrix
                in="shape"
                type="matrix"
                values="0 0 0 1 0  0 0 0 0 0  0 0 0 0 0  0 0 0 127 0"
              />
              <feComposite
                in="displacedImageRed"
                operator="atop"
                result="transparencyRedMap"
              />
              <feColorMatrix
                in="transparencyRedMap"
                type="matrix"
                values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0"
                result="transparencyAlphaMap"
              />
              <feComposite
                in="displacedImageOpaque"
                in2="imageOpaque"
                operator="over"
              />
              <feComposite
                in2="transparencyAlphaMap"
                operator="in"
                result="effect1_texture_1_2"
              />
            </filter>
            <linearGradient
              id="pomo-idle-paint6_linear_1_2"
              x1="338.99"
              y1="551.03"
              x2="338.99"
              y2="755.86"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FD553A" />
              <stop offset="1" stopColor="#FD753A" />
            </linearGradient>
            <linearGradient
              id="pomo-idle-paint7_linear_1_2"
              x1="338.99"
              y1="551.03"
              x2="338.99"
              y2="755.86"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FD553A" />
              <stop offset="1" stopColor="#FD753A" />
            </linearGradient>
            <filter
              id="pomo-idle-filter7_g_1_2"
              x="138.87"
              y="428.09"
              width="367.98"
              height="361.93"
              filterUnits="userSpaceOnUse"
              colorInterpolationFilters="sRGB"
            >
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feBlend
                mode="normal"
                in="SourceGraphic"
                in2="BackgroundImageFix"
                result="shape"
              />
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.999 0.999"
                numOctaves="3"
                seed="178"
              />
              <feDisplacementMap
                in="shape"
                scale="80"
                xChannelSelector="R"
                yChannelSelector="G"
                result="displacedImage"
                width="100%"
                height="100%"
              />
              <feMerge result="effect1_texture_1_2">
                <feMergeNode in="displacedImage" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#pomo-idle-filter6_g_1_2)">
            <rect
              x="269.26"
              y="551.03"
              width="139.45"
              height="204.83"
              rx="69.73"
              transform="rotate(18.98 269.26 551.03)"
              fill="url(#pomo-idle-paint6_linear_1_2)"
            />
          </g>
          <mask
            id="pomo-idle-mask3_1_2"
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x="221"
            y="569"
            width="162"
            height="203"
          >
            <rect
              x="269.26"
              y="551.03"
              width="139.45"
              height="204.83"
              rx="69.73"
              transform="rotate(18.98 269.26 551.03)"
              fill="url(#pomo-idle-paint7_linear_1_2)"
            />
          </mask>
          <g mask="url(#pomo-idle-mask3_1_2)">
            <g filter="url(#pomo-idle-filter7_g_1_2)">
              <rect
                x="250.2"
                y="468.09"
                width="229.1"
                height="219.35"
                transform="rotate(18.98 250.2 468.09)"
                fill="#FF4E31"
              />
            </g>
          </g>
        </svg>
        <svg viewBox={VIEWBOX} fill="none" className={LAYER}>
          {/* body */}
          <defs>
            <linearGradient
              id="pomo-idle-paint8_linear_1_2"
              x1="560"
              y1="304.41"
              x2="560"
              y2="844.41"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FD553A" />
              <stop offset="1" stopColor="#FD753A" />
            </linearGradient>
          </defs>
          <path
            d="M878.59 573.24C878.59 716.93 767.47 844.14 566.68 844.14C335.2 851.45 239.19 708.65 239.19 564.95C233.13 411.57 372.01 297.14 546.53 304.77C733.11 297 903.4 418.09 878.59 573.24Z"
            fill="url(#pomo-idle-paint8_linear_1_2)"
          />
        </svg>
        <svg
          viewBox={VIEWBOX}
          fill="none"
          className={`${LAYER} pomo-idle-leaves`}
        >
          {/* leaf crown */}
          <defs>
            <linearGradient
              id="pomo-idle-paint9_linear_1_2"
              x1="599.06"
              y1="233.42"
              x2="599.06"
              y2="439.97"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#75B43B" />
              <stop offset="1" stopColor="#69CA5C" />
            </linearGradient>
            <linearGradient
              id="pomo-idle-paint10_linear_1_2"
              x1="599.06"
              y1="233.42"
              x2="599.06"
              y2="439.97"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#75B43B" />
              <stop offset="1" stopColor="#69CA5C" />
            </linearGradient>
            <linearGradient
              id="pomo-idle-paint11_linear_1_2"
              x1="599.06"
              y1="233.42"
              x2="599.06"
              y2="439.97"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#75B43B" />
              <stop offset="1" stopColor="#69CA5C" />
            </linearGradient>
            <linearGradient
              id="pomo-idle-paint12_linear_1_2"
              x1="599.06"
              y1="233.42"
              x2="599.06"
              y2="439.97"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#75B43B" />
              <stop offset="1" stopColor="#69CA5C" />
            </linearGradient>
          </defs>
          <path
            d="M667.2 439.89C608.22 442.33 552.16 383.35 552.16 383.35L613.58 354.1L687.67 366.29C687.67 366.29 726.18 437.46 667.2 439.89Z"
            fill="url(#pomo-idle-paint9_linear_1_2)"
          />
          <path
            d="M410.8 399.92C427.37 414.55 506.83 424.78 563.86 389.69L634.05 381.89C766.25 413.4 793.63 389.75 790.79 373.99C784.89 321.58 662.81 324.37 662.81 324.37C662.81 324.37 703.27 245.89 662.81 234.68C622.35 223.47 563.86 290.73 563.86 290.73C526.81 254.66 452.43 238.58 437.61 271.72C422.79 304.87 457.11 331.68 476.12 340.94C436.96 347.44 394.23 385.3 410.8 399.92Z"
            fill="url(#pomo-idle-paint10_linear_1_2)"
          />
          <mask
            id="pomo-idle-mask4_1_2"
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x="407"
            y="233"
            width="384"
            height="207"
          >
            <path
              d="M667.2 439.89C608.22 442.33 552.16 383.35 552.16 383.35L613.58 354.1L687.67 366.29C687.67 366.29 726.18 437.46 667.2 439.89Z"
              fill="url(#pomo-idle-paint11_linear_1_2)"
            />
            <path
              d="M410.8 399.92C427.37 414.55 506.83 424.78 563.86 389.69L634.05 381.89C766.25 413.4 793.63 389.75 790.79 373.99C784.89 321.58 662.81 324.37 662.81 324.37C662.81 324.37 703.27 245.89 662.81 234.68C622.35 223.47 563.86 290.73 563.86 290.73C526.81 254.66 452.43 238.58 437.61 271.72C422.79 304.87 457.11 331.68 476.12 340.94C436.96 347.44 394.23 385.3 410.8 399.92Z"
              fill="url(#pomo-idle-paint12_linear_1_2)"
            />
          </mask>
          <g mask="url(#pomo-idle-mask4_1_2)">
            <path
              d="M562.88 366.29C526.23 400.6 438.1 402.68 399.1 393.1L432.74 446.23L612.61 482.79L721.31 446.23C636.49 441.84 577.02 386.27 562.88 366.29Z"
              fill="#74A94C"
            />
            <path
              d="M565.88 289.48C563.88 287.72 561.88 285.95 559.88 284.19C559.12 285.16 558.38 286.17 557.69 287.19C545.89 305.63 542.43 329.17 551.37 348.21C551.91 349.24 552.5 350.23 553.14 351.18C553.14 351.18 553.14 351.18 553.14 351.18C552.61 350.16 552.15 349.11 551.74 348.05C545.13 328.53 551.65 306.46 563.74 291.79C564.43 290.99 565.15 290.21 565.88 289.48Z"
              fill="#74A94C"
            />
            <path
              d="M435.66 259.05C435.66 259.05 428.84 310.23 495.13 338.99L440.05 345.33L417.62 279.03L435.66 259.05Z"
              fillRule="evenodd"
              clipRule="evenodd"
              fill="#74A94C"
            />
            <path
              d="M662.33 369.7C712.53 390.17 772 383.35 800.76 379.45L798.81 397L775.41 426.73C758.84 431.93 724.13 437.85 717.89 419.91C711.65 401.97 679.06 377.5 662.33 369.7Z"
              fill="#74A94C"
            />
          </g>
        </svg>
        <svg viewBox={VIEWBOX} fill="none" className={LAYER}>
          {/* eyes, mouth and cheeks */}
          <g>
            <g className="pomo-idle-blink">
              <ellipse
                cx="637.69"
                cy="578.15"
                rx="62.83"
                ry="81.39"
                transform="rotate(7.06 637.69 578.15)"
                fill="white"
              />
              <clipPath id="pomo-idle-eye-right">
                <ellipse
                  cx="637.69"
                  cy="578.15"
                  rx="62.83"
                  ry="81.39"
                  transform="rotate(7.06 637.69 578.15)"
                  fill="white"
                />
              </clipPath>
              <g clipPath="url(#pomo-idle-eye-right)">
                <g className="pomo-idle-look">
                  <ellipse
                    cx="657.87"
                    cy="585.43"
                    rx="50.73"
                    ry="65.71"
                    transform="rotate(7.06 657.87 585.43)"
                    fill="#532122"
                  />
                </g>
              </g>
            </g>
            <g className="pomo-idle-blink">
              <ellipse
                cx="400.79"
                cy="555.69"
                rx="62.83"
                ry="81.39"
                transform="rotate(7.06 400.79 555.69)"
                fill="white"
              />
              <clipPath id="pomo-idle-eye-left">
                <ellipse
                  cx="400.79"
                  cy="555.69"
                  rx="62.83"
                  ry="81.39"
                  transform="rotate(7.06 400.79 555.69)"
                  fill="white"
                />
              </clipPath>
              <g clipPath="url(#pomo-idle-eye-left)">
                <g className="pomo-idle-look">
                  <ellipse
                    cx="420.97"
                    cy="562.97"
                    rx="50.73"
                    ry="65.71"
                    transform="rotate(7.06 420.97 562.97)"
                    fill="#532122"
                  />
                </g>
              </g>
            </g>
            <path
              d="M490 601.41C500.3 617.72 520.89 620.7 541 605.45"
              strokeWidth="17"
              strokeLinecap="round"
              stroke="#532122"
            />
            <ellipse
              cx="342.69"
              cy="644.94"
              rx="31.2"
              ry="19.01"
              transform="rotate(5.22 342.69 644.94)"
              fill="#FF8F91"
              fillOpacity="0.5"
            />
            <ellipse
              cx="687.81"
              cy="671.26"
              rx="31.2"
              ry="19.01"
              transform="rotate(5.22 687.81 671.26)"
              fill="#FF8F91"
              fillOpacity="0.5"
            />
          </g>
        </svg>
      </div>
      <svg viewBox={VIEWBOX} fill="none" className={LAYER}>
        {/* sparks */}
        <path
          className="pomo-idle-spark"
          d="M279.83 160.99C276.09 151.04 281.75 140.03 292.02 137.27L318.85 130.09C329.05 127.35 339.4 133.95 341.23 144.35L360.07 251.41C361.69 260.6 356.02 269.5 347 271.92L339.62 273.9C330.67 276.29 321.37 271.51 318.11 262.84L279.83 160.99Z"
          fill="#FDB23A"
        />
        <path
          className="pomo-idle-spark pomo-idle-spark-b"
          d="M213.06 271.52C204.99 267.85 201.84 258.03 206.27 250.36L215.13 235.01C219.53 227.39 229.52 225.18 236.73 230.23L301.36 275.51C307.72 279.97 309.62 288.56 305.74 295.3L304.18 297.99C300.32 304.68 292.02 307.34 284.99 304.15L213.06 271.52Z"
          fill="#FDB23A"
        />
      </svg>
    </div>
  );
}
