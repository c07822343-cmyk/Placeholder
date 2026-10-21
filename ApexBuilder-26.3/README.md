# ApexBuilder 26.3

Client-side Fabric add-on that supervises Baritone's 26.3 builder.

Features:
- Water assist for schematic targets. It identifies pure-water targets, finds a legal adjacent support face, walks to it with Baritone, aims at the interaction face, and uses a real water bucket.
- Material report for the active schematic with /apex materials.
- Visible Auction House price scanner with /apex market scan <item> <amount>. It reports the cheapest visible listing per unit. Purchases remain manual.
- Status and toggles with /apex status and /apex water on|off.
- Failure cooldown so a bad liquid target is not hammered forever.

Requirements:
- Minecraft 26.3
- Fabric Loader 0.19.5+
- Java 25
- Fabric API 0.164.0+26.3
- Baritone 26.3 Fabric fork

This project is deliberately a companion add-on rather than a replacement Baritone jar.

The Baritone 26.3 fork is an unofficial work-in-progress port. Test in a single-player world first.

Server compatibility:
This code uses normal client interactions and does not add reach, packet spoofing, anti-cheat bypasses, or detection evasion. Check the rules of the server before using automation.
