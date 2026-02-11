const ShopifyLogo = ({ width = 320, color = "black" }) => {
  return (
    <svg
      width={width}
      viewBox="0 0 420 120"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>{`
        .logo-group {
          animation: scaleIn 0.8s ease-out forwards;
          transform-origin: center;
          opacity: 0;
        }

        .pie {
          stroke-dasharray: 300;
          stroke-dashoffset: 300;
          animation: drawPie 1.2s ease forwards;
        }

        .slice {
          stroke-dasharray: 120;
          stroke-dashoffset: 120;
          animation: drawSlice 0.8s ease forwards;
          animation-delay: 0.6s;
        }

        .text {
          opacity: 0;
          animation: fadeText 0.6s ease forwards;
          animation-delay: 1s;
        }

        .underline {
          stroke-dasharray: 160;
          stroke-dashoffset: 160;
          animation: drawLine 0.6s ease forwards;
          animation-delay: 1.4s;
        }

        @keyframes scaleIn {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes drawPie {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes drawSlice {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes fadeText {
          to {
            opacity: 1;
          }
        }

        @keyframes drawLine {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>

      <g className="logo-group">
        {/* Text */}
        <text
          x="120"
          y="70"
          fontSize="76"
          fontWeight="600"
          fontFamily="Inter, Arial, sans-serif"
          fill={color}
          className="text"
        >
          Swift
        </text>

        {/* Underline */}
        <line
          x1="135"
          y1="82"
          x2="290"
          y2="82"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          className="underline"
        />
      </g>
    </svg>
  );
};

export default ShopifyLogo;
