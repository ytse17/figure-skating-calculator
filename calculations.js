//
// score_calc.js
//
////////////////////////////////////////////////////////////////

var result = {}

function initialize(){
    result = {
	displine: "Men", segment: "SP",
	elements: {
	    jumps: [],
	    spins: [],
	    stsq: [],
	    chsq: [],
	},
	components: {
	    "SS": {name: "Skating Skills"}
	},
	tes: { bv: 0, goesov: 0, score: 0, comment: ""}
    }
    rules = {}
    repetation_jump = {}
    for (var i = 2; i<=4; i++){   // yet:
	repetation_jump[i + "A"] = 0;
	repetation_jump[i + "Lz"] = 0;
	repetation_jump[i + "F"] = 0;
	repetation_jump[i + "Lo"] = 0;
	repetation_jump[i + "S"] = 0;
	repetation_jump[i + "T"] = 0;
    }
}
////////////////////////////////////////////////////////////////
// utils
function normalize_float(f){
    // return parseFloat(parseInt(f*100)/100);
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
function is_axel(jname){
    if (jname.charAt(1) == "A") { return true; } else { return false; }
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
  //jump.convertgoe = parseFloat(jump.goe) * 5/30

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
	    jump.goesov = jump.bv * jump.convertgoe;
	    jump.score = jump.bv + jump.goesov;
      if (jump.rep == "+REP") {jump.score -= (0.3 * parseFloat(bvsov[jname].bv))}
      if (jump.bonus == "x"){ jump.score *= 1.1; }
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
	    is_comb: (position == "CoSp2p" || position == "CoSp3p") ? true : false,
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
	    chsq.goesov = chsq.bv * chsq.goe * 5 / 21
	    chsq.score = normalize_float(parseFloat(chsq.bv) + parseFloat(chsq.goesov))
	}
	result.elements.chsq[i] = chsq;

	result.tes.bv += parseFloat(chsq.bv);
	result.tes.goesov += parseFloat(chsq.goesov);
	result.tes.score += parseFloat(chsq.score);
    }

    // result.elements.chsq[1] = { name: getval("chsq", 1, ".name"), goe: getval("chsq", 1, ".goe") }

    // tes total
}
////////////////
// update

function update_element(type, i, elem){
    settext(type, i, ".name", elem.name);
    settext(type, i, ".bv", normalize_float(elem.bv));
    settext(type, i, ".goesov", normalize_float(elem.goesov));
    settext(type, i, ".score", normalize_float(elem.score));
    settext(type, i, ".comment", elem.comment);
}

