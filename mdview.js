#!/bin/env node

var blessed = require('blessed');

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
        content: cont,
        keys: true,
        tags: true,
        parent: screen,
        scrollbar: {bg: 'white'},
        grabKeys: true,
        alwaysScroll: true
    });

    box.focus();

    screen.append(box);

    // Render the screen.
    screen.render();
}

// Create some example content
var c = '';
for(var i = 0; i < 100; i++) {
    c += 'Test {blue-fg}' + i + '{/blue-fg}\n';
}

mainBox(c);