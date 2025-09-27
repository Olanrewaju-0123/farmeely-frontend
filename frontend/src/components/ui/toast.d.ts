import type * as React from "react"
import type { ToastProps, ToastActionProps } from "@radix-ui/react-toast"
declare const ToastProvider: React.ExoticComponent<React.ProviderProps<any>>
declare const ToastViewport: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLOListElement> & React.RefAttributes<HTMLOListElement>
>
declare const Toast: React.ForwardRefExoticComponent<ToastProps & React.RefAttributes<HTMLLIElement>>
declare const ToastTitle: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
>
declare const ToastDescription: React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
>
declare const ToastClose: React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<"button"> & React.RefAttributes<HTMLButtonElement>
>
declare const ToastAction: React.ForwardRefExoticComponent<ToastActionProps & React.RefAttributes<HTMLButtonElement>>
export {
  type ToastProps,
  type ToastActionProps,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
