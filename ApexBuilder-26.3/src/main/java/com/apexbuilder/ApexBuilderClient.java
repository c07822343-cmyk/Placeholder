package com.apexbuilder;

import com.apexbuilder.core.ApexSupervisor;
import com.mojang.brigadier.builder.LiteralArgumentBuilder;
import com.mojang.brigadier.builder.RequiredArgumentBuilder;
import com.mojang.brigadier.arguments.IntegerArgumentType;
import com.mojang.brigadier.arguments.StringArgumentType;
import net.fabricmc.api.ClientModInitializer;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandRegistrationCallback;
import net.fabricmc.fabric.api.client.event.lifecycle.v1.ClientTickEvents;
import net.minecraft.network.chat.Component;

public final class ApexBuilderClient implements ClientModInitializer {
    @Override
    public void onInitializeClient() {
        ApexSupervisor.init();
        ClientTickEvents.END_CLIENT_TICK.register(ApexSupervisor::tick);

        ClientCommandRegistrationCallback.EVENT.register((dispatcher, registryAccess) -> dispatcher.register(
            LiteralArgumentBuilder.<net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource>literal("apex")
                .then(LiteralArgumentBuilder.<net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource>literal("water")
                    .then(LiteralArgumentBuilder.<net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource>literal("on").executes(ctx -> {
                        ApexSupervisor.setWaterAssist(true);
                        feedback(ctx.getSource(), "Water assist: ON");
                        return 1;
                    }))
                    .then(LiteralArgumentBuilder.<net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource>literal("off").executes(ctx -> {
                        ApexSupervisor.setWaterAssist(false);
                        feedback(ctx.getSource(), "Water assist: OFF");
                        return 1;
                    })))
                .then(LiteralArgumentBuilder.<net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource>literal("materials").executes(ctx -> {
                    ApexSupervisor.printMaterials(ctx.getSource());
                    return 1;
                }))
                .then(LiteralArgumentBuilder.<net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource>literal("status").executes(ctx -> {
                    ApexSupervisor.printStatus(ctx.getSource());
                    return 1;
                }))
                .then(LiteralArgumentBuilder.<net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource>literal("market")
                    .then(LiteralArgumentBuilder.<net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource>literal("scan")
                        .then(RequiredArgumentBuilder.<net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource, String>argument("item", StringArgumentType.word())
                            .then(RequiredArgumentBuilder.<net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource, Integer>argument("amount", IntegerArgumentType.integer(1, 1000000))
                                .executes(ctx -> {
                                    ApexSupervisor.startMarketScan(
                                        StringArgumentType.getString(ctx, "item"),
                                        IntegerArgumentType.getInteger(ctx, "amount"),
                                        ctx.getSource()
                                    );
                                    return 1;
                                }))))
                    .then(LiteralArgumentBuilder.<net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource>literal("auto")
                        .then(LiteralArgumentBuilder.<net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource>literal("on").executes(ctx -> {
                            ApexSupervisor.setAutoMarketAssist(true);
                            feedback(ctx.getSource(), "Automatic material market scanning: ON");
                            return 1;
                        }))
                        .then(LiteralArgumentBuilder.<net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource>literal("off").executes(ctx -> {
                            ApexSupervisor.setAutoMarketAssist(false);
                            feedback(ctx.getSource(), "Automatic material market scanning: OFF");
                            return 1;
                        }))
                        .then(LiteralArgumentBuilder.<net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource>literal("once").executes(ctx -> {
                            ApexSupervisor.scanNextMissingMaterial(ctx.getSource());
                            return 1;
                        })))
                    .then(LiteralArgumentBuilder.<net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource>literal("stop").executes(ctx -> {
                        ApexSupervisor.stopMarketScan();
                        feedback(ctx.getSource(), "Market scanner stopped.");
                        return 1;
                    })))
                .then(LiteralArgumentBuilder.<net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource>literal("help").executes(ctx -> {
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
