import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Typography.module.css";

export type TypographyVariant = "heading" | "lead" | "paragraph";
export type TypographyElement = "h1" | "h2" | "h3" | "p" | "span";

type TypographyProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  as?: TypographyElement;
  variant: TypographyVariant;
  children: ReactNode;
};

export function Typography({
  as: Element = "p",
  variant,
  className,
  children,
  ...props
}: TypographyProps) {
  return (
    <Element className={[styles[variant], className].filter(Boolean).join(" ")} {...props}>
      {children}
    </Element>
  );
}
