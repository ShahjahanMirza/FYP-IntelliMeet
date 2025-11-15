import { Video } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "white" | "gradient";
  showIcon?: boolean;
  className?: string;
}

export const Logo = ({ 
  size = "md", 
  variant = "default",
  showIcon = true,
  className = ""
}: LogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl lg:text-5xl"
  };

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-10 w-10 lg:h-12 lg:w-12"
  };

  const variantClasses = {
    default: "text-primary",
    white: "text-white",
    gradient: "bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent"
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && (
        <div className={`${variant === 'white' ? 'text-white' : 'text-primary'} ${variant === 'gradient' ? 'bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg p-2' : ''}`}>
          <Video className={iconSizes[size]} />
        </div>
      )}
      <span className={`font-bold ${sizeClasses[size]} ${variantClasses[variant]}`}>
        IntelliMeet
      </span>
    </div>
  );
};
