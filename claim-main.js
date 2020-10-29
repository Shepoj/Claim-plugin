// Useful stuff

var ItemStack = org.bukkit.inventory.ItemStack, Material = org.bukkit.Material;
var ChatColor = org.bukkit.ChatColor;
var events = require('../lib/events-helper-bukkit');

var spawn = [server.getWorlds()[0].getSpawnLocation().getX(), server.getWorlds()[0].getSpawnLocation().getY(), server.getWorlds()[0].getSpawnLocation().getZ()];
var claimRadius = 8, spawnRadius = 12, BFRadius = 100;
var BFcd = 30000, BOOKcd = 120000;
var spawnProtection = true;

var BFcooldowns = {}, tracking = {}, BOOKcooldowns = {};  // Dynamic data



// Data loading / saving

var teams = scload('claim-data/teams.json'), players = scload('claim-data/players.json'), isReloaded = true;

function reload(){
    if (!isReloaded){
        teams = scload('claim-data/teams.json');
        players = scload('claim-data/players.json');
        isReloaded = true;
    }
}

function save(){
    scsave(teams, 'claim-data/teams.json');
    scsave(players, 'claim-data/players.json');
    isReloaded = false;
}



// Recipes

var addRecipe = require('claim-module').addRecipe;

// Green dye
addRecipe(new ItemStack(Material.INK_SACK, 2, 2), ['ab'], {a: new org.bukkit.material.Dye(org.bukkit.DyeColor.BLUE), b: new org.bukkit.material.Dye(org.bukkit.DyeColor.YELLOW)});

// Slime ball
addRecipe(new ItemStack(Material.SLIME_BALL, 1), ['a', 'a'], {a: Material.GOLD_INGOT});

// Ender portal frame
addRecipe(new ItemStack(Material.ENDER_PORTAL_FRAME, 1), ['aaa', 'bcb', 'bbb'], {a: Material.FIREBALL, b: Material.OBSIDIAN, c: Material.ENDER_PEARL});

// Explosive arrow
(function(){
    var expArrow = new ItemStack(Material.SPECTRAL_ARROW, 1);
    var meta = expArrow.getItemMeta();

    meta.setDisplayName(ChatColor.GOLD + 'Explosive arrow');
    expArrow.setItemMeta(meta);
    addRecipe(expArrow, ['a', 'b', 'c'], {a: Material.DIAMOND, b: Material.STICK, c: Material.FEATHER});
})();

// Base finder
(function(){
    var baseF = new ItemStack(Material.WATCH, 1);
    var meta = baseF.getItemMeta();

    meta.setDisplayName(ChatColor.GOLD + 'Base finder');
    baseF.setItemMeta(meta);
    addRecipe(baseF, ['aba', 'bcb', 'aba'], {a: Material.DIAMOND, b: Material.GOLD_BLOCK, c: Material.REDSTONE_BLOCK});
})();

// Player tracker
(function(){
    var pTracker = new ItemStack(Material.COMPASS, 1);
    var meta = pTracker.getItemMeta();

    meta.setDisplayName(ChatColor.GOLD + 'Ped tracker');
    meta.setLore([ChatColor.WHITE + 'Default : no target']);
    pTracker.setItemMeta(meta);
    addRecipe(pTracker, ['aaa', 'aba', 'aaa'], {a: Material.DIAMOND, b: Material.IRON_BLOCK});
})();

// Player sticker
(function(){
    var pSticker = new ItemStack(Material.MAGMA_CREAM, 1);
    var meta = pSticker.getItemMeta();

    meta.setDisplayName(ChatColor.GOLD + 'Ped sticker');
    pSticker.setItemMeta(meta);
    addRecipe(pSticker, ['aba', 'bcb', 'aba'], {a: Material.IRON_NUGGET, b: Material.REDSTONE, c: Material.DIAMOND});
})();

// Book of Purification
(function(){
    var pBook = new ItemStack(Material.BOOK, 1);
    var meta = pBook.getItemMeta();

    meta.setDisplayName(ChatColor.GOLD + 'Book of Purification');
    pBook.setItemMeta(meta);
    addRecipe(pBook, ['abb', 'acb', 'abb'], {a: Material.BLAZE_ROD, b: Material.PAPER, c: Material.EYE_OF_ENDER});
})();



