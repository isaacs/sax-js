/**
 * Test that `parser.tag` actually is the containing element of the current node.
 */
var sax = require('../lib/sax')
var tap = require('tap')

var containingTag = "container";
var modes = ["loose", "strict"];

/**
 * Types of nodes for which events are tested.
 */
var nodeTypes = [
    {
        name: "chardata", tag: false, events: ["text"],
        sample: function (value) { return value }
    },
    {
        name: "comment", tag: false, events: ["comment"],
        sample: function (value) { return "<!--" + value + "-->" }
    },
    {
        name: "cdsect", tag: false, events: ["cdata, opencdata, closecdata"],
        sample: function (value) { return "<![CDATA[" + value + "]]>" }
    },
    {
        name: "pi", tag: false, events: ["processinginstruction"],
        sample: function (value) { return "<?" + value + "?>" }
    },
    {
        name: "element", tag: true, events: ["opentag", "opentagstart", "closetag"],
        sample: function (value) { return "<" + value + "></" + value + ">" }
    },
];
/**
 * Create a sample xml chunk within a containing tag.
 * The result will look like this:
 * `<inTag>before between after</inTag>`
 * in which before, between and after are replaced with samples, e.g. (for chardata and comment):
 * `<inTag>data_1<!--between-->data_2</inTag>`.
 */
function createSimpleSample(typeBeforeAfter, typeInBetween) {
    var before = typeBeforeAfter.sample("data_1");
    var between = typeInBetween.sample("between");
    var after = typeBeforeAfter.sample("data_2");
    return "<" + containingTag + ">" + before + between + after + "</" + containingTag + ">";
}

/**
 * Executes actual test for a combination of mode, nodeBeforeAfter and nodeBetween using
 * `createSimpleSample` to create the xml chunk.
 */
function testContainingTagAvailableInNonTag(mode, nodeBeforeAfter, nodeBetween) {

    var xmlChunk = createSimpleSample(nodeBeforeAfter, nodeBetween);
    var expectedTag = mode === "loose" ? containingTag.toUpperCase() : containingTag;
    var expectedValues = ["data_1"];
    if (nodeBetween === nodeBeforeAfter) {
        expectedValues.push("between");
    }
    expectedValues.push("data_2");

    var parser = sax.parser(mode === "strict"); // loose mode or strict mode
    nodeBeforeAfter.events.forEach(function (event, index) {
        var iExpectedValueIndex = 0;
        parser["on" + event] = function (data) {
            // value correct
            if (index === 0) {
                var value = typeof data == 'object' ? data.name : data;
                var expectedValue = expectedValues[iExpectedValueIndex++];
                tap.equal(value, expectedValue, "on" + event + ": expected value (" + (iExpectedValueIndex - 1) + ") of " + nodeBeforeAfter.name + " to be '" + expectedValue + "', got '" + value + "' in " + mode + " mode" + ", chunk: " + xmlChunk);
            }
            // containing tag correct
            var tagName = parser.tag ? parser.tag.name : undefined;
            tap.equal(tagName, expectedTag, "on" + event + ": expected element '" + expectedTag + "', got '" + tagName + "' in " + mode + " mode " + (iExpectedValueIndex == 0 ? "before" : "after") + " " + nodeBetween.name + ", chunk: " + xmlChunk);
        }
    });
    parser.write(xmlChunk);
}

/**
 * Creates and runs test combinations for
 * - different modes (2)
 * - different types of nodes before and after (5)
 * - another type of node (5)
 * 
 * That makes 2*5*5 = 50 combinations, each one is tested for
 * - correct value
 * - correct containing tag
 * on all kind of events which may be emitted by the parser for the beofre/after node.
 * 
 * This results 120 tests (some cases are omitted because they do not make sense).
 */
modes.forEach(function (mode) {
    nodeTypes
        .filter(function (nodeType) { return !nodeType.tag })
        .forEach(function (nodeBeforeAfter) {
            nodeTypes
                .filter(function (nt) { return nodeBeforeAfter.name !== "chardata" || nt.name != "chardata" })
                .forEach(function (nodeBetween) {
                    testContainingTagAvailableInNonTag(mode, nodeBeforeAfter, nodeBetween);
                });
        });
});