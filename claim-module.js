// Global variable

var claimRadius = 8;
var maxHomes = 2;
var validColors = ['BLACK', 'BLUE', 'DARK_AQUA', 'DARK_BLUE', 'DARK_GRAY', 'DARK_GREEN', 'DARK_PURPLE', 'DARK_RED', 'GRAY', 'GREEN', 'LIGHT_PURPLE', 'WHITE', 'YELLOW'];

var ChatColor = org.bukkit.ChatColor;
var ItemStack = org.bukkit.inventory.ItemStack, Material = org.bukkit.Material;



// Useful functions

function colorData(color){
    switch(color){
        case 'WHITE':
            return 0;
        case 'DARK_PURPLE':
            return 2;
        case 'BLUE':
            return 3;
        case 'YELLOW':
            return 4;
        case 'GREEN':
            return 5;
        case 'LIGHT_PURPLE':
            return 6;
        case 'DARK_GRAY':
            return 7;
        case 'GRAY':
            return 8;
        case 'DARK_AQUA':
            return 9;
        case 'DARK_BLUE':
            return 11;
        case 'DARK_GREEN':
            return 13;
        case 'DARK_RED':
            return 14;
        case 'BLACK':
            return 15;
    }
}

function objectSize(obj){
    var size = 0;
    for (var i in obj){
        size++;
    }
    return size;
}

String.prototype.capitalize = function(){
    return this.charAt(0).toUpperCase() + this.slice(1)
}



// Recipes

function _addRecipe(item, shape, ingredients){
    var recipe = new org.bukkit.inventory.ShapedRecipe(item);
    recipe.shape(shape);
    for (var i in ingredients){
        recipe.setIngredient(i, ingredients[i]);
    }
    server.addRecipe(recipe);
}
exports.addRecipe = _addRecipe;



// Player profile

exports.createProfile = _createProfile; //✅
exports.setHome = _setHome;             //✅
exports.delHome = _delHome;             //✅
exports.tpHome = _tpHome;               //✅


function _createProfile(players, name){
    if (!players[name]){
        players[name] = {
            username: name,
            team: null,
            invites: [],
            homes: {},
            tracking: null
            // Combat mode
        }
    }
}


function _setHome(players, sender, name, xyz, dim){
    var username = sender.name;

    if (players[username].homes[name] || objectSize(players[username].homes) < maxHomes){
        players[username].homes[name] = {xyz: xyz, dim: dim};
        echo(sender, 'Home "' + name + '" set');
    }
    else {
        echo(sender, 'You have already ' + maxHomes + ' homes, delete one before setting a new one');
    }
}


function _delHome(players, sender, name){
    var username = sender.name;

    if (players[username].homes[name]){
        delete players[username].homes[name];
        echo(sender, 'Home "' + name + '" deleted');
    }
    else {
        echo(sender, 'You don\'t have any home named "' + name + '"');
    }
}


function _tpHome(players, sender, name){
    var username = sender.name;

    if (players[username].homes[name]){
        var loc = new org.bukkit.Location(server.getWorlds()[players[username].homes[name].dim], players[username].homes[name].xyz[0] + .5, players[username].homes[name].xyz[1], players[username].homes[name].xyz[2] + .5);
        sender.teleport(loc);
        echo(sender, 'Teleported to "' + name + '"');
    }
    else {
        echo(sender, 'You don\'t have any home named "' + name + '"');
    }
}



// Teams

exports.createTeam = _createTeam;   //✅
exports.invite = _invite;           //✅
exports.accept = _accept;           //✅
exports.decline = _decline;         //✅
exports.quitTeam = _quitTeam;       //✅


// Deletes the given team if there aren't any members remaining, also removes all the team invites
function deleteTeam(teams, players, name){

    if (!teams[name].members[0]){
        delete teams[name];
        for (var i in players){
            var index = players[i].invites.indexOf(name);
            if (index > -1){
                players[i].invites.splice(index, 1);
            }
        }
    }
}


function _createTeam(teams, players, sender, name, color){
    var username = sender.name;

    if (players[username].team === null){
        if (!teams[name] && validColors.indexOf(color) > -1){
            teams[name] = {
                teamname: name,
                color: color,
                members: [username],
                hasClaim: false,
                claim: null
            }
            players[username].team = name;
            echo(sender, 'Created the team "' + ChatColor[color] + name.split('_').join(' ') + ChatColor.WHITE + '"');
        }
        else {
            echo(sender, 'This team name is already taken or the color is not valid');    // See /jsp validcolors
        }
    }
    else {
        echo(sender, 'You have to leave your current team before creating a new one')
    }
}


