var i_expect = [], my_attributes = {}, ENTITIES = {};

//generates xml like test0="&control;"
var entities_to_test= {
//	'ENTITY_NAME':	IS_VALID || [invalid_char_pos, invalid_char],
	'control0':		true,//This is a vanilla control.
	//entityStart
	'_uscore':		true,
	'#hash':		true,
	':colon': 		true,
	'-bad': 		[0, '-'],
	'.bad': 		[0, '.'],
	//general entity
	'u_score':		true,
	'd-ash':		true,
	'd.ot':			true,
	'all:_#-.':		true,
};

var xml_start = '<a test="&amp;" ',
	xml_end = '/>';

i_expect.push(['attribute', {name: 'test', value: '&'}]);
my_attributes['test'] = '&';

var ent_i=0;


for (entity in entities_to_test){
	var attrib_name = "test"+ent_i, attrib_value = "Testing "+entity;
	xml_start += attrib_name+'="'+'&';//add the first part to use in calculation below
	if (typeof entities_to_test[entity] == "object"){
		i_expect.push(['error', "Invalid character in entity name\nLine: 0\nColumn: "+(xml_start.length+entities_to_test[entity][0]+1)+"\nChar: "+entities_to_test[entity][1]]);
		i_expect.push(['attribute', {name: attrib_name, value: '&'+entity+';'}]);
		my_attributes[attrib_name] = '&'+entity+';';
	} else {
		ENTITIES[entity] = attrib_value;
		i_expect.push(['attribute', {name: attrib_name, value: attrib_value}]);
		my_attributes[attrib_name] = attrib_value;
	}

	xml_start += entity+';" ';
	ent_i++;
}

i_expect.push(['opentag', {'name':'a', attributes:my_attributes, isSelfClosing: true}]);
i_expect.push(['closetag', 'a']);

var parser = require(__dirname).test({
  strict: true,
  expect: i_expect
});

for (entity in entities_to_test){
	parser.ENTITIES[entity] = ENTITIES[entity];
}

parser.write(xml_start+xml_end).close();