package com.apexbuilder;

import com.apexbuilder.core.ApexSupervisor;
import com.mojang.brigadier.arguments.IntegerArgumentType;
import com.mojang.brigadier.arguments.StringArgumentType;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandManager;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandRegistrationCallback;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.minecraft.network.chat.Component;

public final class ApexBuilderClient implements ClientModInitializer {
    @Override
    public void onInitializeClient() {
        ApexSupervisor.init();
        ClientTickEvents.END_CLIENT_TICK.register(ApexSupervisor::tick);

        ClientCommandRegistrationCallback.EVENT.register((dispatcher, registryAccess) -> dispatcher.register(
            ClientCommandManager.literal("apex")
                .then(ClientCommandManager.literal("water")
                    .then(ClientCommandManager.literal("on").executes(ctx -> {
                        ApexSupervisor.setWaterAssist(true);
                        feedback(ctx.getSource(), "Water assist: ON");
                        return 1;
                    }))
                    .then(ClientCommandManager.literal("off").executes(ctx -> {
                        ApexSupervisor.setWaterAssist(false);
                        feedback(ctx.getSource(), "Water assist: OFF");
                        return 1;
                    })))
                .then(ClientCommandManager.literal("materials").executes(ctx -> {
                    ApexSupervisor.printMaterials(ctx.getSource());
                    return 1;
                }))
                .then(ClientCommandManager.literal("status").executes(ctx -> {
                    ApexSupervisor.printStatus(ctx.getSource());
                    return 1;
                }))
                .then(ClientCommandManager.literal("market")
                    .then(ClientCommandManager.literal("scan")
                        .then(ClientCommandManager.argument("item", StringArgumentType.word())
                            .then(ClientCommandManager.argument("amount", IntegerArgumentType.integer(1, 1000000))
                                .executes(ctx -> {
                                    ApexSupervisor.startMarketScan(
                                        StringArgumentType.getString(ctx, "item"),
                                        IntegerArgumentType.getInteger(ctx, "amount"),
                                        ctx.getSource()
                                    );
                                    return 1;
                                }))))
                    .then(ClientCommandManager.literal("auto")
                        .then(ClientCommandManager.literal("on").executes(ctx -> {
                            ApexSupervisor.setAutoMarketAssist(true);
                            feedback(ctx.getSource(), "Automatic material market scanning: ON");
                            return 1;
                        }))
                        .then(ClientCommandManager.literal("off").executes(ctx -> {
                            ApexSupervisor.setAutoMarketAssist(false);
                            feedback(ctx.getSource(), "Automatic material market scanning: OFF");
                            return 1;
                        }))
                        .then(ClientCommandManager.literal("once").executes(ctx -> {
                            ApexSupervisor.scanNextMissingMaterial(ctx.getSource());
                            return 1;
                        })))
                    .then(ClientCommandManager.literal("stop").executes(ctx -> {
                        ApexSupervisor.stopMarketScan();
                        feedback(ctx.getSource(), "Market scanner stopped.");
                        return 1;
                    })))
                .then(ClientCommandManager.literal("help").executes(ctx -> {
                    ApexSupervisor.printHelp(ctx.getSource());
                    return 1;
                }))
        ));
    }

    private static void feedback(
            net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource source,
            String text) {
        source.sendFeedback(Component.literal("[ApexBuilder] " + text));
    }
}