// Player profile

var createProfile = require('claim-module').createProfile;

events.playerJoin(function(e){
    reload();
    createProfile(players, e.player.name);
    if (players[e.player.name].invites[0]){
        echo(e.player, 'You have ' + players[e.player.name].invites.length + ' invites waiting : ' + players[e.player.name].invites.join(' '));
    }
    save();
})


var setHome = require('claim-module').setHome, delHome = require('claim-module').delHome, tpHome = require('claim-module').tpHome;

command('sethome', function(param, sender){
    reload();
    if (param[0]){
        setHome(players, sender, param[0], [sender.getLocation().getBlockX(), sender.getLocation().getBlockY(), sender.getLocation().getBlockZ()], sender.getLocation().getWorld().getEnvironment().getId());
    }
    else {
        echo(sender, 'You didn\'t provide any home name');
    }
    save()
})

command('delhome', function(param, sender){
    reload();
    if (param[0]){
        delHome(players, sender, param[0]);
    }
    else {
        echo(sender, 'You didn\'t provide any home name');
    }
    save();
})

command('home', function(param, sender){
    reload();
    if (param[0]){
        tpHome(players, sender, param[0]);
    }
    else {
        echo(sender, 'You didn\'t provide any home name');
    }
})



// Team commands

var createTeam = require('claim-module').createTeam, quitTeam = require('claim-module').quitTeam;

command('create', function(param, sender){
    reload();
    if (param[0] && param[1]){
        createTeam(teams, players, sender, param[0], param[1].toUpperCase());
    }
    else {
        echo(sender, 'Provide a team name and the team color');
    }
    save();
})

command('quit', function(param, sender){
    reload();
    quitTeam(teams, players, sender);
    save();
})


var invite = require('claim-module').invite, accept = require('claim-module').accept, decline = require('claim-module').decline;

command('invite', function(param, sender){
    reload();
    if (param[0]){
        invite(teams, players, sender, param[0]);
    }
    else {
        echo(sender, 'Provide a player name');
    }
    save();
})

command('accept', function(param, sender){
    reload();
    if (param[0]){
        accept(teams, players, sender, param[0]);
    }
    else {
        echo(sender, 'Provide the invite\'s team name');
    }
    save();
})

command('decline', function(param, sender){
    reload();
    if (param[0]){
        decline(teams, players, sender, param[0]);
    }
    else {
        echo(sender, 'Provide the invite\'s team name');
    }
    save();
})



// Claim

var getClaim = require('claim-module').getClaim, unclaim = require('claim-module').unclaim, tpBase = require('claim-module').tpBase;

command('claim', function(param, sender){
    reload();
    getClaim(teams, players, sender);
    save();
})

command('unclaim', function(param, sender){
    reload();
    unclaim(teams, players, sender);
    save();
})

command('base', function(param, sender){
    reload();
    tpBase(teams, players, sender);
})



// Events

events.playerDropItem(function(e){
    reload();
    var item = e.getItemDrop().getItemStack(), player = e.player;

    if (item.hasItemMeta() && item.getItemMeta().hasDisplayName()){

        if (item.getItemMeta().getDisplayName() === ChatColor[teams[players[player.name].team].color] + players[player.name].team){
            this.cancel();
            return;
        }

        // Player sticker
        if (item.getItemMeta().getDisplayName() === ChatColor.GOLD + 'Ped sticker'){
            if (!item.getItemMeta().hasLore()){
                this.cancel();
                echo(player, 'Init the sticker before dropping it');
            }
            else {
                e.getItemDrop().setPickupDelay(10);
            }
        }
    }
})


// Checks if the block is in the given area
function isInArea(center, radius, block){
    return ( block[0] >= center[0] - radius && block[0] <= center[0] + radius ) && ( block[1] >= center[1] - radius && block[1] <= center[1] + radius ) && ( block[2] >= center[2] - radius && block[2] <= center[2] + radius );
}

