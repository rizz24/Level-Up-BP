console.warn(' main.js loaded')

import { world, system, ItemStack } from "@minecraft/server"
import "./onjoin/index.js"
import { adminUsernames } from "./onjoin/index.js"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"

//global variables

let combatLVL = 0;
let combatXP = 0;
let combatlimitXP = 100;
let combatNextLVL = 100;
let combatRemain = 0;
let combatASC = 0;
let combatCanAscend = false;
let CombatAscended = false;
let CombatAscended2 = false;
let CombatAscended3 = false;
let CombatAscended4 = false;
let CombatAscended5 = false;

let lumberLVL = 0;
let lumberXP = 0;
let lumberlimitXP = 100;
let lumberNextLVL = 100;
let lumberRemain = 0;
let lumberASC = 0;
let lumberCanAscend = false;
let LumberAscended = false;
let LumberAscended2 = false;
let LumberAscended3 = false;
let LumberAscended4 = false;
let LumberAscended5 = false;

let miningLVL = 0;
let miningXP = 0;
let mininglimitXP = 100;
let miningNextLVL = 100;
let miningRemain = 0;
let miningASC = 0;
let minerCanAscend = false;
let MinerAscended = false;
let MinerAscended2 = false;
let MinerAscended3 = false;
let MinerAscended4 = false;
let MinerAscended5 = false;

let farmingLVL = 0;
let farmingXP = 0;
let farminglimitXP = 100;
let farmingNextLVL = 100;
let farmingRemain = 0;
let farmingASC = 0;
let farmerCanAscend = false;
let FarmerAscended = false;
let FarmerAscended2 = false;
let FarmerAscended3 = false;
let FarmerAscended4 = false;
let FarmerAscended5 = false;

let txtclr =  false;
let allXP = 0;
let nextXP = 0;

