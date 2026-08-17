import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/gestao/crm")({
  component: CRMLayout,
});

function CRMLayout() {
  const { isGestorCRM } = useAuth();

  if (!isGestorCRM) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-slate-600" />
          <h2 className="mt-4 font-display text-lg font-bold text-white">Sem permissão</h2>
          <p className="mt-2 text-sm text-slate-400">
            Você não tem acesso ao módulo CRM.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