events.blockPlace(function(e){
    reload();
    var block = e.block, player = e.player, item = e.getItemInHand();

    if (player.getWorld().getEnvironment() == 'NORMAL'){

        // Spawn
        if (spawnProtection && isInArea(spawn, spawnRadius, [block.getX(), block.getY(), block.getZ()])){
            this.cancel();
            return;
        }

        // Claim areas
        for (var i in teams){
            if (teams[i].claim !== null && i !== players[player.name].team){
                if (isInArea(teams[i].claim.xyz, claimRadius, [block.getX(), block.getY(), block.getZ()])){
                    this.cancel();
                    echo(player, 'Do not touch "' + ChatColor[teams[i].color] + i + ChatColor.WHITE + '" \'s base >:-D');
                    return;
                }
            }
        }
    }

    // Init claim area
    if (players[player.name].team !== null && item.hasItemMeta() && item.getItemMeta().hasDisplayName() && item.getItemMeta().getDisplayName() === ChatColor[teams[players[player.name].team].color] + players[player.name].team){
        teams[players[player.name].team].claim = {
            xyz: [block.getX(), block.getY(), block.getZ()]
        }
        echo(player, 'Claim block placed');

        save();
    }
})


events.blockBreak(function(e){
    reload();
    var block = e.block, player = e.player;

    if (player.getWorld().getEnvironment() == 'NORMAL'){

        // Spawn
        if (spawnProtection && isInArea(spawn, spawnRadius, [block.getX(), block.getY(), block.getZ()])){
            this.cancel();
            return;
        }


        // Claim areas
        for (var i in teams){
            if (teams[i].claim !== null){
                if (i !== players[player.name].team){
                    if (isInArea(teams[i].claim.xyz, claimRadius, [block.getX(), block.getY(), block.getZ()])){
                        this.cancel();
                        echo(player, 'Do not touch "' + ChatColor[teams[i].color] + i + ChatColor.WHITE + '" \'s base >:-D');
                        return;
                    }
                }
                else if ( block.getX() === teams[i].claim.xyz[0] && block.getY() === teams[i].claim.xyz[1] && block.getZ() === teams[i].claim.xyz[2] ){     // Claim blocks
                    this.cancel();
                    echo(player, 'You can\'t break your own claim block, try /unclaim');
                    return;
                }
            } 
        }
    }
})


events.projectileLaunch(function(e){
    var player = e.entity.getShooter();

    // Explosive arrows
    if (player instanceof org.bukkit.entity.Player && e.entity.getType().toString() === 'SPECTRAL_ARROW'){
        var slot = player.getInventory().first(Material.SPECTRAL_ARROW);

        if (player.getInventory().getItem(slot).getItemMeta().hasDisplayName() && player.getInventory().getItem(slot).getItemMeta().getDisplayName() === ChatColor.GOLD + 'Explosive arrow'){
            e.entity.setCustomName('EXPLOSIVE_ARROW');
        }
    }
})


events.projectileHit(function(e){

    // Explosive arrows
    if (e.entity.getCustomName() === 'EXPLOSIVE_ARROW'){
        if (e.getHitBlock()){
            e.entity.getWorld().createExplosion(e.getHitBlock().getLocation(), 3);
        }
        else if (e.getHitEntity()){
            e.entity.getWorld().createExplosion(e.getHitEntity().getLocation(), 3);
        }
        e.entity.remove();
    }
})


// Return if the result is true / false based on the Y axis
function interference(n, y){
    if ( (y > 200 && n <= 85) || (y > 120 && n <= 70) || (y > 80 && n <= 60) || (y > 60 && n <= 50) || (y > 40 && n <= 35) || (y > 20 && n <= 25) || (y > 0 && n <= 20) ){
        return true;
    }
    else {
        return false
    }
}


