import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";

type FeeRuleBody = {
  mode: string;
  percentageBasisPoints: number;
  effectiveAt: Date;
  reason: string;
};

export function useCreateRule() {
  return useMutation({
    mutationFn: (data: FeeRuleBody) => api.put("/admin/platform-fee-rule", data),
    onSuccess: () => toast.success("Fee rule added"),
    onError: (e) => toast.error("Action Failed", { description: e.message })
  });
}
