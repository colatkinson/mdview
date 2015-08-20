#!/bin/env node
var blessed = require('blessed');
var fs = require('fs');
var md = require('markdown').markdown;

function mainBox(cont) {
    // Create a screen object.
    var screen = blessed.screen({
        smartCSR: true
    });

    screen.title = 'mdview';

    // Quit on Escape, q, or Control-C.
    screen.key(['escape', 'q', 'C-c'], function(ch, key) {
        return process.exit(0);
    });

    // Main box
    var box = blessed.box({
        scrollable: true,
        keys: true,
        tags: true,
        parent: screen,
        scrollbar: {bg: 'white'},
        grabKeys: true,
        alwaysScroll: true,
        content: cont
    });

    box.focus();

    screen.append(box);

    // Render the screen.
    screen.render();
}

function convertMD(data) {
    var p = md.parse(data);
    var val = '';
    for(var i = 1; i < p.length; i++) {
        var cur = p[i];
        switch(cur[0]) {
            case 'header':
                val += '{blue-fg}' + cur[2] + '{/blue-fg}\n';
                break;
            case 'numberlist':
                for(var j = 1; j < cur.length; j++) {
                    val += j + '. ' + cur[j][1] + '\n';
                }
                break;
            case 'para':
                if(cur.length > 2) {
                    for(var k = 1; k < cur.length; k++) {
                        if(cur[k].constructor === Array) {
                            if(cur[k][0] == 'link') {
                                val += cur[k][2] + ' (' + cur[k][1].href + ')';
                            }
                        } else {
                            val += cur[k];
                        }
                    }
                    break;
                }
            default:
                //arr.push([blessed.box, {tags:false, content: JSON.stringify(p[i][1])}]);
                // console.log('ey');
                val += cur[cur.length - 1] + '\n';
        }
    }
    return val;
}

// Create some example content
/*var c = '';
for(var i = 0; i < 100; i++) {
    c += 'Test {blue-fg}' + i + '{/blue-fg}\n';
}*/

var buf = fs.readFileSync('./fantasy2015.md', {encoding: 'utf8'});

mainBox(convertMD(buf));
//convertMD(buf);
