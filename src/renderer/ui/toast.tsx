import { Toaster as SonnerToaster, toast } from "sonner";

/** App-styled toaster; theme follows the document `.dark` class via CSS variables. */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-[12px] !border !border-separator !bg-white/90 dark:!bg-[#2a2a2c]/92 !backdrop-blur-xl !text-[13px] !text-primary",
        },
      }}
    />
  );
}

export { toast };
