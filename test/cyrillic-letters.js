var
    sax = require("../lib/sax"),
    xml = '<?xml version="1.0" encoding="utf-8"?>' +
    '<xml xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://morpher.ru/">' +
    '<Р>узкой юбки</Р>' +
    '<Д>узкой юбке</Д>' +
    '<В>узкую юбку</В>' +
    '</xml>';

require(__dirname).test(
    {
        xml : xml,
        expect : [
            [ "processinginstruction", { name: 'xml', body: 'version="1.0" encoding="utf-8"' }],
            [ "attribute", { name : 'xmlns:xsd', value: 'http://www.w3.org/2001/XMLSchema' }],
            [ "attribute", { name: 'xmlns:xsi', value: 'http://www.w3.org/2001/XMLSchema-instance' }],
            [ "attribute", { name: 'xmlns', value: 'http://morpher.ru/' }],
            [ "opentag", { name: 'xml', attributes: 
                { 
                    'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
                    'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
                    'xmlns': 'http://morpher.ru/' 
                } }],
            [ "opentag", { name: 'Р' }]
        ],
        strict : true,
        opt : {}
    }
);