world.beforeEvents.itemUse.subscribe(data => {
    let player = data.source
    let title = "§l§aLeveling Orb"
    if (data.itemStack.typeId == "level_up:level_orb") system.run(() => main(player))
    
    function isAdmin(username) {
        return adminUsernames.includes(username);
    }

    function main() {

        if (isAdmin(player.name)) {
            const form = new ActionFormData()
                .title(title)
                .body(`§fWelcome §a${player.nameTag}§f!\nChoose a Option Below!`)
                .button(`§bProfile`)
                .button(`§bMoney`)
                .button(`§bShop`)
                .button(`ADMIN CONTROLS`)

            form.show(player).then(r => {
                if (r.selection == 0) Profile(player)
                if (r.selection == 1) Money(player)
                if (r.selection == 2) Shop(player)
                if (r.selection == 3) Admin(player)
            })

        } else {
            const form = new ActionFormData()
                .title(title)
                .body(`§fWelcome §a${player.nameTag}§f!\nChoose a Option Below!`)
                .button(`§bProfile`)
                .button(`§bMoney`)
                .button(`§bShop`)
            
            form.show(player).then(r => {
                if (r.selection == 0) Profile(player)
                if (r.selection == 1) Money(player)
                if (r.selection == 2) Shop(player)
            })
        }
    }

// - - - - - - - - - - - - - - - - - - - - - - - v ADMIN v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function Admin() {
        new ActionFormData()
            .title(`§l§bADMIN CONTROLS`)
            .button("§o§bCombat Profile")
            .button("§o§bLumber Profile")
            .button("§o§bMining Profile")
            .button("§o§bFarming Profile")
            .button(`§l§cBack`)
            .show(player).then(r => {
                if (r.selection == 0) main(player)
                if (r.selection == 1) main(player)
                if (r.selection == 2) main(player)
                if (r.selection == 3) main(player)
                if (r.selection == 4) main(player)
            })
    }

// - - - - - - - - - - - - - - - - - - - - - - - ^ ADMIN ^ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    function Profile() {
        new ActionFormData()
            .title(`§l§bProfile`)
            .button("§o§bCombat Profile")
            .button("§o§bLumber Profile")
            .button("§o§bMining Profile")
            .button("§o§bFarming Profile")
            .button(`§l§cBack`)
            .show(player).then(r => {
                if (r.selection == 0) combatP(player)
                if (r.selection == 1) lumberP(player)
                if (r.selection == 2) miningP(player)
                if (r.selection == 3) farmingP(player)
                if (r.selection == 4) main(player)
            })
    }

    function combatP() {
        let xp = combatXP
        let nxtLvl = combatNextLVL
        combatRemain = nxtLvl - xp

        if (combatCanAscend === !false) {
            new ActionFormData()
            .title(`§l§bCombat Profile`)
            .body(
                `§a  - - - - - - - - - - - - - - - - - - -\n\n`+
                `    §fCombat Level: `+ combatLVL +`\n\n`+
                `    Combat XP: §lFull§r§f\n` +
                `  \n          ( Ready for Ascension )\n\n`+
                `    Combat Ascension: `+ combatASC +`\n\n`+
                `§a  - - - - - - - - - - - - - - - - - - -\n\n\n`
                )
            .button("§l§cBack")
            .show(player).then(r => {
                if (r.selection == 0) Profile(player)
                if (r.selection == 1) Profile(player)
            })
        } else {
            new ActionFormData()
            .title(`§l§bCombat Profile`)
            .body(
                `§a  - - - - - - - - - - - - - - - - - - -\n\n`+
                `    §fCombat Level: `+ combatLVL +`\n\n`+
                `    Combat XP:\n       `+ combatXP +` / `+ combatNextLVL +
                `  \n      ( `+ combatRemain +`XP to go )\n\n`+
                `    Combat Ascension: `+ combatASC +`\n\n`+
                `§a  - - - - - - - - - - - - - - - - - - -\n\n\n`
                )
            .button("§l§cBack")
            .show(player).then(r => {
                if (r.selection == 0) Profile(player)
                if (r.selection == 1) Profile(player)
            })
        }
    }

    function lumberP() {
        let xp = lumberXP
        let nxtLvl = lumberNextLVL
        lumberRemain = nxtLvl - xp

        if (lumberCanAscend === !false) {
            new ActionFormData()
            .title(`§l§bLumber Profile`)
            .body(
                `§a  - - - - - - - - - - - - - - - - - - -\n\n`+
                `    §fLumber Level: `+ lumberLVL +`\n\n`+
                `    Lumber XP: §lFull§r§f\n` +
                `  \n          ( Ready for Ascension )\n\n`+
                `    Lumber Ascension: `+ lumberASC +`\n\n`+
                `§a  - - - - - - - - - - - - - - - - - - -\n\n\n`
                )
            .button("§l§cBack")
            .show(player).then(r => {
                if (r.selection == 0) Profile(player)
            })
        } else {
            new ActionFormData()
            .title(`§l§bLumber Profile`)
            .body(
                `§a  - - - - - - - - - - - - - - - - - - -\n\n`+
                `    §fLumber Level: `+ lumberLVL +`\n\n`+
                `    Lumber XP:\n       `+ lumberXP +` / `+ lumberNextLVL +
                `  \n      ( `+ lumberRemain +`XP to go )\n\n`+
                `    Lumber Ascension: `+ lumberASC +`\n\n`+
                `§a  - - - - - - - - - - - - - - - - - - -\n\n\n`
                )
            .button("§l§cBack")
            .show(player).then(r => {
                if (r.selection == 0) Profile(player)
            })
        }
    }

    function miningP() {
        let xp = miningXP
        let nxtLvl = miningNextLVL
        miningRemain = nxtLvl - xp

        if (minerCanAscend ===  !false) {
            new ActionFormData()
            .title(`§l§bMining Profile`)
            .body(
                `§a  - - - - - - - - - - - - - - - - - - -\n\n`+
                `    §fMining Level: `+ miningLVL +`\n\n`+
                `    Mining XP: §lFull§r§f\n` +
                `  \n          ( Ready for Ascension )\n\n`+
                `    Mining Ascension: `+ miningASC +`\n\n`+
                `§a  - - - - - - - - - - - - - - - - - - -\n\n\n`
                )
            .button("§l§cBack")
            .show(player).then(r => {
                if (r.selection == 0) Profile(player)
            })
        } else {
            new ActionFormData()
            .title(`§l§bMining Profile`)
            .body(
                `§a  - - - - - - - - - - - - - - - - - - -\n\n`+
                `    §fMining Level: `+ miningLVL +`\n\n`+
                `    Mining XP:\n       `+ miningXP +` / `+ miningNextLVL +
                `  \n      ( `+ miningRemain +`XP to go )\n\n`+
                `    Mining Ascension: `+ miningASC +`\n\n`+
                `§a  - - - - - - - - - - - - - - - - - - -\n\n\n`
                )
            .button("§l§cBack")
            .show(player).then(r => {
                if (r.selection == 0) Profile(player)
            })
        }
    }

    function farmingP() {
        let xp = farmingXP
        let nxtLvl = farmingNextLVL
        farmingRemain = nxtLvl - xp

        if (farmerCanAscend === !false) {
            new ActionFormData()
            .title(`§l§bFarming Profile`)
            .body(
                `§a  - - - - - - - - - - - - - - - - - - -\n\n`+
                `    §fFarming Level: `+ farmingLVL +`\n\n`+
                `    Farming XP: §lFull§r§f\n` +
                `  \n          ( Ready for Ascension )\n\n`+
                `    Farming Ascension: `+ farmingASC +`\n\n`+
                `§a  - - - - - - - - - - - - - - - - - - -\n\n\n`
                )
            .button("§l§cBack")
            .show(player).then(r => {
                if (r.selection == 0) Profile(player)
            })
        } else {
            new ActionFormData()
            .title(`§l§bFarming Profile`)
            .body(
                `§a  - - - - - - - - - - - - - - - - - - -\n\n`+
                `    §fFarming Level: `+ farmingLVL +`\n\n`+
                `    Farming XP:\n       `+ farmingXP +` / `+ farmingNextLVL +
                `  \n      ( `+ farmingRemain +`XP to go )\n\n`+
                `    Farming Ascension: `+ farmingASC +`\n\n`+
                `§a  - - - - - - - - - - - - - - - - - - -\n\n\n`
                )
            .button("§l§cBack")
            .show(player).then(r => {
                if (r.selection == 0) Profile(player)
            })
        }
    }

    const getScore = (objective, target, useZero = true) => {
        try {
            const obj = world.scoreboard.getObjective(objective);
            if (typeof target == 'string') {
                return obj.getScore(obj.getParticipants().find(v => v.displayName == target));
            }
            return obj.getScore(target.scoreboard);
        } catch {
            return useZero ? 0 : NaN;
        }
    }

    const Money = (player) => {
        const players = [...world.getPlayers()];
        new ModalFormData()
            .title(`§a§lMoney Transfer`)
            .dropdown('\n §o§5Choose Who To Send Money!', players.map(player => player.nameTag))
            .textField(`\n §uEnter The Amount Your Sending!\n§d Your current balance:\n §5$${getScore('Money', player.nameTag)}\n`, `§o              Only Use Numbers`)
            .show(player)
            .then(({ formValues: [dropdown, textField] }) => {
                const selectedPlayer = players[dropdown];

                if (selectedPlayer === player) {
                    player.runCommand(`tellraw @s {"rawtext":[{"text":"§cYou Can't Select Yourself"}]}`)
                    return;
                }
                if (textField.includes("-")) {
                    player.runCommand(`tellraw @s {"rawtext":[{"text":"§cOnly Use Numbers"}]}`)
                    return;
                }
                if (getScore('Money', player.nameTag) < textField) {
                    player.runCommand(`tellraw @s {"rawtext":[{"text":"§cYou Dont Have Enough Money"}]}`);
                    return;
                } try {
                    player.runCommand(`scoreboard players remove @s Money ${textField}`)
                    player.runCommand(`tellraw @s {"rawtext":[{"text":"§aSent §l${selectedPlayer.nameTag} §r§2$${textField}"}]}`)
                    selectedPlayer.runCommand(`tellraw @s {"rawtext":[{"text":"§l${player.nameTag} §r§aHas Given You §2$${textField}"}]}`);
                    selectedPlayer.runCommand(`scoreboard players add @s Money ${textField}`)
                } catch {
                    player.runCommand(`tellraw @s {"rawtext":[{"text":"§cOnly Use Numbers"}]}`)
                    return;
                }
            }).catch((e) => {
                // console.error(e, e.stack)
            });
    }//Change "Money" To Your Money Objective!
    
})

