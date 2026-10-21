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
import net.minecraft.core.Vec3i;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.network.chat.Component;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.inventory.Slot;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.item.Items;
import net.minecraft.world.item.DataComponents;
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
    private static final long MATERIAL_REFRESH_TICKS = 80;
    private static final long MARKET_OPEN_COOLDOWN = 160;
    private static final long MARKET_MESSAGE_COOLDOWN = 30;
    private static final int WATER_SCAN_RADIUS = 8;
    private static final int MATERIAL_SCAN_LIMIT = 250_000;

    private static boolean waterAssist = true;
    private static boolean autoMarketAssist = false;

    private static long ticks;
    private static long lastMaterialRefresh;
    private static long lastMarketOpen;
    private static long lastMarketMessage;
    private static int failureStreak;

    private static BlockPos lastLiquidTarget;
    private static long liquidTargetSince;
    private static long lastLiquidAttempt;

    private static MaterialSnapshot materialSnapshot = MaterialSnapshot.empty();
    private static MarketRequest marketRequest;
    private static int marketNoMatchStreak;

    private static final Pattern PRICE =
            Pattern.compile("(?i)(?:\\$\\s*)?([0-9][0-9,]*(?:\\.[0-9]+)?)([kmb])?");

    private ApexSupervisor() {}

    public static void init() {
        materialSnapshot = MaterialSnapshot.empty();
    }

    public static void tick(Minecraft client) {
        ticks++;

        if (client.player == null || client.level == null) {
            return;
        }

        IBaritone baritone = primaryBaritone();

        if (baritone != null && baritone.getBuilderProcess().isActive()) {
            if (ticks - lastMaterialRefresh >= MATERIAL_REFRESH_TICKS) {
                refreshMaterials(client, baritone);
                lastMaterialRefresh = ticks;
            }

            if (autoMarketAssist && marketRequest == null && ticks - lastMarketOpen >= MARKET_OPEN_COOLDOWN) {
                scanNextMissingMaterialInternal();
            }
        }

        if (marketRequest != null) {
            if (client.screen instanceof AbstractContainerScreen<?> screen) {
                if (ticks % 5 == 0) {
                    scanAuctionScreen(screen);
                }
            } else if (ticks - lastMarketMessage > 10) {
                lastMarketMessage = ticks;
                marketRequest.source.sendFeedback(Component.literal(
                        "[ApexBuilder] Waiting for the Auction House screen for " + marketRequest.itemKey + "."
                ));
            }
        }

        if (!waterAssist || ticks % 2 != 0) {
            return;
        }

        if (baritone == null || !baritone.getBuilderProcess().isActive()) {
            return;
        }

        if (!(baritone.getBuilderProcess() instanceof BuilderProcess builder)) {
            return;
        }

        BuilderProcessAccessor accessor = (BuilderProcessAccessor) builder;
        ISchematic schematic = accessor.apexbuilder$getSchematic();
        Vec3i origin = accessor.apexbuilder$getOrigin();
        if (schematic == null || origin == null) {
            return;
        }

        LiquidTask task = findNearestWaterTask(client.player, schematic, origin);
        if (task == null) {
            failureStreak = 0;
            lastLiquidTarget = null;
            liquidTargetSince = 0;
            return;
        }

        if (!task.target.equals(lastLiquidTarget)) {
            lastLiquidTarget = task.target;
            liquidTargetSince = ticks;
            failureStreak = 0;
        }

        // Require the target to be stable for a few ticks. This prevents aim twitching
        // when the builder rapidly changes the nearest requested liquid block.
        if (ticks - liquidTargetSince < 3) {
            return;
        }

        if (ticks - lastLiquidAttempt < 4) {
            return;
        }

        if (!selectWaterBucket(client.player)) {
            return;
        }

        double reach = client.player.blockInteractionRange();
        if (client.player.getEyePosition().distanceTo(task.hit) > reach + 0.05) {
            baritone.getCustomGoalProcess().setGoalAndPath(new GoalBlock(task.support));
            return;
        }

        aimAt(client.player, task.hit);

        if (!isAimed(client.player, task.hit)) {
            return;
        }

        InteractionResult result = client.gameMode.useItemOn(
                client.player,
                InteractionHand.MAIN_HAND,
                new BlockHitResult(task.hit, task.face, task.support, false)
        );

        lastLiquidAttempt = ticks;

        if (result.consumesAction()) {
            failureStreak = 0;
        } else if (++failureStreak >= 4) {
            failureStreak = 0;
            liquidTargetSince = ticks + 2;
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
            Vec3i origin) {

        BlockPos base = player.blockPosition();
        int r = WATER_SCAN_RADIUS;
        LiquidTask best = null;
        double bestDistance = Double.MAX_VALUE;

        int minX = Math.max(0, base.getX() - origin.getX() - r);
        int minY = Math.max(0, base.getY() - origin.getY() - r);
        int minZ = Math.max(0, base.getZ() - origin.getZ() - r);
        int maxX = Math.min(schematic.widthX() - 1, base.getX() - origin.getX() + r);
        int maxY = Math.min(schematic.heightY() - 1, base.getY() - origin.getY() + r);
        int maxZ = Math.min(schematic.lengthZ() - 1, base.getZ() - origin.getZ() + r);

        if (minX > maxX || minY > maxY || minZ > maxZ) {
            return null;
        }

        for (int x = minX; x <= maxX; x++) {
            for (int y = minY; y <= maxY; y++) {
                for (int z = minZ; z <= maxZ; z++) {
                    BlockPos target = new BlockPos(
                            origin.getX() + x,
                            origin.getY() + y,
                            origin.getZ() + z
                    );

                    BlockState current = player.level().getBlockState(target);
                    if (current.getBlock() == Blocks.WATER
                            || current.getBlock() == Blocks.LAVA
                            || !current.canBeReplaced()) {
                        continue;
                    }

                    BlockState wanted;
                    try {
                        if (!schematic.inSchematic(x, y, z, current)) {
                            continue;
                        }
                        wanted = schematic.desiredState(
                                x, y, z, current, Collections.emptyList()
                        );
                    } catch (Throwable ignored) {
                        continue;
                    }

                    if (wanted == null || wanted.getBlock() != Blocks.WATER) {
                        continue;
                    }

                    LiquidTask task = findSupport(player, target);
                    if (task == null) {
                        continue;
                    }

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

            if (supportState.isAir()
                    || supportState.getBlock() instanceof LiquidBlock
                    || supportState.getCollisionShape(player.level(), support).isEmpty()) {
                continue;
            }

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
                if (player.getInventory().selected != i) {
                    player.getInventory().selected = i;
                }
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

        float currentYaw = player.getYRot();
        float currentPitch = player.getXRot();

        if (Math.abs(wrapDegrees(yaw - currentYaw)) > 0.15f) {
            player.setYRot(yaw);
            player.setYHeadRot(yaw);
        }
        if (Math.abs(pitch - currentPitch) > 0.15f) {
            player.setXRot(pitch);
        }
    }

    private static float wrapDegrees(float value) {
        float wrapped = value % 360.0f;
        if (wrapped >= 180.0f) wrapped -= 360.0f;
        if (wrapped < -180.0f) wrapped += 360.0f;
        return wrapped;
    }

    private static boolean isAimed(LocalPlayer player, Vec3 target) {
        Vec3 direction = target.subtract(player.getEyePosition()).normalize();
        Vec3 look = player.getViewVector(1.0f).normalize();
        return direction.dot(look) > 0.9990;
    }

    public static void setWaterAssist(boolean enabled) {
        waterAssist = enabled;
    }

    public static void setAutoMarketAssist(boolean enabled) {
        autoMarketAssist = enabled;
        if (!enabled) {
            marketRequest = null;
        }
    }

    public static void printStatus(FabricClientCommandSource source) {
        IBaritone baritone = primaryBaritone();
        String topNeed = materialSnapshot.topNeed == null
                ? "none"
                : materialSnapshot.topNeed.displayName + " x" + materialSnapshot.topNeed.deficit;

        source.sendFeedback(Component.literal(
                "[ApexBuilder] water=" + waterAssist
                        + " | auto-market=" + autoMarketAssist
                        + " | building=" + (baritone != null && baritone.getBuilderProcess().isActive())
                        + " | missing=" + materialSnapshot.totalDeficit
                        + " | top=" + topNeed
                        + " | market=" + (marketRequest == null ? "idle" : marketRequest.itemKey)
        ));
    }

    public static void printHelp(FabricClientCommandSource source) {
        source.sendFeedback(Component.literal(
                "[ApexBuilder] Commands: "
                        + "/apex water on|off, "
                        + "/apex materials, "
                        + "/apex status, "
                        + "/apex market scan <item> <amount>, "
                        + "/apex market auto on|off|once, "
                        + "/apex market stop"
        ));
    }

    public static void printMaterials(FabricClientCommandSource source) {
        Minecraft client = Minecraft.getInstance();
        IBaritone baritone = primaryBaritone();

        if (client.player == null
                || client.level == null
                || baritone == null
                || !baritone.getBuilderProcess().isActive()
                || !(baritone.getBuilderProcess() instanceof BuilderProcess builder)) {
            source.sendError(Component.literal("[ApexBuilder] No active Baritone build."));
            return;
        }

        refreshMaterials(client, baritone);

        source.sendFeedback(Component.literal(
                "[ApexBuilder] Missing blocks: " + materialSnapshot.totalDeficit
                        + " | scanned=" + materialSnapshot.scannedBlocks
        ));

        materialSnapshot.needs.stream()
                .limit(20)
                .forEach(need -> source.sendFeedback(Component.literal(
                        "[ApexBuilder] " + need.deficit + " x " + need.displayName
                                + " | schematic=" + need.schematicCount
                                + " | inventory=" + need.inventoryCount
                                + " | id=" + need.itemId
                )));
    }

    public static void scanNextMissingMaterial(FabricClientCommandSource source) {
        if (marketRequest != null) {
            source.sendFeedback(Component.literal(
                    "[ApexBuilder] Already scanning " + marketRequest.itemKey + "."
            ));
            return;
        }

        if (!scanNextMissingMaterialInternal()) {
            source.sendFeedback(Component.literal(
                    "[ApexBuilder] No missing material is currently available to scan."
            ));
        } else {
            source.sendFeedback(Component.literal(
                    "[ApexBuilder] Automatic market scan started for the highest-priority missing material."
            ));
        }
    }

    private static boolean scanNextMissingMaterialInternal() {
        Minecraft client = Minecraft.getInstance();
        IBaritone baritone = primaryBaritone();

        if (client.player == null
                || client.level == null
                || baritone == null
                || !baritone.getBuilderProcess().isActive()) {
            return false;
        }

        if (ticks - lastMarketOpen < MARKET_OPEN_COOLDOWN) {
            return false;
        }

        refreshMaterials(client, baritone);

        MaterialNeed need = materialSnapshot.topNeed;
        if (need == null || need.deficit <= 0) {
            return false;
        }

        String lookup = need.searchKey;
        marketRequest = new MarketRequest(
                lookup,
                need.deficit,
                null,
                client.player
        );
        marketNoMatchStreak = 0;
        lastMarketOpen = ticks;

        client.player.connection.sendCommand("ah");
        feedback(marketRequest,
                "Market watch: " + need.deficit + " x " + need.displayName
                        + " | searching visible Auction House listings.");
        return true;
    }

    public static void startMarketScan(String item, int amount, FabricClientCommandSource source) {
        marketRequest = new MarketRequest(
                item.toLowerCase(Locale.ROOT),
                amount,
                source,
                source.getPlayer()
        );
        marketNoMatchStreak = 0;
        lastMarketOpen = ticks;

        if (source.getPlayer() != null) {
            source.getPlayer().connection.sendCommand("ah");
        }

        source.sendFeedback(Component.literal(
                "[ApexBuilder] /ah opened. Scanning visible " + item
                        + " listings; purchases remain manual."
        ));
    }

    public static void stopMarketScan() {
        marketRequest = null;
        marketNoMatchStreak = 0;
    }

        private static void scanAuctionScreen(AbstractContainerScreen<?> screen) {
        if (marketRequest == null) {
            return;
        }

        double bestUnit = Double.MAX_VALUE;
        double bestTotal = 0;
        int bestCount = 0;
        int bestSlot = -1;

        for (Slot slot : screen.getMenu().slots) {
            ItemStack stack = slot.getItem();
            if (stack.isEmpty()) {
                continue;
            }

            String name = stack.getHoverName().getString().toLowerCase(Locale.ROOT);
            String registryId = BuiltInRegistries.ITEM.getKey(stack.getItem()).toString().toLowerCase(Locale.ROOT);

            if (!name.contains(marketRequest.itemKey)
                    && !registryId.contains(marketRequest.itemKey.replace(' ', '_'))) {
                continue;
            }

            List<String> lines = new ArrayList<>();
            lines.add(name);

            ItemLore lore = stack.getOrDefault(DataComponents.LORE, ItemLore.EMPTY);
            lore.lines().forEach(line -> lines.add(line.getString()));

            double price = extractPrice(lines);
            if (price <= 0) {
                continue;
            }

            int count = Math.max(1, stack.getCount());
            double unit = price / count;

            if (unit < bestUnit) {
                bestUnit = unit;
                bestTotal = price;
                bestCount = count;
                bestSlot = slot.index;
            }
        }

        if (bestSlot >= 0) {
            marketNoMatchStreak = 0;

            if (ticks - lastMarketMessage >= MARKET_MESSAGE_COOLDOWN) {
                lastMarketMessage = ticks;
                feedback(marketRequest,
                        "Cheapest visible: " + bestCount + "x "
                                + marketRequest.itemKey + " for " + money(bestTotal)
                                + " (" + money(bestUnit) + "/item), slot " + bestSlot);
            }

            if (autoMarketAssist) {
                // The scanner is intentionally non-transactional: once a result is found,
                // leave the player in control of the actual purchase.
                marketRequest = null;
            }

            return;
        }

        if (++marketNoMatchStreak >= 20 && ticks - lastMarketMessage >= MARKET_MESSAGE_COOLDOWN) {
            marketNoMatchStreak = 0;
            lastMarketMessage = ticks;
            feedback(marketRequest,
                    "No matching visible listing for " + marketRequest.itemKey
                            + ". Refresh/search the AH screen, or /apex market stop.");
        }
    }

    private static double extractPrice(List<String> lines) {
        for (String line : lines) {
            String normalized = line.replaceAll("\\s+", " ");
            Matcher matcher = PRICE.matcher(normalized);

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
                        default -> {}
                    }
                }

                if (value > 0) {
                    return value;
                }
            }
        }

        return -1;
    }

    private static String money(double value) {
        if (value >= 1_000_000_000) {
            return String.format(Locale.US, "%.2fB", value / 1_000_000_000);
        }
        if (value >= 1_000_000) {
            return String.format(Locale.US, "%.2fM", value / 1_000_000);
        }
        if (value >= 1_000) {
            return String.format(Locale.US, "%.2fK", value / 1_000);
        }
        return String.format(Locale.US, "%.2f", value);
    }

    private static void refreshMaterials(Minecraft client, IBaritone baritone) {
        if (client.player == null
                || client.level == null
                || !(baritone.getBuilderProcess() instanceof BuilderProcess builder)) {
            materialSnapshot = MaterialSnapshot.empty();
            return;
        }

        BuilderProcessAccessor accessor = (BuilderProcessAccessor) builder;
        ISchematic schematic = accessor.apexbuilder$getSchematic();
        Vec3i origin = accessor.apexbuilder$getOrigin();

        if (schematic == null || origin == null) {
            materialSnapshot = MaterialSnapshot.empty();
            return;
        }

        Map<Item, Integer> schematicCounts = new HashMap<>();
        int scanned = 0;

        outer:
        for (int y = 0; y < schematic.heightY(); y++) {
            for (int z = 0; z < schematic.lengthZ(); z++) {
                for (int x = 0; x < schematic.widthX(); x++) {
                    if (++scanned > MATERIAL_SCAN_LIMIT) {
                        break outer;
                    }

                    BlockPos pos = new BlockPos(
                            origin.getX() + x,
                            origin.getY() + y,
                            origin.getZ() + z
                    );

                    BlockState current = client.level.getBlockState(pos);

                    try {
                        if (!schematic.inSchematic(x, y, z, current)) {
                            continue;
                        }

                        BlockState wanted = schematic.desiredState(
                                x, y, z, current, Collections.emptyList()
                        );

                        if (wanted == null
                                || wanted.isAir()
                                || current.equals(wanted)
                                || wanted.getBlock() == Blocks.WATER
                                || wanted.getBlock() == Blocks.LAVA) {
                            continue;
                        }

                        Item item = wanted.getBlock().asItem();
                        if (item == Items.AIR) {
                            continue;
                        }

                        schematicCounts.merge(item, 1, Integer::sum);
                    } catch (Throwable ignored) {
                    }
                }
            }
        }

        Map<Item, Integer> inventoryCounts = new HashMap<>();
        for (ItemStack stack : client.player.getInventory().getNonEquipmentItems()) {
            if (stack.isEmpty()) {
                continue;
            }
            inventoryCounts.merge(stack.getItem(), stack.getCount(), Integer::sum);
        }

        List<MaterialNeed> needs = new ArrayList<>();
        int totalDeficit = 0;

        for (Map.Entry<Item, Integer> entry : schematicCounts.entrySet()) {
            Item item = entry.getKey();
            int schematicCount = entry.getValue();
            int inventoryCount = inventoryCounts.getOrDefault(item, 0);
            int deficit = Math.max(0, schematicCount - inventoryCount);

            if (deficit <= 0) {
                continue;
            }

            String itemId = BuiltInRegistries.ITEM.getKey(item).toString();
            String display = item.getDefaultInstance().getHoverName().getString();
            String searchKey = display.toLowerCase(Locale.ROOT);

            // The search key is deliberately a loose human-readable term so AH variants
            // such as enchanted or custom-named listings can still be recognized.
            needs.add(new MaterialNeed(
                    itemId,
                    display,
                    searchKey,
                    schematicCount,
                    inventoryCount,
                    deficit
            ));
            totalDeficit += deficit;
        }

        needs.sort(Comparator
                .comparingInt((MaterialNeed n) -> n.deficit).reversed()
                .thenComparing(n -> n.displayName));

        materialSnapshot = new MaterialSnapshot(
                needs,
                totalDeficit,
                scanned,
                needs.isEmpty() ? null : needs.get(0)
        );
    }

    private record LiquidTask(BlockPos target, BlockPos support, Direction face, Vec3 hit) {}

    private static void feedback(MarketRequest request, String text) {
        Component message = Component.literal("[ApexBuilder] " + text);
        if (request.source != null) {
            request.source.sendFeedback(message);
        } else if (request.player != null) {
            request.player.sendSystemMessage(message);
        }
    }

    private record MarketRequest(
            String itemKey,
            int amount,
            FabricClientCommandSource source,
            LocalPlayer player
    ) {}

    private record MaterialNeed(
            String itemId,
            String displayName,
            String searchKey,
            int schematicCount,
            int inventoryCount,
            int deficit
    ) {}

    private record MaterialSnapshot(
            List<MaterialNeed> needs,
            int totalDeficit,
            int scannedBlocks,
            MaterialNeed topNeed
    ) {
        private static MaterialSnapshot empty() {
            return new MaterialSnapshot(Collections.emptyList(), 0, 0, null);
        }
    }
}
