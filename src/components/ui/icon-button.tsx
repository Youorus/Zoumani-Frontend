import type { ButtonProps } from "./button";
import { Button } from "./button";

export function IconButton(props: Omit<ButtonProps, "size">) {
  return <Button size="icon" {...props} />;
}