events.playerInteract(function(e){

    // Base finder
    if (e.hasItem() && e.item.getItemMeta().hasDisplayName() && e.item.getItemMeta().getDisplayName() === ChatColor.GOLD + 'Base finder'){
        if (!BFcooldowns[e.player.name] && (e.action.toString() === 'LEFT_CLICK_AIR' || e.action.toString() === 'LEFT_CLICK_BLOCK') ){
            reload();
            var player = e.getPlayer(), loc = [player.getLocation().getBlockX(), player.getLocation().getBlockY(), player.getLocation().getBlockZ()];

            if ( interference(Math.random() * 100, loc[1]) ){
                var detect = '';

                for (var i in teams){
                    if (teams[i].claim !== null && (loc[0] >= teams[i].claim.xyz[0] - BFRadius && loc[0] <= teams[i].claim.xyz[0] + BFRadius) && (loc[2] >= teams[i].claim.xyz[2] - BFRadius && loc[2] <= teams[i].claim.xyz[2] + BFRadius) ){
                        detect += ChatColor[teams[i].color] + i + ' ';
                    }
                }
                if (detect === ''){
                    detect += 'nothing';
                }

                echo(player, '[BASE FINDER]  Detected : ' + detect);
            }
            else {
                var detect = '';

                for (var i in teams){
                    if (Math.random() * 10 > 5){
                        detect += ChatColor[teams[i].color] + i + ' ';
                    }
                }
                if (detect === ''){
                    detect += 'nothing';
                }

                echo(player, '[BASE FINDER]  Detected : ' + detect);
            }

            BFcooldowns[player.name] = true;
            setTimeout(function(){
                BFcooldowns[player.name] = false;
            }, BFcd);

            

        }
        // Use ressources instead of cooldown ?
        return;
    }

    // Book of Purification
    if (e.hasItem() && e.item.getItemMeta().hasDisplayName() && e.item.getItemMeta().getDisplayName() === ChatColor.GOLD + 'Book of Purification'){
        if (!BOOKcooldowns[e.player.name] && (e.action.toString() === 'RIGHT_CLICK_AIR' || e.action.toString() === 'RIGHT_CLICK_BLOCK') ){
            reload();
            var player = e.player;

            var trackers = [];
            for (var i in players){
                if (players[i].isTracking === player.name){
                    trackers.push(i);
                    players[i].isTracking = null;
                    if (tracking[i] !== null){
                        clearInterval(tracking[i]);
                        tracking[i] = null;
                    }
                }
            }

            save();

            if (trackers[0]){
                echo(player, 'You were tracked');
            }
            else {
                echo(player, 'Noone was tracking you');
            }

            BOOKcooldowns[player.name] = true;
            setTimeout(function(){
                BOOKcooldowns[player.name] = false;
            }, BOOKcd)
        }
    }
})


events.playerPickupItem(function(e){
    reload();
    var player = e.player, item = e.getItem().getItemStack();

    // Player sticker
    if (item.hasItemMeta() && item.getItemMeta().hasDisplayName() && item.getItemMeta().getDisplayName() === ChatColor.GOLD + 'Ped sticker' && item.getItemMeta().hasLore() && item.getItemMeta().getLore()[0] !== player.name){
        players[item.getItemMeta().getLore()[0]].isTracking = player.name;
        save();

        setTimeout(function(){
            player.getInventory().remove(item);
        }, 4000)
    }
})


events.playerItemHeld(function(e){
    reload();
    var player = e.player, item = e.player.getInventory().getItem(e.getNewSlot());

    // Player tracker
    if (item !== null && item.hasItemMeta() && item.getItemMeta().hasDisplayName() && item.getItemMeta().getDisplayName() === ChatColor.GOLD + 'Ped tracker'){

        var meta = item.getItemMeta();
        if (players[player.name].isTracking !== null && server.getPlayer(players[player.name].isTracking) !== null){

            meta.setLore([ChatColor.WHITE + 'Tracking : ' + players[player.name].isTracking])
            item.setItemMeta(meta);
            
            tracking[player.name] = setInterval(function(){
                player.setCompassTarget(server.getPlayer(players[player.name].isTracking).getLocation());
            }, 10000)
            save();
        }
        else {
            meta.setLore([ChatColor.WHITE + 'Default : no target'])
            item.setItemMeta(meta);
        }
        return;

    }
    else if (tracking[player.name] && tracking[player.name] !== null){

        clearInterval(tracking[player.name]);
        tracking[player.name] = null;
        save();
    }

    // Player sticker
    if (item !== null && item.hasItemMeta() && item.getItemMeta().hasDisplayName() && item.getItemMeta().getDisplayName() === ChatColor.GOLD + 'Ped sticker' && !item.getItemMeta().hasLore()){
        var meta = item.getItemMeta();
        meta.setLore([player.name]);
        item.setItemMeta(meta);
    }
})