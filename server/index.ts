import { whopsdk } from "@/lib/whop-sdk";
import { procedure, router } from "./trpc";
import { z } from "zod";

export const chargeUserSchema = z.object({
  price: z.number(),
  experienceId: z.string(),
});

export const createSubscriptionSchema = z.object({
  experienceId: z.string(),
});

export const appRouter = router({
  chargeUser: procedure.input(chargeUserSchema).mutation(async ({ input }) => {
    const { experienceId, price } = input;

    if (!process.env.NEXT_PUBLIC_WHOP_COMPANY_ID)
      throw new Error("WHOP_COMPANY_ID is not set");

    try {
      const result = await whopsdk.checkoutConfigurations.create({
        plan: {
          company_id: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID ?? "",
          currency: "usd",
          initial_price: price,
          plan_type: "one_time",
          title: "Test Plan",
          description: "This is a description",
        },
        metadata: {
          experienceId: experienceId,
        },
      });

      if (!result?.plan?.id) throw new Error("Failed to charge user");

      return {
        planId: result.plan.id,
        id: result.id,
      };
    } catch (error) {
      console.error(error);
      throw new Error("Failed to charge user");
    }
  }),
  createSubscription: procedure
    .input(createSubscriptionSchema)
    .mutation(async ({ input }) => {
      const { experienceId } = input;

      if (!process.env.NEXT_PUBLIC_PREMIUM_ACCESS) {
        throw new Error("NEXT_PUBLIC_PREMIUM_ACCESS is not set");
      }

      try {
        const result = await whopsdk.checkoutConfigurations.create({
          plan_id: process.env.NEXT_PUBLIC_PREMIUM_ACCESS,
          metadata: {
            experienceId: experienceId,
          },
        });

        console.log("[CHECKOUT CONFIGURATION]", result);

        if (!result?.plan?.id) throw new Error("Failed to charge user");

        return {
          planId: result.plan.id,
          id: result.id,
        };
      } catch (error) {
        console.error(error);
        throw new Error("Failed to charge user");
      }
    }),
});

export type AppRouter = typeof appRouter;

export const serverCaller = appRouter.createCaller({});