// - - - - - - - - - - - - - - - - - - - - - - - ^ Menu ^ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// - - - - - - - - - - - - - - - - - - - - - - - v Events v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - v Combat v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// world.afterEvents.entityHitEntity.subscribe((mcch) => {
//     const EPSILON = 0.0001;
//     const hitEntity = mcch.hitEntity;
//     if (hitEntity.typeId === `minecraft:zombie`) {

//         combatXP += 0.1;

//         system.runTimeout(() => {
//             hitEntity.runCommand(`title @p actionbar Combat +0.1XP`);
//         }, 0);

//         if (combatXP + EPSILON >= combatlimitXP) {
//             combatXP = combatXP - combatNextLVL;
//             combatLVL++;
//             combatNextLVL ++;
//             combatlimitXP ++;

//             system.runTimeout(() => {
//                 hitEntity.runCommand(`title @p title Combat Leveled up!`);
//             }, 0);
//         }

//     }
// });

world.afterEvents.entityDie.subscribe((mcch) => {
    const deadEntity = mcch.deadEntity;
    const killer = mcch.damageSource?.damagingEntity;

    if (!killer || killer.typeId !== "minecraft:player") return;

    function numgen(min, max, mean, stddev) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

        num = num * stddev + mean;

            return Math.max(min, Math.min(max, Math.round(num)));
    }

    if (
        deadEntity.typeId === `minecraft:magma_cube` ||
        deadEntity.typeId === `minecraft:slime`
    ) {
        const randomXP = numgen(3, 5, 4, 1); //min, max, mean, stddev

        combatXP += randomXP;

        txtclr = !txtclr;
        const color = txtclr ? "§e" : "§f";
        system.runTimeout(() => {
            deadEntity.runCommand(`title @p actionbar ${color}Combat +${randomXP}XP`);
        }, 0);

        while (combatXP >= combatlimitXP) {
            combatXP = combatXP - combatNextLVL;
            combatLVL++;
            combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
            combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));
            system.runTimeout(() => {
                deadEntity.runCommand(`title @p title Combat Leveled up!`);
            }, 0);

            if (combatLVL >= 20) {
                for (let i = 0; i <= 5; i++) {
                    const key = i === 0 ? "CombatAscended" : `CombatAscended${i}`;
                    if (!globalThis[key]) {
                        system.runTimeout(() => {
                            killer.runCommand(`title @p title Combat Ascension Ready!`);
                        }, 60);
                        return;
                    }
                }
            }
        }
    }

    if (
        deadEntity.typeId === `minecraft:creeper` ||
        deadEntity.typeId === `minecraft:endermite` ||
        deadEntity.typeId === `minecraft:phantom` ||
        deadEntity.typeId === `minecraft:silverfish` ||
        deadEntity.typeId === `minecraft:skeleton` ||
        deadEntity.typeId === `minecraft:spider` ||
        deadEntity.typeId === `minecraft:cave_spider` ||
        deadEntity.typeId === `minecraft:zombie` ||
        deadEntity.typeId === `minecraft:zombie_villager`
    ) {

        const randomXP = numgen(15, 20, 17, 2); //min, max, mean, stddev

        combatXP += randomXP;

        txtclr = !txtclr;
        const color = txtclr ? "§e" : "§f";
        system.runTimeout(() => {
            deadEntity.runCommand(`title @p actionbar ${color}Combat +${randomXP}XP`);
        }, 0);

        while (combatXP >= combatlimitXP) {
            combatXP = combatXP - combatNextLVL;
            combatLVL++;
            combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
            combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));
            system.runTimeout(() => {
                deadEntity.runCommand(`title @p title Combat Leveled up!`);
            }, 0);

            if (combatLVL >= 20) {
                for (let i = 1; i <= 5; i++) {
                    let ascended = false;
                    switch (i) {
                        case 1: ascended = CombatAscended; break;
                        case 2: ascended = CombatAscended2; break;
                        case 3: ascended = CombatAscended3; break;
                        case 4: ascended = CombatAscended4; break;
                        case 5: ascended = CombatAscended5; break;
                    }

                    combatCanAscend = true;

                    if (!ascended) {
                        system.runTimeout(() => {
                            killer.runCommand(`title @p title Combat Ascension Ready!`);
                            killer.runCommand(`say Checking ascension stage ${i}`);
                        }, 100);
                        return;
                    }
                }
            }
        }
    }

