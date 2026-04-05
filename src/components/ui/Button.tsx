import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "white";
type ButtonSize = "sm" | "md" | "lg";

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface ButtonProps extends BaseProps {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

interface LinkButtonProps extends BaseProps {
  href: string;
  type?: undefined;
  disabled?: undefined;
  onClick?: undefined;
}

type Props = ButtonProps | LinkButtonProps;

function getClassNames(
  variant: ButtonVariant,
  size: ButtonSize,
  fullWidth: boolean,
  className?: string
) {
  const variantMap: Record<ButtonVariant, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline",
    ghost: "btn-ghost",
    danger: "btn-danger",
    white: "btn-white",
  };
  const sizeMap: Record<ButtonSize, string> = {
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  };
  return ["btn", variantMap[variant], sizeMap[size], fullWidth ? "btn-full" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");
}

export function Button(props: Props) {
  const { variant = "primary", size = "md", fullWidth = false, className, children } = props;

  const classes = getClassNames(variant, size, fullWidth, className);

  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      disabled={props.disabled}
      onClick={props.onClick}
      className={classes}
    >
      {children}
    </button>
  );
}