function _invite(teams, players, sender, name){
    var username = sender.name;

    if (players[username].team !== null){
        if (players[name] && players[name].invites.indexOf(players[username].team) === -1){
            players[name].invites.push(players[username].team);

            echo(sender, 'You invited ' + name + ' in "' + ChatColor[teams[players[username].team].color] + players[username].team.split('_').join(' ') + ChatColor.WHITE + '"');
            if (server.getPlayer(name) !== null){
                echo(server.getPlayer(param[0]), sender.name + ' invited you in "' + ChatColor[teams[players[username].team].color] + players[username].team.split('_').join(' ') + ChatColor.WHITE + '"');
            }
        }
        else {
            echo(sender, 'This player does not exist or is already invited');
        }
    }
    else {
        echo(sender, 'You don\'t have any team');
    }
}


function _accept(teams, players, sender, name){
    var username = sender.name, index = players[username].invites.indexOf(name);

    if (index > -1){
        if (players[username].team !== null){
            teams[players[username].team].members.splice( teams[players[username].team].members.indexOf(username), 1 );     // Deletes from old team 'members'

            deleteTeam(teams, players, players[username].team);
        }
        teams[name].members.push(username);
        players[username].team = name;
        players[username].invites.splice(index, 1);  // Deletes the invite

        echo(sender, 'Joined "' + ChatColor[teams[name].color] + name.split('_').join(' ') + ChatColor.WHITE + '"');
    }
    else {
        echo(sender, 'You didn\'t received any invite from this team');
    }
}


function _decline(teams, players, sender, name){
    var username = sender.name, index = players[username].invites.indexOf(name);

    if (index > -1){
        players[username].invites.splice(index, 1);     // Deletes the invite

        echo(sender, 'You declined "' + ChatColor[teams[name].color] + name.split('_').join(' ') + ChatColor.WHITE + '" invite');
    }
    else {
        echo(sender, 'You didn\'t received any invite from this team');
    }
}


function _quitTeam(teams, players, sender){
    var username = sender.name;

    if (players[username].team !== null){
        teams[players[username].team].members.splice( teams[players[username].team].members.indexOf(username), 1 );
        echo(sender, 'You just left "' + ChatColor[teams[players[username].team].color] + players[username].team.split('_').join(' ') + ChatColor.WHITE + '" :\'(');    //  Underscores become spaces
        
        deleteTeam(teams, players, players[username].team);     // Delete the team if noone remaining

        players[username].team = null;
    }
    else {
        echo(sender, 'You don\'t have any team');
    }
}



// Claim

exports.getClaim = _getClaim;   //✅
exports.unclaim = _unclaim;     //✅
exports.tpBase = _tpBase;       //✅


function _getClaim(teams, players, sender){
    var name = players[sender.name].team

    if (name !== null){
        if (!teams[name].hasClaim && sender.getInventory().firstEmpty() !== -1){

            var block = new ItemStack(Material.CONCRETE, 1, colorData(teams[name].color));
            var meta = block.getItemMeta();

            meta.setDisplayName(ChatColor[teams[name].color] + name);
            meta.setLore([ChatColor.WHITE + 'Claims the area ' + (claimRadius * 2 + 1) + 'blocks', ChatColor.WHITE + 'around it ( square )']);
            block.setItemMeta(meta);
            sender.getInventory().addItem(block);

            teams[name].hasClaim = true;
            echo(sender, 'You got "' + ChatColor[teams[name].color] + name + ChatColor.WHITE + '" \'s claim block');
        }
        else {
            echo(sender, 'Your team already has a claim or your iventory is full');
        }
    }
    else {
        echo(sender, 'Join or create a team to perform this command');
    }
}


function _unclaim(teams, players, sender){
    var name = players[sender.name].team;

    if (name !== null && teams[name].hasClaim === true && teams[name].claim !== null){
        var loc = new org.bukkit.Location(server.getWorlds()[0], teams[name].claim.xyz[0], teams[name].claim.xyz[1], teams[name].claim.xyz[2]);
        loc.getBlock().breakNaturally(new ItemStack(Material.AIR));
        teams[name].claim = null;
        teams[name].hasClaim = false;

        echo(sender, 'Area successfully unclaimed');
    }
    else {
        echo(sender, 'You don\'t have any team or yours doesn\'t have any claim yet');
    }
}


function _tpBase(teams, players, sender){
    var name = players[sender.name].team;

    if (name !== null && teams[name].claim !== null){
        var shouldBeAir1 = new org.bukkit.Location(server.getWorlds()[0], teams[name].claim.xyz[0] + .5, teams[name].claim.xyz[1] + 1, teams[name].claim.xyz[2] + .5);
        var shouldBeAir2 = new org.bukkit.Location(server.getWorlds()[0], teams[name].claim.xyz[0], teams[name].claim.xyz[1] + 2, teams[name].claim.xyz[2]);

        if (shouldBeAir1.getBlock().getType() == 'AIR' && shouldBeAir2.getBlock().getType() == 'AIR'){
            sender.teleport(shouldBeAir1);

            echo('Teleported to "' + ChatColor[teams[name].color] + name + ChatColor.WHITE + '" \'s base');
        }
        else {
            echo(sender, 'Something is blocking the tp, the blocks over the claim block should be air');
        }
    }
    else {
        echo(sender, 'You don\'t have any team or yours doesn\'t have any claim yet');
    }
}