// - - - - - - - - - - - - - - - - - - - - - - - v Combat v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


    if (
        deadEntity.typeId === `minecraft:blaze` ||
        deadEntity.typeId === `minecraft:bogged` ||
        deadEntity.typeId === `minecraft:breeze` ||
        deadEntity.typeId === `minecraft:creaking` ||
        deadEntity.typeId === `minecraft:husk` ||
        deadEntity.typeId === `minecraft:enderman` ||
        deadEntity.typeId === `minecraft:shulker` ||
        deadEntity.typeId === `minecraft:stray` ||
        deadEntity.typeId === `minecraft:witch`
    ) {
        const randomXP = numgen(60, 70, 65, 3); //min, max, mean, stddev

        combatXP += randomXP;

        txtclr = !txtclr;
        const color = txtclr ? "§e" : "§f";
        system.runTimeout(() => {
            deadEntity.runCommand(`title @p actionbar ${color}Combat +${randomXP}XP`);
        }, 0);

        while (combatXP >= combatlimitXP) {
            combatXP = combatXP - combatNextLVL;
            combatLVL++;
            combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
            combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));
            system.runTimeout(() => {
                deadEntity.runCommand(`title @p title Combat Leveled up!`);
            }, 0);

            if (combatLVL >= 20) {
                for (let i = 0; i <= 5; i++) {
                    const key = i === 0 ? "CombatAscended" : `CombatAscended${i}`;
                    if (!globalThis[key]) {
                        system.runTimeout(() => {
                            killer.runCommand(`title @p title Combat Ascension Ready!`);
                        }, 60);
                        return;
                    }
                }
            }
        }
    }

// - - - - - - - - - - - - - - - - - - - - - - - v Combat v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


    if (
        deadEntity.typeId === `minecraft:ghast` ||
        deadEntity.typeId === `minecraft:hoglin` ||
        deadEntity.typeId === `minecraft:piglin` ||
        deadEntity.typeId === `minecraft:pillager` ||
        deadEntity.typeId === `minecraft:vex` ||
        deadEntity.typeId === `minecraft:zoglin` ||
        deadEntity.typeId === `minecraft:zombie_pigman`
    ) {
        const randomXP = numgen(130, 150, 140, 7); //min, max, mean, stddev

        combatXP += randomXP;

        txtclr = !txtclr;
        const color = txtclr ? "§e" : "§f";
        system.runTimeout(() => {
            deadEntity.runCommand(`title @p actionbar ${color}Combat +${randomXP}XP`);
        }, 0);

        while (combatXP >= combatlimitXP) {
            combatXP = combatXP - combatNextLVL;
            combatLVL++;
            combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
            combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));
            system.runTimeout(() => {
                deadEntity.runCommand(`title @p title Combat Leveled up!`);
            }, 0);

            if (combatLVL >= 20) {
                for (let i = 0; i <= 5; i++) {
                    const key = i === 0 ? "CombatAscended" : `CombatAscended${i}`;
                    if (!globalThis[key]) {
                        system.runTimeout(() => {
                            killer.runCommand(`title @p title Combat Ascension Ready!`);
                        }, 60);
                        return;
                    }
                }
            }
        }
    }

// - - - - - - - - - - - - - - - - - - - - - - - v Combat v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


    if (
        deadEntity.typeId === `minecraft:elder_guardian` ||
        deadEntity.typeId === `minecraft:guardian` ||
        deadEntity.typeId === `minecraft:evocation_illager` ||
        deadEntity.typeId === `minecraft:piglin_brute` ||
        deadEntity.typeId === `minecraft:ravager` ||
        deadEntity.typeId === `minecraft:vindicator` ||
        deadEntity.typeId === `minecraft:wither_skeleton`
    ) {
        const randomXP = numgen(220, 250, 235, 15); //min, max, mean, stddev
        
        combatXP += randomXP;

        txtclr = !txtclr;
        const color = txtclr ? "§e" : "§f";
        system.runTimeout(() => {
            deadEntity.runCommand(`title @p actionbar ${color}Combat +${randomXP}XP`);
        }, 0);

        while (combatXP >= combatlimitXP) {
            combatXP = combatXP - combatNextLVL;
            combatLVL++;
            combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
            combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));
            system.runTimeout(() => {
                deadEntity.runCommand(`title @p title Combat Leveled up!`);
            }, 0);

            if (combatLVL >= 20) {
                for (let i = 0; i <= 5; i++) {
                    const key = i === 0 ? "CombatAscended" : `CombatAscended${i}`;
                    if (!globalThis[key]) {
                        system.runTimeout(() => {
                            killer.runCommand(`title @p title Combat Ascension Ready!`);
                        }, 60);
                        return;
                    }
                }
            }
        }
    }

// - - - - - - - - - - - - - - - - - - - - - - - v Combat v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


    if (
        deadEntity.typeId === `minecraft:wither`
    ) {

        combatXP += 1000;

        txtclr = !txtclr;
        const color = txtclr ? "§e" : "§f";
        system.runTimeout(() => {
            deadEntity.runCommand(`title @p actionbar ${color}Combat +1,000XP`);
        }, 0);

        while (combatXP >= combatlimitXP) {
            combatXP = combatXP - combatNextLVL;
            combatLVL++;
            combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
            combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));
            system.runTimeout(() => {
                deadEntity.runCommand(`title @p title Combat Leveled up!`);
            }, 0);

            if (combatLVL >= 20) {
                for (let i = 0; i <= 5; i++) {
                    const key = i === 0 ? "CombatAscended" : `CombatAscended${i}`;
                    if (!globalThis[key]) {
                        system.runTimeout(() => {
                            killer.runCommand(`title @p title Combat Ascension Ready!`);
                        }, 60);
                        return;
                    }
                }
            }
        }
    }

