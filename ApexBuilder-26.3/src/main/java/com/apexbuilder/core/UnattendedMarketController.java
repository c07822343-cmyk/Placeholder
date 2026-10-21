package com.apexbuilder.core;

import baritone.api.BaritoneAPI;
import baritone.api.IBaritone;
import baritone.api.schematic.ISchematic;
import baritone.process.BuilderProcess;
import com.apexbuilder.mixin.BuilderProcessAccessor;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.screens.inventory.AbstractContainerScreen;
import net.minecraft.client.player.LocalPlayer;
import net.minecraft.core.BlockPos;
import net.minecraft.core.Vec3i;
import net.minecraft.network.chat.Component;
import net.minecraft.world.inventory.ClickType;
import net.minecraft.world.inventory.Slot;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import net.minecraft.world.level.block.Blocks;
import net.minecraft.world.level.block.state.BlockState;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class UnattendedMarketController {
    private static final int SCAN_INTERVAL = 20;
    private static final int PURCHASE_DELAY = 12;
    private static final int MAX_VISIBLE_CANDIDATES = 12;

    private static final Pattern PRICE =
            Pattern.compile("(?i)(?:\\$\\s*)?([0-9][0-9,]*(?:\\.[0-9]+)?)([kmb])?");

    private static boolean enabled = true;
    private static long ticks;
    private static long nextActionTick;
    private static State state = State.IDLE;
    private static Map<Item, Integer> required = new LinkedHashMap<>();
    private static Item targetItem;
    private static int targetRemaining;
    private static int preBuyTargetCount;
    private static int failedActions;
    private static String lastMessage = "";

    private enum State {
        IDLE,
        OPENING_AH,
        SCANNING,
        BUYING,
        CONFIRMING,
        WAITING_INVENTORY,
        RESUMING_BUILD
    }

    private UnattendedMarketController() {}

    public static void init() {
        enabled = true;
        reset();
    }

    public static void tick(Minecraft client) {
        ticks++;
        if (!enabled || client.player == null || client.level == null) return;

        if (ticks < nextActionTick) return;

        IBaritone baritone = primaryBaritone();
        if (baritone == null) return;
        if (!(baritone.getBuilderProcess() instanceof BuilderProcess builder) || !builder.isActive()) {
            if (state != State.IDLE) reset();
            return;
        }

        switch (state) {
            case IDLE -> {
                if (hasMissingMaterials(client, builder)) {
                    required = computeMissing(client, builder);
                    targetItem = chooseTarget(client.player);
                    if (targetItem == null) return;

                    targetRemaining = required.getOrDefault(targetItem, 0);
                    targetRemaining -= inventoryCount(client.player, targetItem);
                    if (targetRemaining <= 0) {
                        required.remove(targetItem);
                        return;
                    }

                    builder.pause();
                    client.player.connection.sendCommand("ah");
                    state = State.OPENING_AH;
                    say(client.player, "AH manager: searching for " + targetRemaining + "x " + targetItem);
                    nextActionTick = ticks + 15;
                }
            }

            case OPENING_AH -> {
                if (client.screen instanceof AbstractContainerScreen<?>) {
                    state = State.SCANNING;
                    nextActionTick = ticks + 5;
                } else {
                    client.player.connection.sendCommand("ah");
                    nextActionTick = ticks + 20;
                }
            }

            case SCANNING -> {
                if (!(client.screen instanceof AbstractContainerScreen<?> screen)) {
                    state = State.OPENING_AH;
                    nextActionTick = ticks + 10;
                    return;
                }

                Candidate best = findCheapestCandidate(screen, client.player, targetItem, targetRemaining);
                if (best == null) {
                    // Give the AH pagination/search UI a chance to settle.
                    if (++failedActions >= 10) {
                        say(client.player, "AH manager: no matching listing visible; returning to build for another retry.");
                        closeAndResume(client, baritone);
                        return;
                    }
                    state = State.SCANNING;
                    nextActionTick = ticks + SCAN_INTERVAL;
                    return;
                }

                failedActions = 0;
                preBuyTargetCount = inventoryCount(client.player, targetItem);
                clickSlot(client, screen, best.slot.index, ClickType.PICKUP);
                state = State.BUYING;
                nextActionTick = ticks + PURCHASE_DELAY;
                say(client.player, "AH manager: buying " + best.count + "x " + targetItem + " for " + money(best.total));
            }

            case BUYING, CONFIRMING -> {
                if (client.screen instanceof AbstractContainerScreen<?> screen) {
                    Slot confirm = findConfirmationSlot(screen);
                    if (confirm != null) {
                        clickSlot(client, screen, confirm.index, ClickType.PICKUP);
                        state = State.WAITING_INVENTORY;
                        nextActionTick = ticks + PURCHASE_DELAY;
                        return;
                    }
                }

                int now = inventoryCount(client.player, targetItem);
                if (now > preBuyTargetCount) {
                    targetRemaining = Math.max(0, targetRemaining - (now - preBuyTargetCount));
                    if (targetRemaining <= 0) {
                        state = State.RESUMING_BUILD;
                    } else {
                        state = State.SCANNING;
                    }
                    nextActionTick = ticks + 4;
                    return;
                }

                if (ticks % 20 == 0 && client.screen instanceof AbstractContainerScreen<?> screen) {
                    Candidate retry = findCheapestCandidate(screen, client.player, targetItem, targetRemaining);
                    if (retry != null) {
                        clickSlot(client, screen, retry.slot.index, ClickType.PICKUP);
                        nextActionTick = ticks + PURCHASE_DELAY;
                    } else {
                        state = State.SCANNING;
                        nextActionTick = ticks + SCAN_INTERVAL;
                    }
                }
            }

            case WAITING_INVENTORY -> {
                int now = inventoryCount(client.player, targetItem);
                if (now > preBuyTargetCount) {
                    targetRemaining = Math.max(0, targetRemaining - (now - preBuyTargetCount));
                    state = targetRemaining <= 0 ? State.RESUMING_BUILD : State.SCANNING;
                    nextActionTick = ticks + 4;
                } else {
                    state = State.CONFIRMING;
                    nextActionTick = ticks + 4;
                }
            }

            case RESUMING_BUILD -> {
                required = computeMissing(client, builder);
                targetItem = chooseTarget(client.player);
                if (targetItem == null) {
                    closeAndResume(client, baritone);
                    return;
                }

                targetRemaining = required.getOrDefault(targetItem, 0)
                        - inventoryCount(client.player, targetItem);

                if (targetRemaining > 0) {
                    state = State.OPENING_AH;
                    nextActionTick = ticks + 8;
                    return;
                }

                closeAndResume(client, baritone);
            }
        }
    }

    private static boolean hasMissingMaterials(Minecraft client, BuilderProcess builder) {
        Map<Item, Integer> missing = computeMissing(client, builder);
        return !missing.isEmpty();
    }

    private static Map<Item, Integer> computeMissing(Minecraft client, BuilderProcess builder) {
        Map<Item, Integer> counts = new HashMap<>();
        BuilderProcessAccessor accessor = (BuilderProcessAccessor) builder;
        ISchematic schematic = accessor.apexbuilder$getSchematic();
        Vec3i origin = accessor.apexbuilder$getOrigin();
        if (schematic == null || origin == null) return counts;

        for (int y = 0; y < schematic.heightY(); y++) {
            for (int z = 0; z < schematic.lengthZ(); z++) {
                for (int x = 0; x < schematic.widthX(); x++) {
                    BlockPos pos = new BlockPos(origin.getX() + x, origin.getY() + y, origin.getZ() + z);
                    BlockState current = client.level.getBlockState(pos);

                    try {
                        if (!schematic.inSchematic(x, y, z, current)) continue;

                        BlockState wanted = schematic.desiredState(
                                x, y, z, current, Collections.emptyList()
                        );

                        if (wanted == null || wanted.isAir()) continue;
                        if (current.equals(wanted)) continue;
                        if (wanted.getBlock() == Blocks.WATER || wanted.getBlock() == Blocks.LAVA) continue;

                        Item item = wanted.getBlock().asItem();
                        if (item == null) continue;
                        counts.merge(item, 1, Integer::sum);
                    } catch (Throwable ignored) {}
                }
            }
        }

        Iterator<Map.Entry<Item,Integer>> it = counts.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<Item,Integer> e = it.next();
            int remaining = e.getValue() - inventoryCount(client.player, e.getKey());
            if (remaining <= 0) it.remove();
            else e.setValue(remaining);
        }

        return counts;
    }

    private static Item chooseTarget(LocalPlayer player) {
        Item best = null;
        int bestAmount = 0;
        for (Map.Entry<Item,Integer> e : required.entrySet()) {
            int amount = e.getValue() - inventoryCount(player, e.getKey());
            if (amount > bestAmount) {
                bestAmount = amount;
                best = e.getKey();
            }
        }
        return best;
    }

    private static Candidate findCheapestCandidate(
            AbstractContainerScreen<?> screen,
            LocalPlayer player,
            Item wanted,
            int remaining) {

        List<Candidate> candidates = new ArrayList<>();

        for (Slot slot : screen.getMenu().slots) {
            ItemStack stack = slot.getItem();
            if (stack.isEmpty() || stack.getItem() != wanted) continue;

            double total = extractPrice(stack);
            if (total <= 0) continue;

            int count = Math.max(1, stack.getCount());
            int usable = Math.min(count, remaining);
            double effectiveTotal = total * (usable / (double) count);
            double unit = effectiveTotal / usable;

            candidates.add(new Candidate(slot, count, total, unit));
            if (candidates.size() >= MAX_VISIBLE_CANDIDATES) break;
        }

        return candidates.stream()
                .min(Comparator.comparingDouble(Candidate::unit))
                .orElse(null);
    }

    private static Slot findConfirmationSlot(AbstractContainerScreen<?> screen) {
        for (Slot slot : screen.getMenu().slots) {
            ItemStack stack = slot.getItem();
            if (stack.isEmpty()) continue;

            String name = stack.getHoverName().getString().toLowerCase(Locale.ROOT);
            String lore = stack.getTooltipLines(null).toString().toLowerCase(Locale.ROOT);

            if (containsAny(name, "buy", "purchase", "confirm", "accept", "yes", "✔")
                    || containsAny(lore, "buy", "purchase", "confirm", "accept")) {
                return slot;
            }
        }
        return null;
    }

    private static boolean containsAny(String value, String... terms) {
        for (String term : terms) if (value.contains(term)) return true;
        return false;
    }

    private static void clickSlot(Minecraft client, AbstractContainerScreen<?> screen, int slotId, ClickType clickType) {
        if (client.player == null || client.gameMode == null) return;
        client.gameMode.handleInventoryMouseClick(
                screen.getMenu().containerId,
                slotId,
                0,
                clickType,
                client.player
        );
    }

    private static int inventoryCount(LocalPlayer player, Item wanted) {
        int total = 0;
        for (int i = 0; i < player.getInventory().getContainerSize(); i++) {
            ItemStack stack = player.getInventory().getItem(i);
            if (!stack.isEmpty() && stack.is(wanted)) total += stack.getCount();
        }
        return total;
    }

    private static double extractPrice(ItemStack stack) {
        List<String> lines = new ArrayList<>();
        lines.add(stack.getHoverName().getString());
        stack.getTooltipLines(null).forEach(c -> lines.add(c.getString()));

        for (String line : lines) {
            Matcher matcher = PRICE.matcher(line.replaceAll("\\s+", " "));
            while (matcher.find()) {
                try {
                    double value = Double.parseDouble(matcher.group(1).replace(",", ""));
                    String suffix = matcher.group(2);
                    if (suffix != null) {
                        value *= switch (suffix.toLowerCase(Locale.ROOT)) {
                            case "k" -> 1_000D;
                            case "m" -> 1_000_000D;
                            case "b" -> 1_000_000_000D;
                            default -> 1D;
                        };
                    }
                    if (value > 0) return value;
                } catch (NumberFormatException ignored) {}
            }
        }
        return -1;
    }

    private static void closeAndResume(Minecraft client, IBaritone baritone) {
        if (client.screen != null) client.setScreen(null);
        if (baritone.getBuilderProcess() instanceof BuilderProcess builder) {
            builder.resume();
        }
        say(client.player, "AH manager: materials satisfied; build resumed.");
        reset();
    }

    private static void say(LocalPlayer player, String msg) {
        if (player == null || msg.equals(lastMessage)) return;
        lastMessage = msg;
        player.displayClientMessage(Component.literal("[ApexBuilder] " + msg), true);
    }

    private static String money(double value) {
        if (value >= 1_000_000_000) return String.format(Locale.US, "%.2fB", value / 1_000_000_000);
        if (value >= 1_000_000) return String.format(Locale.US, "%.2fM", value / 1_000_000);
        if (value >= 1_000) return String.format(Locale.US, "%.2fK", value / 1_000);
        return String.format(Locale.US, "%.2f", value);
    }

    public static void setEnabled(boolean value) {
        enabled = value;
        if (!enabled) reset();
    }

    public static boolean isEnabled() {
        return enabled;
    }

    public static String status() {
        return state.name() + " target=" + (targetItem == null ? "none" : targetItem.getDescriptionId())
                + " remaining=" + Math.max(0, targetRemaining);
    }

    private static void reset() {
        state = State.IDLE;
        required = new LinkedHashMap<>();
        targetItem = null;
        targetRemaining = 0;
        preBuyTargetCount = 0;
        failedActions = 0;
        nextActionTick = ticks + 5;
    }

    private record Candidate(Slot slot, int count, double total, double unit) {}
}