function update_elements(){
    // jump
    for (var i=1; i<=8; i++){
	elem = result.elements.jumps[i];

	vis = ['', 'visible', 'visible', 'visible']
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
    // comment
    settext("tes_comment", "", "", result.tes.comment);
}

function enable_element(type, i){
    settext(type, i, ".comment", "");
    $("#" + type + i).css("background-color", "white");
}
function disable_element(type, i, comment){
    settext(type, i, ".comment", comment);
    $("#" + type + i).css("background-color", "lightgray");
}
function enable_all_elements(){
    for (var i=1; i<=8; i++){ enable_element("jump", i) }
    for (var i=1; i<=3; i++){ enable_element("spin", i) }
    for (var i=1; i<=1; i++){ enable_element("stsq", i) }
    for (var i=1; i<=1; i++){ enable_element("chsq", i) }
}

////////////////
//
function check_rules(){
    enable_all_elements();


    switch (result.segment){
    case "SP":
	// jump
	for (var i=4; i<=8; i++){
	    disable_element("jump", i);
	}
	// combination
	var cj = 0;
	var n_solo_axel = 0;
	for (var i=1; i<=3; i++){
	    // comb
	    elem = result.elements.jumps[i];
	    if (elem.num_jumps >= 3){ elem.comment = "* invalid combination jump fo SP"; }
	    if (elem.num_jumps >= 2){
		cj += 1;
		if (cj > 1){ elem.comment = "* too many combination" }
	    }
	    if (elem.is_comb){
		rev1 = rev(elem.executed[1].jname)
		rev2 = rev(elem.executed[2].jname)

		switch (result.displine){
		case "Men":
		    if ((rev1 == 2 && rev2 == 3) || (rev1 == 3 && rev2 == 2) ||
			(rev1 == 3 && rev2 == 3) ||
			(rev1 == 4 && rev2 == 2) || (rev1 == 2 && rev2 == 4) ||
			(rev1 == 4 && rev2 == 3) || (rev1 == 3 && rev2 == 4)){
		    } else {
			elem.comment = "* combination not suit"
		    }
		    break;
		case "Ladies":
		    if ((rev1 == 3 && rev2 == 2) || (rev1 == 2 && rev2 == 3) ||
			(rev1 == 3 && rev2 == 3)){
		    } else {
			elem.comment = "* combination not suit"
		    }
		    break;
		}
	    }

	    // axel
	    if (elem.type == "solo" && is_axel(elem.executed[1].jname)){
		rev1 = rev(elem.executed[1].jname)
		switch (result.displine){
		case "Men":
		    if (rev1 < 2){ elem.comment = "* invalid axel" } break;
		case "Ladies":
		    if (rev1 < 2 || rev1 > 3){ elem.comment = "* invalid axel" } break;
		}
		n_solo_axel += 1;
	    }

	}
	if (n_solo_axel == 0){ result.tes.comment += "* [JUMP] Axel jump required \n" }
	if (n_solo_axel > 1){ result.tes.comment += "* [JUMP] too many axel jump\n" }

	// spin
	var n_LSp = 0;
	var n_cf_single_position = 0;
	var n_ccosp = 0;
	var n_flying = 0;
	for (var i=1; i<=3; i++){
	    elem = result.elements.spins[i]
	    if (elem.bv == 0) break;
	    if (elem.position == "LSp") { n_LSp += 1 }
	    if (elem.flying && !elem.is_comb) { n_flying += 1 }
	    if (elem.changefoot && !elem.is_comb){ n_cf_single_position += 1}
	    if (elem.changefoot && elem.is_comb){ n_ccosp += 1 }
	}
	if (result.displine == "Ladies"){
	    if (n_LSp < 1){ result.tes.comment += "* [SPIN] LSp required for Ladies\n" }
	} else {
	    if (n_cf_single_position < 1){ result.tes.comment += "* [SPIN] Single Position w/changefoot Spin required for Men\n"}
	}
	if (n_flying < 1){ result.tes.comment += "* [SPIN] Flying Spin required\n" }
	if (n_ccosp < 1){ result.tes.comment += "* [SPIN] CCoSp required\n" }

	// chsq
	disable_element("chsq", 1);


	break;
    case "FS":
	// jump
	if (result.displine == "Ladies"){ disable_element("jump", 8); }
    }

}

function update_repetation_jump(){
    ar = ['A', 'Lz', 'F', 'Lo', 'S', 'T'];
    for (var i=2; i<=4; i++){
	len = ar.length;
	for (var j=0; j<len; j++){
	    // alert(".jr_" + i + ar[j])
	    settext("repetation_jump", "", ".jr_" + i + ar[j], repetation_jump[i + ar[j]]);
	}
    }
}
////////////////
// load

function load_score (){

    $('#category input[name=category]').val(['Men']);
    $('#segment input[name=segment]').val(['SP']);

    $('#jump1 .type').val("solo");
    $('#jump1 .first .jname').val("4S");
    $('#jump1 .goe').val("3");
    $('#jump2 .type').val("comb2");
    $('#jump2 .first .jname').val("4T");
    $('#jump2 .second .jname').val("3T");
    $('#jump2 .goe').val("3");
    $('#jump3 .type').val("solo");
    $('#jump3 .first .jname').val("3A");
    $('#jump3 .bonus').val("x");
    $('#jump3 .goe').val("3");

    $('#spin1 .flying').val('F');
    $('#spin1 .position').val('CSp');
    $('#spin1 .level').val('4');
    $('#spin1 .goe').val("3");
    $('#spin2 .changefoot').val('C');
    $('#spin2 .position').val('SSp');
    $('#spin2 .level').val('4');
    $('#spin2 .goe').val("3");
    $('#spin3 .changefoot').val('C');
    $('#spin3 .position').val('CoSp3p');
    $('#spin3 .level').val('4');
    $('#spin3 .goe').val("3");

    $('#stsq1 .sname').val('StSq4');
    $('#stsq1 .goe').val("3");

    recalc();
}

function recalc(){
    initialize();
    result.displine = $("input[name='displine']:checked").val();
    result.segment = $("input[name='segment']:checked").val();

    parse_elements();

    check_rules();
    update_elements();
    update_repetation_jump();
    // parse_components();

}
