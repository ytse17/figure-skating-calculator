//
// calculations.js
//
////////////////////////////////////////////////////////////////

var result = {}

function initialize(){
    result = {
	elements: {
	    jumps: [],
	    spins: [],
	    stsq: [],
	    chsq: [],
	},
	tes: { bv: 0, goesov: 0, score: 0}
    }
}

////////////////////////////////////////////////////////////////
// utils
function normalize_float(f){
    return parseFloat(f).toFixed(2)
}
function getval(category, num, selector){
    return $("#" + category + num + " " + selector).val() || "";
}
function gettext(category, num, selector){
    return $("#" + category + num + " " + selector).text();
}
function settext(category, num, selector, text){
    return $("#" + category + num + " " + selector).text(text);
}

// jump
function rev(jname){
    return jname.charAt(0)
}
function jname_wo_rev(jname){
    return jname.charAt(1) + jname.charAt(2);
}
function dg_jump(jname){
    r = rev(jname)
    if (r == 1){
	return "novalue"
    } else {
	dg_rev = r - 1
	return dg_rev + jname_wo_rev(jname);
    }
}
////////////////////////////////////////////////////////////////
// parse
//
function parse_elements(){
    result.tes.bv = result.tes.goesov = result.tes.score = 0;

    // jump
    for (var i=1; i<=8; i++){
	jump = {
	    type: "solo", is_comb: false, num_jumps: 1, executed: [], bv: 0, goesov: 0, score: 0
	}
	// type
	jump.type = getval("jump", i, ".type")

	if (jump.type != "solo"){
	    jump.is_comb = true;
	    if (jump.type == "comb2"){ jump.num_jumps = 2} else { jump.num_jumps = 3}
	}
	var ar = ["", "first", "second", "third"];
	for (var j=1; j<=3; j++){
	    each_jump = {
		jname: getval("jump", i, "." + ar[j] + " .jname"),
		edge: getval("jump", i, "." + ar[j] + " .edge"),
		ur: getval("jump", i, "." + ar[j] + " .ur")
	    }
	    // edge check; !/e shd apply only to Lz or F
	    jn = jname_wo_rev(each_jump.jname)
	    if (jn != "Lz"&& jn != "F"){ each_jump.edge = "" }

	    jump.executed[j] = each_jump;
	}
	// name
	var name = "";
	for (var j=1; j<= jump.num_jumps; j++){
	    if (j>1) name += "-"
	    name += jump.executed[j].jname + jump.executed[j].edge + jump.executed[j].ur
	}
	jump.name = name
	jump.bonus = getval("jump", i, ".bonus")
	jump.goe = getval("jump", i, ".goe")
  jump.rep = getval("jump", i, ".repeated")
  if (parseFloat(jump.goe) < -3) {jump.goe = -3}
  if (parseFloat(jump.goe) > 3) {jump.goe = 3}

	// bv
	var sum_bv = 0;
	var max_bv = 0;
	var max_bv_jname = "";

	for (var j=1; j<=jump.num_jumps; j++){
	    var jname = jump.executed[j].jname
	    if (bvsov[jname] === undefined) break;

	    var v = 0;
	    var bv = 0;

	    // downgrade
	    if (jump.executed[j].ur == "<<"){ jname = dg_jump(jname) }
	    if (jump.executed[j].ur == "<") v += 1
	    if (jump.executed[j].edge == "e") v += 1
	    switch (v){
	    case 0:
	    	bv = bvsov[jname].bv; break;
	    case 1:
		bv = bvsov[jname].v; break;
	    case 2:
		bv = bvsov[jname].v1; break;
	    }
	    bv = parseFloat(bv);

	    if (max_bv < bv) {  max_bv = bv; max_bv_jname = jname; }
	    sum_bv += parseFloat(bv);
	}

  //converting goe
  switch (max_bv_jname) {
  case "4A":
    jump.convertgoe = parseFloat(jump.goe) * 5/36; break;
  case "4Lz": case "4F": case "4Lo": case "4S": case "4T": case "3A":
    jump.convertgoe = parseFloat(jump.goe) * 5/30; break;
  case "3Lz": case "3F": case "3Lo": case "3S": case "3T":
    jump.convertgoe = parseFloat(jump.goe) * 5/21; break;
  case "2A":
    jump.convertgoe = parseFloat(jump.goe) * 5/15; break;
  case "2Lz": case "2F": case "2Lo":
    jump.convertgoe = parseFloat(jump.goe) * 5/9; break;
  case "1Lz": case "1F": case "1Lo": case "1S": case "1T": case "1A": case "2T": case "2S":
    jump.convertgoe = parseFloat(jump.goe) * 5/6; break;
}


	if (sum_bv > 0){
	    jump.bv = parseFloat(sum_bv);
	    jump.goesov = parseFloat(max_bv) * jump.convertgoe;
      if (isNaN(jump.goesov)) {jump.goesov = 0}
	    jump.score = jump.bv + jump.goesov;
      if (jump.rep == "+REP") {jump.score -= (0.3 * parseFloat(bvsov[jname].bv))}
      if (jump.bonus == "x"){ jump.score += (0.1 * jump.bv) }
	    result.tes.bv += jump.bv;
	    result.tes.goesov += jump.goesov;
	    result.tes.score += jump.score;
	}
	result.elements.jumps[i] = jump;
    }

    // spin
    for (var i=1; i<=3; i++){
	var flying = getval("spin", i, ".flying")
	var changefoot = getval("spin", i, ".changefoot")
	var position = getval("spin", i, ".position")
	var level = getval("spin", i, ".level");
	var name =  flying + changefoot + position + level;
	spin = {
	    name: name,
	    flying: (flying == "F") ? true : false,
	    changefoot: (changefoot == "C") ? true: false,
	    position: position, level: level,
	    is_comb: (position == "CoSp") ? true : false,
	    goe: getval("spin", i, ".goe"), bv: 0, goesov: 0, score: 0
	}

	// score
	if (! (bvsov[name] === undefined)){
	    spin.bv = parseFloat(bvsov[name].bv)
	    spin.goesov = spin.bv * spin.goe * 10/30
	    spin.score = spin.bv + spin.goesov
	}

	result.elements.spins[i] = spin;
	result.tes.bv += spin.bv;
	result.tes.goesov += spin.goesov;
	result.tes.score += spin.score;

    }
    // stsq
    for (var i=1; i<=1; i++){
	name = getval("stsq", i, ".sname");
	goe = getval("stsq", i, ".goe")
	stsq = { name: name, goe: goe, bv: 0, goesov: 0, score: 0 }

	if (! (bvsov[name] === undefined)){
	    stsq.bv = normalize_float(bvsov[name].bv)
	    stsq.goesov = stsq.bv * stsq.goe * 5 / 21
	    stsq.score = normalize_float(parseFloat(stsq.bv) + parseFloat(stsq.goesov))
	}
	result.elements.stsq[i] = stsq;

	result.tes.bv += parseFloat(stsq.bv);
	result.tes.goesov += parseFloat(stsq.goesov);
	result.tes.score += parseFloat(stsq.score)
    }
    // chsq
    for (var i=1; i<=1; i++){
	name = getval("chsq", i, ".cname")
	goe = getval("chsq", i, ".goe")
	chsq = { name: name, goe: goe , bv: 0, goesov: 0, score: 0}

	if (! (bvsov[name] === undefined)){
	    chsq.bv = normalize_float(bvsov[name].bv)
	    chsq.goesov = 5 * chsq.goe * 5 / 21
	    chsq.score = normalize_float(parseFloat(chsq.bv) + parseFloat(chsq.goesov))
	}
	result.elements.chsq[i] = chsq;

	result.tes.bv += parseFloat(chsq.bv);
	result.tes.goesov += parseFloat(chsq.goesov);
	result.tes.score += parseFloat(chsq.score);
    }
}
////////////////
// update

