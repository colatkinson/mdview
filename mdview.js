#!/bin/env node
var blessed = require('blessed');
var fs = require('fs');
var htmlToText = require('html-to-text');
var marked = require('marked');
var program = require('commander');

program
    .version(require('./package.json').version)
    .description('An simple command line markdown viewer')
    .usage('<file>')
    .parse(process.argv);

var renderer = new marked.Renderer();

var ITALIC_COLOR = 'blue';

renderer.heading = function (text, level) {
    var tags = [['bold'],
                [ITALIC_COLOR + '-fg'],
                ['center', 'bold'],
                ['center', ITALIC_COLOR + '-fg'],
                ['underline'],
                ['center', 'underline']
               ];
    var opening = '';
    var closing = '';
    for(var i = 0; i < tags[level - 1].length; i++) {
        opening += '{' + tags[level - 1][i] + '}';
        closing = '{/' + tags[level - 1][i] + '}' + closing;
    }
    return opening + '<h' + level + '>' + text + '</h' + level + '>' + closing + '<br />';
};

renderer.link = function(href, title, text) {
    return '{underline}{cyan-fg}' + href + '{/cyan-fg}{/underline}';
};

renderer.em = function(text) {
    return '{' + ITALIC_COLOR + '-fg}*' + text + '*{/' + ITALIC_COLOR + '-fg}';
};

renderer.strong = function(text) {
    return '{bold}' + text + '{/bold}';
};

renderer.del = function(text) {
    return '{gray-fg}' + text + '{/gray-fg}';
};

renderer.blockquote = function(quote) {
    return '{inverse}' + quote + '{/inverse}';
}

renderer.code = function(code, language) {
    return '{green-fg}<pre>' + code + '</pre>{/green-fg}';
}

renderer.hr = function() {
    return '{blue-bg}<br /><br />{/blue-bg}<br /><br />';
}

marked.setOptions({
  renderer: renderer,
  gfm: true,
  tables: true,
  breaks: true,
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
    var txt = htmlToText.fromString(html, {tables: true, wordwrap: false});
    return txt;
}

if(program.args.length != 1) {
    program.help();
}

var buf = fs.readFileSync(program.args[0], {encoding: 'utf8'});

mainBox(convertMD(buf));