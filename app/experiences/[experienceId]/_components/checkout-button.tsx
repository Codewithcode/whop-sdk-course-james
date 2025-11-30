"use client";

import { trpc } from "@/app/_trpc/client";
import { useIframeSdk } from "@whop/react";
import { Button } from "@whop/react/components";
import { useState } from "react";

function CheckoutButton({ experienceId }: { experienceId: string }) {
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
  const createSubscription = trpc.createSubscription.useMutation();
  const chargeUser = trpc.chargeUser.useMutation();
  const iframeSdk = useIframeSdk();

  const handleChargeUser = async () => {
    setIsCreatingSubscription(true);
    try {
      const data = await chargeUser.mutateAsync({
        experienceId,
        price: 1,
      });
      const result = await iframeSdk.inAppPurchase({
        planId: data.planId,
        id: data.checkoutConfigurationId,
      });
      if (result.status === "ok") console.log("Charge successful");
    } catch (error) {
      console.error("Charge failed");
    } finally {
      setIsCreatingSubscription(false);
    }
  };

  const handleCreateSubscription = async () => {
    setIsCreatingSubscription(true);
    try {
      const data = await createSubscription.mutateAsync({
        experienceId,
      });
      const result = await iframeSdk.inAppPurchase(data);
      if (result.status === "ok") console.log("Subscription created");
    } catch (error) {
      console.error("Subscription creation failed");
    } finally {
      setIsCreatingSubscription(false);
    }
  };

  return (
    <Button
      variant="classic"
      className="w-full"
      size="3"
      onClick={handleCreateSubscription}
      disabled={isCreatingSubscription}
      loading={isCreatingSubscription}
    >
      Checkout
    </Button>
  );
}

export { CheckoutButton };
