package com.apexbuilder.mixin;

import baritone.process.BuilderProcess;
import baritone.api.schematic.ISchematic;
import net.minecraft.core.Vec3i;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.gen.Accessor;

@Mixin(value = BuilderProcess.class, remap = false)
public interface BuilderProcessAccessor {
    @Accessor(value = "schematic", remap = false)
    ISchematic apexbuilder$getSchematic();

    @Accessor(value = "origin", remap = false)
    Vec3i apexbuilder$getOrigin();
}