// - - - - - - - - - - - - - - - - - - - - - - - v Combat v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


    if (
        deadEntity.typeId === `minecraft:warden`
    ) {

        combatXP += 5000;

        txtclr = !txtclr;
        const color = txtclr ? "§e" : "§f";
        system.runTimeout(() => {
            deadEntity.runCommand(`title @p actionbar ${color}Combat +5,000XP`);
        }, 0);

        while (combatXP >= combatlimitXP) {
            combatXP = combatXP - combatNextLVL;
            combatLVL++;
            combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
            combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));
            system.runTimeout(() => {
                deadEntity.runCommand(`title @p title Combat Leveled up!`);
            }, 0);

            if (combatLVL >= 20) {
                for (let i = 0; i <= 5; i++) {
                    const key = i === 0 ? "CombatAscended" : `CombatAscended${i}`;
                    if (!globalThis[key]) {
                        system.runTimeout(() => {
                            killer.runCommand(`title @p title Combat Ascension Ready!`);
                        }, 60);
                        return;
                    }
                }
            }
        }
    }

// - - - - - - - - - - - - - - - - - - - - - - - v Combat v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    if (
        deadEntity.typeId === `minecraft:ender_dragon`
    ) {

        combatXP += 50000;

        txtclr = !txtclr;
        const color = txtclr ? "§e" : "§f";
        system.runTimeout(() => {
            deadEntity.runCommand(`title @p actionbar ${color}Combat +50,000XP`);
        }, 0);

        while (combatXP >= combatlimitXP) {
            combatXP = combatXP - combatNextLVL;
            combatLVL++;
            combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
            combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));
            system.runTimeout(() => {
                deadEntity.runCommand(`title @p title Combat Leveled up!`);
            }, 0);

            if (combatLVL >= 20) {
                for (let i = 0; i <= 5; i++) {
                    const key = i === 0 ? "CombatAscended" : `CombatAscended${i}`;
                    if (!globalThis[key]) {
                        system.runTimeout(() => {
                            killer.runCommand(`title @p title Combat Ascension Ready!`);
                        }, 60);
                        return;
                    }
                }
            }
        }
    }

});

// - - - - - - - - - - - - - - - - - - - - - - - ^ Combat ^ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

const placedBlocks = new Set();
const confirmedPistons = new Set();

function getBlockKey(block) {
    return `${block.location.x},${block.location.y},${block.location.z},${block.dimension.id}`;
}

world.afterEvents.playerPlaceBlock.subscribe(event => {
    const block = event.block;
    const player = event.player;
    const key = `${block.location.x},${block.location.y},${block.location.z},${block.dimension.id}`;

    if (
        block.typeId === `minecraft:acacia_log` ||
        block.typeId === `minecraft:birch_log` ||
        block.typeId === `minecraft:cherry_log` ||
        block.typeId === `minecraft:dark_oak_log` ||
        block.typeId === `minecraft:jungle_log` ||
        block.typeId === `minecraft:mangrove_log` ||
        block.typeId === `minecraft:oak_log` ||
        block.typeId === `minecraft:pale_oak_log` ||
        block.typeId === `minecraft:spruce_log` ||
        block.typeId === `minecraft:crimson_stem` ||
        block.typeId === `minecraft:warped_stem` ||

        block.typeId === `minecraft:coal_ore` ||
        block.typeId === `minecraft:copper_ore` ||
        block.typeId === `minecraft:deepslate_coal_ore` ||
        block.typeId === `minecraft:deepslate_copper_ore` ||
        block.typeId === `minecraft:deepslate_diamond_ore` ||
        block.typeId === `minecraft:deepslate_emerald_ore` ||
        block.typeId === `minecraft:deepslate_gold_ore` ||
        block.typeId === `minecraft:deepslate_iron_ore` ||
        block.typeId === `minecraft:deepslate_lapis_ore` ||
        block.typeId === `minecraft:deepslate_redstone_ore` ||
        block.typeId === `minecraft:diamond_ore` ||
        block.typeId === `minecraft:emerald_ore` ||
        block.typeId === `minecraft:gold_ore` ||
        block.typeId === `minecraft:iron_ore` ||
        block.typeId === `minecraft:lapis_ore` ||
        block.typeId === `minecraft:nether_gold_ore` ||
        block.typeId === `minecraft:quartz_ore` ||
        block.typeId === `minecraft:redstone_ore` ||

        block.typeId === `minecraft:melon_block` ||
        block.typeId === `minecraft:pumpkin` ||
        block.typeId === `minecraft:carved_pumpkin`
    ) {
        const key = getBlockKey(block);
        placedBlocks.add(key);
    }

    // Target pistons
    if (
        block.typeId === "minecraft:piston" ||
        block.typeId === "minecraft:sticky_piston"
    ) {
        // Check if already confirmed (shouldn't happen twice, but just in case)
        if (confirmedPistons.has(key)) return;

        // Show warning form
        const form = new ActionFormData()
            .title("Warning: Exploit Risk")
            .body("\n This block is partially disabled.\n\n Reason: Exploitation\n\n\n\n\n Do you wish to keep it?\n")
            .button("Yes, I Understand.\n(The block will remain placed)")
            .button("Sorry, I didn't mean to use it!\n(The block will be taken from you)");

        form.show(player).then(response => {
            const inventory = player.getComponent("minecraft:inventory").container;
            const itemList = [
                new ItemStack("minecraft:oak_planks", 3),
                new ItemStack("minecraft:cobblestone", 4),
                new ItemStack("minecraft:redstone", 1),
                new ItemStack("minecraft:iron_ingot", 1),
            ];
            if (response.canceled) {
                // If player closed the form, remove the piston
                block.setType("minecraft:air");
                for (const item of itemList) {
                    inventory.addItem(item);
                }
                return;
            }

            if (response.selection === 0) {
                // Player clicked "Understood"
                confirmedPistons.add(key);
            } else {
                // Player clicked "I made an error"
                block.setType("minecraft:air");
                for (const item of itemList) {
                    inventory.addItem(item);
                }
            }
        }).catch(err => {
            // Fallback: if anything goes wrong, remove piston
            block.setType("minecraft:air");
            for (const item of itemList) {
                inventory.addItem(item);
            }
        });
    }

});

