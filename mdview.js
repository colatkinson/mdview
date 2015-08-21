#!/bin/env node
var blessed = require('blessed');
var fs = require('fs');
var htmlToText = require('html-to-text');
var marked = require('marked');

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});

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

// Convert the Markdown data to
function convertMD(data) {
    var html = marked(data);
    var txt = htmlToText.fromString(html, {tables: true});
    return txt;
}

var buf = fs.readFileSync('test_files/fantasy2015.md', {encoding: 'utf8'});

mainBox(convertMD(buf));