function update_element(type, i, elem){
    settext(type, i, ".name", elem.name);
    settext(type, i, ".bv", normalize_float(elem.bv));
    settext(type, i, ".goesov", normalize_float(elem.goesov));
    settext(type, i, ".score", normalize_float(elem.score));
}

function update_elements(){
    // jump
    for (var i=1; i<=8; i++){
	elem = result.elements.jumps[i];

	vis = ['', 'visible', 'visible', 'visible'];
	if (elem.num_jumps < 3) { vis[3] = 'hidden'; }
	if (elem.num_jumps < 2) { vis[2] = 'hidden'; }

	$("#jump" + i + " .first").css("visibility", vis[1]);
	$("#jump" + i + " .second").css("visibility", vis[2]);
	$("#jump" + i + " .third").css("visibility", vis[3]);

	update_element("jump", i, elem);
    }
    // spin
    for (var i=1; i<=3; i++){
	update_element("spin", i, result.elements.spins[i]);
    }
    // stsq
    for (var i=1; i<=1; i++){
	update_element("stsq", i, result.elements.stsq[i]);
    }
    // chsq
    for (var i=1; i<=1; i++){
	update_element("chsq", i, result.elements.chsq[i]);
    }
    // tes total
    settext("tes", "", ".bv", normalize_float(result.tes.bv));
    settext("tes", "", ".goesov", normalize_float(result.tes.goesov));
    settext("tes", "", ".score", normalize_float(result.tes.score));
}


function recalc(){
    initialize();
    parse_elements();
    update_elements();

}
