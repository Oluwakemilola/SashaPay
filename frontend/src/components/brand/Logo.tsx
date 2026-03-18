import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  variant?: "default" | "inverted";
}

const Logo: React.FC<LogoProps> = ({ 
  className = "", 
  size = 32, 
  showText = true,
  variant = "default"
}) => {
  const textColor = variant === "inverted" ? "#F8F5ED" : "#0B3D2E";
  
  return (
    <div className={`flex items-center gap-2 ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <rect width="100" height="100" rx="24" fill="#0B3D2E" />
        <path
          d="M35 65C35 65 40 70 50 70C60 70 65 65 65 57.5C65 50 60 47.5 50 47.5C40 47.5 35 45 35 37.5C35 30 40 25 50 25C60 25 65 30 65 30"
          stroke="#C9962A"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M50 20V80"
          stroke="#C9962A"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.3"
        />
      </svg>
      {showText && (
        <span 
          style={{ 
            fontFamily: "'DM Serif Display', serif", 
            fontSize: size * 0.7, 
            color: textColor,
            marginLeft: size * 0.2
          }}
        >
          Sacha<span style={{ color: "#C9962A" }}>Pay</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
