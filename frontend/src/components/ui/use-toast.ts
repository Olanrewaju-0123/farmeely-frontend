"use client";

import * as React from "react";

import type { ToastProps, ToastDataProps } from "@/components/ui/toast";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = Omit<ToastProps, "title"> &
  ToastDataProps & {
    id: string;
  };

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

type ActionType = typeof actionTypes;

type State = {
  toasts: ToasterToast[];
};

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

type ToastFunction = (props: ToastDataProps) => {
  id: string;
  dismiss: () => void;
  update: (props: ToasterToast) => void;
};

interface UseToastReturn {
  toasts: ToasterToast[];
  toast: ToastFunction;
  dismiss: (toastId?: string) => void;
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST:
      const { toastId } = action;
      // ! Side effects ! - This means all toasts will be dismissed.
      // Should use an action to remove all.
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId ? { ...t, open: false } : t
        ),
      };

    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: ((state: State) => void)[] = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

function useToast(): UseToastReturn {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  const addToast = React.useCallback((toast: ToasterToast) => {
    dispatch({ type: actionTypes.ADD_TOAST, toast });
  }, []);

  const updateToast = React.useCallback((toast: Partial<ToasterToast>) => {
    dispatch({ type: actionTypes.UPDATE_TOAST, toast });
  }, []);

  const dismissToast = React.useCallback((toastId?: string) => {
    dispatch({ type: actionTypes.DISMISS_TOAST, toastId });
  }, []);

  const removeToast = React.useCallback((toastId?: string) => {
    dispatch({ type: actionTypes.REMOVE_TOAST, toastId });
  }, []);

  React.useEffect(() => {
    state.toasts.forEach((toast) => {
      if (toast.open === false) {
        // We need to remove visible toasts after timeout
        setTimeout(() => {
          removeToast(toast.id);
        }, TOAST_REMOVE_DELAY);
      }
    });
  }, [state.toasts, removeToast]);

  const toastFunction = React.useCallback(
    ({ ...props }: ToastDataProps) => {
      const id = crypto.randomUUID();

      const update = (props: Partial<ToasterToast>) =>
        updateToast({ ...props, id });
      const dismiss = () => dismissToast(id);

      addToast({
        id,
        open: true,
        onOpenChange: (open: boolean) => {
          if (!open) dismiss();
        },
        ...props,
      });

      return {
        id: id,
        dismiss,
        update,
      };
    },
    [addToast, dismissToast, updateToast]
  );

  return {
    ...state,
    toast: toastFunction,
    dismiss: dismissToast,
  };
}

export { useToast };