// - - - - - - - - - - - - - - - - - - - - - - - v Lumber v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

world.beforeEvents.playerBreakBlock.subscribe((mcch) => {
    const block = mcch.block;
    const player = mcch.player;
    const key = getBlockKey(block);

    // console.warn("Block broken: " + block.typeId);

    if (block.typeId === `minecraft:acacia_log` ||
        block.typeId === `minecraft:birch_log` ||
        block.typeId === `minecraft:cherry_log` ||
        block.typeId === `minecraft:dark_oak_log` ||
        block.typeId === `minecraft:jungle_log` ||
        block.typeId === `minecraft:mangrove_log` ||
        block.typeId === `minecraft:oak_log` ||
        block.typeId === `minecraft:pale_oak_log` ||
        block.typeId === `minecraft:spruce_log` ||
        block.typeId === `minecraft:crimson_stem` ||
        block.typeId === `minecraft:warped_stem` 
    ) {
        if (placedBlocks.has(key)) {
            placedBlocks.delete(key);
            return;
        }

        lumberXP += 10;
        txtclr = !txtclr;
        const color = txtclr ? "§e" : "§f";
        system.runTimeout(() => {
            player.runCommand(`title @p actionbar ${color}Lumber +10XP`);
        }, 0);

        while (lumberXP >= lumberlimitXP) {
            lumberLVL = lumberXP - lumberNextLVL;
            lumberXP = 0;
            lumberNextLVL =+ Math.round(Math.pow(lumberNextLVL, 0.75));
            lumberlimitXP =+ Math.round(Math.pow(lumberlimitXP, 0.75));
            system.runTimeout(() => {
                player.runCommand(`title @p title Lumber Leveled up!`);
            }, 0);

            if (lumberXP >= 20 && !ascended) {
                system.runTimeout(() => {
                    player.runCommand(`title @p title Lumber Ascension Ready!`);
                }, 60);
                return;
            }
        }
    }

// - - - - - - - - - - - - - - - - - - - - - - - ^ Lumber ^ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - v Mining v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    if (block.typeId === `minecraft:coal_ore` ||
        block.typeId === `minecraft:copper_ore` ||
        block.typeId === `minecraft:deepslate_coal_ore` ||
        block.typeId === `minecraft:deepslate_copper_ore` ||
        block.typeId === `minecraft:deepslate_diamond_ore` ||
        block.typeId === `minecraft:deepslate_emerald_ore` ||
        block.typeId === `minecraft:deepslate_gold_ore` ||
        block.typeId === `minecraft:deepslate_iron_ore` ||
        block.typeId === `minecraft:deepslate_lapis_ore` ||
        block.typeId === `minecraft:deepslate_redstone_ore` ||
        block.typeId === `minecraft:diamond_ore` ||
        block.typeId === `minecraft:emerald_ore` ||
        block.typeId === `minecraft:gold_ore` ||
        block.typeId === `minecraft:iron_ore` ||
        block.typeId === `minecraft:lapis_ore` ||
        block.typeId === `minecraft:nether_gold_ore` ||
        block.typeId === `minecraft:quartz_ore` ||
        block.typeId === `minecraft:redstone_ore`
    ) {
        if (placedBlocks.has(key)) {
            placedBlocks.delete(key);
            return;
        }

        miningXP += 10;
        txtclr = !txtclr;
        const color = txtclr ? "§e" : "§f";
        system.runTimeout(() => {
            player.runCommand(`title @p actionbar ${color}Mining +10XP`);
        }, 0);

        while (miningXP >= mininglimitXP) {
            miningLVL = miningXP - miningNextLVL;
            miningXP = 0;
            miningNextLVL =+ Math.round(Math.pow(miningNextLVL, 0.75));
            mininglimitXP =+ Math.round(Math.pow(mininglimitXP, 0.75));
            system.runTimeout(() => {
                player.runCommand(`title @p title Mining Leveled up!`);
            }, 0);
        }
    }

// - - - - - - - - - - - - - - - - - - - - - - - ^ Mining ^ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - v Farming Blocks v - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


    if (block.typeId === `minecraft:melon_block` ||
        block.typeId === `minecraft:pumpkin` ||
        block.typeId === `minecraft:carved_pumpkin`
    ) {
        if (placedBlocks.has(key)) {
            placedBlocks.delete(key);
            return;
        }

        farmingXP += 10;
        txtclr = !txtclr;
        const color = txtclr ? "§e" : "§f";
        system.runTimeout(() => {
            player.runCommand(`title @p actionbar ${color}Farming +10XP`);
        }, 0);

        while (farmingXP >= farminglimitXP) {
            farmingLVL = farmingXP - farmingNextLVL;
            farmingXP = 0;
            farmingNextLVL =+ Math.round(Math.pow(farmingNextLVL, 0.75));
            farminglimitXP =+ Math.round(Math.pow(farminglimitXP, 0.75));
            system.runTimeout(() => {
            player.runCommand(`title @p title Farming Leveled up!`);
            }, 0);
        }
    }

// - - - - - - - - - - - - - - - - - - - - - - - v Farming v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    const cropTypes = [
    "minecraft:wheat",
    "minecraft:carrots",
    "minecraft:potatoes",
    "minecraft:beetroot"
    ];

    // const fullGrowthCrops = [
    // "minecraft:wheat",
    // "minecraft:carrots",
    // "minecraft:potatoes",
    // "minecraft:beetroot"
    // ];

    // const beetrootCrop = "minecraft:beetroot";

    if (!cropTypes.includes(block.typeId)) return;
    // if (![...fullGrowthCrops, beetrootCrop].includes(block.typeId)) return;

    try {
        
        // const states = block.permutation.getAllStates();
        // const age = states.growth ?? -1;

        // console.warn("Block broken: " + block.typeId);
        // console.warn(`Block permutation: {"type":"` + block.permutation.type.id + `","states":{"growth":` + age +`}}`);
        // console.warn("States: " + JSON.stringify(states));

        // let maxGrowth = 7; // default max growth for wheat, carrot, potato

        // if (block.typeId === beetrootCrop) {
        //     maxGrowth = 3; // beetroot max growth stage
        // }

        if (age === 7) {
            farmingXP += 10;
            txtclr = !txtclr;
            const color = txtclr ? "§e" : "§f";
            system.runTimeout(() => {
                player.runCommand(`title @p actionbar ${color}Farming +10XP`);
            }, 0);

            while (farmingXP >= farminglimitXP) {
                farmingLVL = farmingXP - farmingNextLVL;
                farmingXP = 0;
                farmingNextLVL =+ Math.round(Math.pow(farmingNextLVL, 0.75));
                farminglimitXP =+ Math.round(Math.pow(farminglimitXP, 0.75));
                system.runTimeout(() => {
                player.runCommand(`title @p title Farming Leveled up!`);
                }, 0);
            }

        } else {
            // player.runCommand(`say This wheat is not fully grown (age: ${age}).`);
            // player.sendMessage(`!! This wheat is not fully grown (age: ${age}).`);
        }
    } catch (err) {
        // world.sendMessage("❌ Could not check crop age.");
        console.warn("Error checking block state:", err);
    }

});
// - - - - - - - - - - - - - - - - - - - - - - - ^ Farming ^ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// - - - - - - - - - - - - - - - - - - - - - - v Chat CMDs v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

