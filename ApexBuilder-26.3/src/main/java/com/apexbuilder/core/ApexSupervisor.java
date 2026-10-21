package com.apexbuilder.core;

import com.apexbuilder.mixin.BuilderProcessAccessor;
import baritone.api.BaritoneAPI;
import baritone.api.IBaritone;
import baritone.api.pathing.goals.GoalBlock;
import baritone.api.schematic.ISchematic;
import baritone.process.BuilderProcess;
import net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.screens.inventory.AbstractContainerScreen;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Direction;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.network.chat.Component;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.inventory.Slot;
import net.minecraft.world.item.DataComponents;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.item.component.ItemLore;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.LiquidBlock;
import net.minecraft.world.level.block.state.BlockState;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.Vec3;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class ApexSupervisor {
    private static boolean waterAssist = true;
    private static long ticks;
    private static int failureStreak;
    private static BlockPos lastLiquidTarget;
    private static long lastLiquidAttempt;
    private static MarketRequest marketRequest;

    private static final Pattern PRICE =
            Pattern.compile("(?i)(?:\\$\\s*)?([0-9][0-9,]*(?:\\.[0-9]+)?)([kmb])?");

    private ApexSupervisor() {}

    public static void init() {}

    public static void tick(Minecraft client) {
        ticks++;
        if (client.player == null || client.level == null) return;

        if (marketRequest != null && client.screen instanceof AbstractContainerScreen<?> screen && ticks % 5 == 0) {
            scanAuctionScreen(screen);
        }

        if (!waterAssist || ticks % 2 != 0) return;

        IBaritone baritone = primaryBaritone();
        if (baritone == null || !baritone.getBuilderProcess().isActive()) return;
        if (!(baritone.getBuilderProcess() instanceof BuilderProcess builder)) return;

        BuilderProcessAccessor accessor = (BuilderProcessAccessor) builder;
        ISchematic schematic = accessor.apexbuilder$getSchematic();
        net.minecraft.core.Vec3i origin = accessor.apexbuilder$getOrigin();
        if (schematic == null || origin == null) return;

        LiquidTask task = findNearestWaterTask(client.player, schematic, origin);
        if (task == null) {
            failureStreak = 0;
            lastLiquidTarget = null;
            return;
        }

        if (task.target.equals(lastLiquidTarget) && ticks - lastLiquidAttempt < 3) return;
        lastLiquidTarget = task.target;

        if (!selectWaterBucket(client.player)) return;

        double reach = client.player.blockInteractionRange();
        if (client.player.getEyePosition().distanceTo(task.hit) > reach + 0.05) {
            baritone.getCustomGoalProcess().setGoalAndPath(new GoalBlock(task.support));
            return;
        }

        aimAt(client.player, task.hit);
        if (!isAimed(client.player, task.hit)) return;

        InteractionResult result = client.gameMode.useItemOn(
                client.player,
                InteractionHand.MAIN_HAND,
                new BlockHitResult(task.hit, task.face, task.support, false)
        );
        lastLiquidAttempt = ticks;

        if (result.consumesAction()) {
            failureStreak = 0;
        } else if (++failureStreak >= 5) {
            failureStreak = 0;
        }
    }

    private static IBaritone primaryBaritone() {
        try {
            return BaritoneAPI.getProvider().getPrimaryBaritone();
        } catch (Throwable ignored) {
            return null;
        }
    }

    private static LiquidTask findNearestWaterTask(
            LocalPlayer player,
            ISchematic schematic,
            net.minecraft.core.Vec3i origin) {

        BlockPos base = player.blockPosition();
        int r = 7;
        LiquidTask best = null;
        double bestDistance = Double.MAX_VALUE;

        int minX = Math.max(0, base.getX() - origin.getX() - r);
        int minY = Math.max(0, base.getY() - origin.getY() - r);
        int minZ = Math.max(0, base.getZ() - origin.getZ() - r);
        int maxX = Math.min(schematic.widthX() - 1, base.getX() - origin.getX() + r);
        int maxY = Math.min(schematic.heightY() - 1, base.getY() - origin.getY() + r);
        int maxZ = Math.min(schematic.lengthZ() - 1, base.getZ() - origin.getZ() + r);

        if (minX > maxX || minY > maxY || minZ > maxZ) return null;

        for (int x = minX; x <= maxX; x++) {
            for (int y = minY; y <= maxY; y++) {
                for (int z = minZ; z <= maxZ; z++) {
                    BlockPos target = new BlockPos(origin.getX() + x, origin.getY() + y, origin.getZ() + z);
                    BlockState current = player.level().getBlockState(target);
                    if (!current.canBeReplaced() || current.getBlock() == Blocks.WATER || current.getBlock() == Blocks.LAVA) continue;

                    BlockState wanted;
                    try {
                        if (!schematic.inSchematic(x, y, z, current)) continue;
                        wanted = schematic.desiredState(x, y, z, current, Collections.emptyList());
                    } catch (Throwable ignored) {
                        continue;
                    }

                    if (wanted == null || wanted.getBlock() != Blocks.WATER) continue;

                    LiquidTask task = findSupport(player, target);
                    if (task == null) continue;

                    double distance = player.position().distanceToSqr(target.getCenter());
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        best = task;
                    }
                }
            }
        }
        return best;
    }

    private static LiquidTask findSupport(LocalPlayer player, BlockPos target) {
        LiquidTask best = null;
        double bestDistance = Double.MAX_VALUE;

        for (Direction dir : Direction.values()) {
            BlockPos support = target.relative(dir);
            BlockState supportState = player.level().getBlockState(support);
            if (supportState.isAir() || supportState.getBlock() instanceof LiquidBlock) continue;
            if (supportState.getCollisionShape(player.level(), support).isEmpty()) continue;

            Direction hitFace = dir.getOpposite();
            Vec3 hit = Vec3.atCenterOf(support).add(
                    hitFace.getStepX() * 0.48,
                    hitFace.getStepY() * 0.48,
                    hitFace.getStepZ() * 0.48
            );

            double distance = player.getEyePosition().distanceToSqr(hit);
            if (distance < bestDistance) {
                bestDistance = distance;
                best = new LiquidTask(target, support, hitFace, hit);
            }
        }
        return best;
    }

    private static boolean selectWaterBucket(LocalPlayer player) {
        for (int i = 0; i < 9; i++) {
            if (player.getInventory().getItem(i).is(Items.WATER_BUCKET)) {
                player.getInventory().selected = i;
                return true;
            }
        }
        return false;
    }

    private static void aimAt(LocalPlayer player, Vec3 target) {
        Vec3 eye = player.getEyePosition();
        double dx = target.x - eye.x;
        double dy = target.y - eye.y;
        double dz = target.z - eye.z;
        double flat = Math.sqrt(dx * dx + dz * dz);

        float yaw = (float) (Math.toDegrees(Math.atan2(dz, dx)) - 90.0);
        float pitch = (float) (-Math.toDegrees(Math.atan2(dy, flat)));

        player.setYRot(yaw);
        player.setXRot(pitch);
        player.setYHeadRot(yaw);
    }

    private static boolean isAimed(LocalPlayer player, Vec3 target) {
        Vec3 direction = target.subtract(player.getEyePosition()).normalize();
        Vec3 look = player.getViewVector(1.0f).normalize();
        return direction.dot(look) > 0.9993;
    }

    public static void setWaterAssist(boolean enabled) {
        waterAssist = enabled;
    }

    public static void printStatus(FabricClientCommandSource source) {
        IBaritone baritone = primaryBaritone();
        source.sendFeedback(Component.literal(
                "[ApexBuilder] water=" + waterAssist
                        + " | building=" + (baritone != null && baritone.getBuilderProcess().isActive())
                        + " | market=" + (marketRequest != null)
        ));
    }

    public static void printHelp(FabricClientCommandSource source) {
        source.sendFeedback(Component.literal(
                "[ApexBuilder] /apex water on|off | /apex materials | /apex status | /apex market scan <item> <amount>"
        ));
    }

    public static void printMaterials(FabricClientCommandSource source) {
        IBaritone baritone = primaryBaritone();
        if (baritone == null || !baritone.getBuilderProcess().isActive()
                || !(baritone.getBuilderProcess() instanceof BuilderProcess builder)) {
            source.sendError(Component.literal("[ApexBuilder] No active Baritone build."));
            return;
        }

        BuilderProcessAccessor accessor = (BuilderProcessAccessor) builder;
        ISchematic schematic = accessor.apexbuilder$getSchematic();
        net.minecraft.core.Vec3i origin = accessor.apexbuilder$getOrigin();
        if (schematic == null || origin == null) {
            source.sendError(Component.literal("[ApexBuilder] Schematic not available."));
            return;
        }

        Map<String, Integer> missing = new HashMap<>();
        Minecraft client = Minecraft.getInstance();

        for (int y = 0; y < schematic.heightY(); y++) {
            for (int z = 0; z < schematic.lengthZ(); z++) {
                for (int x = 0; x < schematic.widthX(); x++) {
                    BlockPos pos = new BlockPos(origin.getX() + x, origin.getY() + y, origin.getZ() + z);
                    BlockState current = client.level.getBlockState(pos);
                    try {
                        if (!schematic.inSchematic(x, y, z, current)) continue;
                        BlockState wanted = schematic.desiredState(x, y, z, current, Collections.emptyList());
                        if (wanted == null || wanted.isAir() || current.equals(wanted)) continue;
                        String id = BuiltInRegistries.BLOCK.getKey(wanted.getBlock()).toString();
                        missing.merge(id, 1, Integer::sum);
                    } catch (Throwable ignored) {}
                }
            }
        }

        missing.entrySet().stream()
                .sorted(Map.Entry.<String,Integer>comparingByValue().reversed())
                .limit(20)
                .forEach(entry -> source.sendFeedback(Component.literal(
                        "[ApexBuilder] " + entry.getValue() + " x " + entry.getKey()
                )));
    }

    public static void startMarketScan(String item, int amount, FabricClientCommandSource source) {
        marketRequest = new MarketRequest(item.toLowerCase(Locale.ROOT), amount, source);
        source.getPlayer().connection.sendCommand("ah");
        source.sendFeedback(Component.literal(
                "[ApexBuilder] /ah opened. Scanning visible " + item + " listings; purchases stay manual."
        ));
    }

    private static void scanAuctionScreen(AbstractContainerScreen<?> screen) {
        if (marketRequest == null) return;

        double bestUnit = Double.MAX_VALUE;
        double bestTotal = 0;
        int bestCount = 0;
        int bestSlot = -1;

        for (Slot slot : screen.getMenu().slots) {
            ItemStack stack = slot.getItem();
            if (stack.isEmpty()) continue;

            String name = stack.getHoverName().getString().toLowerCase(Locale.ROOT);
            if (!name.contains(marketRequest.itemKey)) continue;

            List<String> lines = new ArrayList<>();
            lines.add(name);
            ItemLore lore = stack.getOrDefault(DataComponents.LORE, ItemLore.EMPTY);
            lore.lines().forEach(line -> lines.add(line.getString()));

            double price = extractPrice(lines);
            if (price <= 0) continue;

            int count = Math.max(1, stack.getCount());
            double unit = price / count;

            if (unit < bestUnit) {
                bestUnit = unit;
                bestTotal = price;
                bestCount = count;
                bestSlot = slot.index;
            }
        }

        if (bestSlot >= 0 && ticks % 20 == 0) {
            marketRequest.source.sendFeedback(Component.literal(
                    "[ApexBuilder] Cheapest visible: " + bestCount + "x "
                            + marketRequest.itemKey + " for " + money(bestTotal)
                            + " (" + money(bestUnit) + "/item), slot " + bestSlot
            ));
        }
    }

    private static double extractPrice(List<String> lines) {
        for (String line : lines) {
            Matcher matcher = PRICE.matcher(line.replaceAll("\s+", " "));
            while (matcher.find()) {
                double value;
                try {
                    value = Double.parseDouble(matcher.group(1).replace(",", ""));
                } catch (NumberFormatException ignored) {
                    continue;
                }

                String suffix = matcher.group(2);
                if (suffix != null) {
                    switch (suffix.toLowerCase(Locale.ROOT)) {
                        case "k" -> value *= 1_000;
                        case "m" -> value *= 1_000_000;
                        case "b" -> value *= 1_000_000_000;
                    }
                }
                if (value > 0) return value;
            }
        }
        return -1;
    }

    private static String money(double value) {
        if (value >= 1_000_000_000) return String.format(Locale.US, "%.2fB", value / 1_000_000_000);
        if (value >= 1_000_000) return String.format(Locale.US, "%.2fM", value / 1_000_000);
        if (value >= 1_000) return String.format(Locale.US, "%.2fK", value / 1_000);
        return String.format(Locale.US, "%.2f", value);
    }

    private record LiquidTask(BlockPos target, BlockPos support, Direction face, Vec3 hit) {}
    private record MarketRequest(String itemKey, int amount, FabricClientCommandSource source) {}
}
