package com.apexbuilder.mixin;

import baritone.process.BuilderProcess;
import baritone.api.schematic.ISchematic;
import net.minecraft.core.Vec3i;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.gen.Accessor;

@Mixin(BuilderProcess.class)
public interface BuilderProcessAccessor {
    @Accessor("schematic")
    ISchematic apexbuilder$getSchematic();

    @Accessor("origin")
    Vec3i apexbuilder$getOrigin();
}