world.beforeEvents.chatSend.subscribe((mcch) => {
    let player = mcch.sender;
    let message = mcch.message.toLowerCase();

// - - - - - - - - - - - - - - - - - - - - - - - v Rank CMD v - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // if (message === `rank`) {
    //     system.runTimeout(() => {
    //         player.runCommand(`tag @s add "openmenu:main"`);
    //     }, 0);
    // }

    // function isAdmin(username) {
    //     return adminUsernames.includes(username);
    // }

    // function main() {

    //     if (isAdmin(player.name)) {
    //         const form = new ActionFormData()
    //             .title(`ADMIN CONTROLS`)
    //             .body(`§fWelcome §a${player.nameTag}§f!\nChoose a Option Below!`)
    //             .button(`§bProfile`)
    //             .button(`§bMoney`)
    //             .button(`§bShop`)
    //             .button(`ADMIN CONTROLS`)

    //         form.show(player).then(r => {
    //             if (r.selection == 0) Profile(player)
    //             if (r.selection == 1) Money(player)
    //             if (r.selection == 2) Shop(player)
    //             if (r.selection == 3) Admin(player)
    //         })

    //     } else {
    //         const form = new ActionFormData()
    //             .title(title)
    //             .body(`§fWelcome §a${player.nameTag}§f!\nChoose a Option Below!`)
    //             .button(`§bProfile`)
    //             .button(`§bMoney`)
    //             .button(`§bShop`)
            
    //         form.show(player).then(r => {
    //             if (r.selection == 0) Profile(player)
    //             if (r.selection == 1) Money(player)
    //             if (r.selection == 2) Shop(player)
    //         })
    //     }
    // }

    // system.runInterval(() => {
    // for (let player of world .getPlayers()) {
    //     if (player.hasTag("openmenu:main")) {
    //         system.run(() => {
    //             main();
    //             player.runCommand(`tag @s remove "openmenu:main"`);
    //         });
    //     }
    // }
    // }, 20);

// - - - - - - - - - - - - - - - - - - - - - - - ^ Rank CMD ^ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    if (message === `help`) {
        mcch.cancel = true;
        system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
                `\n§a- - - - - - - - - - - §fHelp (1) §a- - - - - - - - - - - -\n`+
                `§f r!help - shows this help\n`+
                `§f r!start - gives you the RPG Menu Book\n`+
                `§f r!bal - shows overall leaderboard\n\n`+
                `"}]}`);
        }, 0);
    }

    if (message === `start`) {
        mcch.cancel = true;
        system.runTimeout(() => {
        if (player.hasTag("has_started")) {
            player.sendMessage("You already did that. Sorry.");
        } else {
            const item = new ItemStack("level_up:level_orb", 1);
            const inventory = player.getComponent("minecraft:inventory").container;
            inventory.addItem(item);
            player.addTag("has_started");
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
            `Welcome ${player.nameTag}! Type 'r!help' for guide!`+
            `"}]}`);
        }
        }, 0);
    }
    
    const getScore = (objective, target, useZero = true) => {
        try {
            const obj = world.scoreboard.getObjective(objective);
            if (typeof target == 'string') {
                return obj.getScore(obj.getParticipants().find(v => v.displayName == target));
            }
            return obj.getScore(target.scoreboard);
        } catch {
            return useZero ? 0 : NaN;
        }
    }

    if (message === `bal`) {
        mcch.cancel = true;
        system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
                `Your current money balance is $${getScore('Money', player.nameTag)}`+
                `"}]}`);
        }, 0);
    }

    if (message === `1`) {
        combatXP = combatXP + combatNextLVL;
        nextXP = combatXP;
        allXP += nextXP;
        while (combatXP >= combatlimitXP) {
        combatXP = combatXP - combatNextLVL;
        combatLVL++;
        combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
        combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));
        }
        mcch.cancel = true;
        system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
                `+1 CombatLevel (${combatLVL})\nAll XP: ${allXP}\nNext Level XP: ${combatNextLVL}\n\n`+
                `"}]}`);
        }, 0);
    }

    if (message === `full`) {
        combatXP = 22875;

        if (combatLVL >= 20 && !ascended) {
        system.runTimeout(() => {
            deadEntity.runCommand(`title @p actionbar §cCombat Level Cap Reached! Ascend to continue.`);
        }, 0);
        return; // stop further XP processing
    }

        allXP = combatXP;
        while (combatXP >= combatlimitXP) {
        combatXP = combatXP - combatNextLVL;
        combatLVL++;
        combatNextLVL += Math.round(Math.pow(combatNextLVL, 0.75));
        combatlimitXP += Math.round(Math.pow(combatlimitXP, 0.75));
        }
        mcch.cancel = true;
        system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
                `+1 CombatLevel (${combatLVL})\nAll XP: ${allXP}\nNext Level XP: ${combatNextLVL}\n\n`+
                `"}]}`);
        }, 0);
    }

    if (message === `up`) {
        mcch.cancel = true;

        combatASC++;
        switch (combatASC) {
            case 1:
                CombatAscended = true;
                break;
            case 2:
                CombatAscended2 = true;
                break;
            case 3:
                CombatAscended3 = true;
                break;
            case 4:
                CombatAscended4 = true;
                break;
            case 5:
                CombatAscended5 = true;
                break;
        }

        combatLVL = 0;
        combatXP = 0;
        combatlimitXP = 100;
        combatNextLVL = 100;
        combatRemain = 0;

        system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
                `Added 1 to Combat Ascension`+
                `"}]}`);
        }, 0);

        combatCanAscend = false;
    }

    if (message === `asc`) {
        mcch.cancel = true;
        if (CombatAscended === !false) {
            system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
                `\n1 = true`+
                `"}]}`);
            }, 0);
        } else {
            system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
                `\n1 = false`+
                `"}]}`);
            }, 0);
        }

        if (CombatAscended2 === !false) {
            system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
                `2 = true`+
                `"}]}`);
            }, 0);
        } else {
            system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
                `2 = false`+
                `"}]}`);
            }, 0);
        }

        if (CombatAscended3 === !false) {
            system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
                `3 = true`+
                `"}]}`);
            }, 0);
        } else {
            system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
                `3 = false`+
                `"}]}`);
            }, 0);
        }

        if (CombatAscended4 === !false) {
            system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
                `4 = true`+
                `"}]}`);
            }, 0);
        } else {
            system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
                `4 = false`+
                `"}]}`);
            }, 0);
        }

        if (CombatAscended5 === !false) {
            system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
                `5 = true`+
                `"}]}`);
            }, 0);
        } else {
            system.runTimeout(() => {
            player.runCommand(`tellraw @s {"rawtext":[{"text":"`+
                `5 = false`+
                `"}]}`);
            }, 0);
        }
    }

    // if (message === `lb`) {
    //     mcch.cancel = true;
    //     system.runTimeout(() => {
    //         player.runCommand(`tellraw @p {"rawtext":[{"text":"`+
    //             `\n§a- - - - - - - - - §fLeaderboard §a- - - - - - - - - - -\n`+
    //             `§f|   Rank   |             Name              |        Level      |\n`+
    //             `§a- - - - - - - - - - - - - - - - - - - - - - - - - - -\n`+
    //             `§f|    01    |             Name              |        Level      |\n`+
    //             `§f|    02    |             Name              |        Level      |\n`+
    //             `§f|    03    |             Name              |        Level      |\n`+
    //             `§f|    04    |             Name              |        Level      |\n`+
    //             `§f|    05    |             Name              |        Level      |\n`+
    //             `§a- - - - - - - - - - - - - - - - - - - - - - - - - - -\n\n`+
    //             `"}]}`);
    //     }, 0);
    // }

    // if (message === `rpg cp`) {
    //     system.runTimeout(() => {
    //         player.runCommand(`tellraw @p {"rawtext":[{"text":"`+
    //             `§a- - - - - - - - - - - - - - - - - - -\n`+
    //             `    §fCombat Level: `+ combatLVL +`\n`+
    //             `    Combat XP: `+ combatXP +`\n`+
    //             `    Combat Ascension: `+ combatASC +`\n`+
    //             `§a- - - - - - - - - - - - - - - - - - -\n`+
    //             `"}]}`);
    //     }, 0);
    // }

});